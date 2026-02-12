import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/server';
import { getTierForPriceId } from '@/lib/stripe/plans';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
const WEBHOOK_TIMESTAMP_TOLERANCE_SEC = 300;

function readUnixSeconds(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

function isoFromUnix(value: unknown): string | null {
  const ts = readUnixSeconds(value);
  return ts ? new Date(ts * 1000).toISOString() : null;
}

function subscriptionRecord(subscription: Stripe.Subscription): Record<string, unknown> {
  return subscription as unknown as Record<string, unknown>;
}

export async function POST(req: Request) {
  // 1. Read RAW body for signature verification
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  // 2. Verify Stripe signature + timestamp tolerance
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body, sig!, STRIPE_WEBHOOK_SECRET, WEBHOOK_TIMESTAMP_TOLERANCE_SEC
    );
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  const supabaseAdmin = createAdminClient();

  // 3. Atomic idempotency: claim this event
  const { data: claimed } = await supabaseAdmin
    .from('webhook_events')
    .upsert(
      { event_id: event.id, event_type: event.type, status: 'pending' },
      { onConflict: 'event_id', ignoreDuplicates: true }
    )
    .select('event_id');

  if (!claimed || claimed.length === 0) {
    const { data: existing } = await supabaseAdmin
      .from('webhook_events')
      .select('status, updated_at')
      .eq('event_id', event.id)
      .single();

    if (existing?.status === 'processed') {
      return new Response('Already processed', { status: 200 });
    }

    if (existing?.status === 'pending') {
      const ageMs = Date.now() - new Date(existing.updated_at).getTime();
      const STALE_THRESHOLD_MS = 5 * 60 * 1000;
      if (ageMs < STALE_THRESHOLD_MS) {
        return new Response('Processing in progress', { status: 409 });
      }
    }

    // Stale pending or failed — atomic reclaim via CAS
    const { data: reclaimed } = await supabaseAdmin
      .from('webhook_events')
      .update({ status: 'pending', updated_at: new Date().toISOString() })
      .eq('event_id', event.id)
      .eq('updated_at', existing!.updated_at)
      .in('status', ['failed', 'pending'])
      .select('event_id');

    if (!reclaimed || reclaimed.length === 0) {
      return new Response('Reclaim conflict', { status: 409 });
    }
  }

  // 4. Process event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as unknown as Stripe.Subscription;
        const priceId = subscription.items.data[0].price.id;
        const tier = getTierForPriceId(priceId) ?? 'free';

        let userId = session.metadata?.userId;
        if (!userId) {
          const customer = await stripe.customers.retrieve(session.customer as string);
          if (!customer.deleted) {
            userId = customer.metadata?.userId;
          }
        }
        if (!userId) {
          throw new Error(`checkout.session.completed missing userId for session ${session.id}`);
        }

        await supabaseAdmin.from('profiles').update({
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          subscription_tier: tier,
          subscription_status: subscription.status,
          current_period_start: isoFromUnix(subscriptionRecord(subscription).current_period_start),
          current_period_end: isoFromUnix(subscriptionRecord(subscription).current_period_end),
          cancel_at_period_end: Boolean(subscriptionRecord(subscription).cancel_at_period_end),
          builds_used_this_period: 0,
        }).eq('id', userId);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0].price.id;
        const tier = getTierForPriceId(priceId) ?? 'free';
        const customerId = subscription.customer as string;

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('current_period_start')
          .eq('stripe_customer_id', customerId)
          .single();

        const rawPeriodStart = readUnixSeconds(subscriptionRecord(subscription).current_period_start) ?? 0;
        const newPeriodStart = new Date(rawPeriodStart * 1000);
        const isNewPeriod = !profile?.current_period_start ||
          newPeriodStart > new Date(profile.current_period_start);

        await supabaseAdmin.from('profiles').update({
          subscription_tier: tier,
          subscription_status: subscription.status,
          current_period_start: newPeriodStart.toISOString(),
          current_period_end: isoFromUnix(subscriptionRecord(subscription).current_period_end),
          cancel_at_period_end: Boolean(subscriptionRecord(subscription).cancel_at_period_end),
          ...(isNewPeriod ? { builds_used_this_period: 0 } : {}),
        }).eq('stripe_customer_id', customerId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await supabaseAdmin.from('profiles').update({
          subscription_tier: 'free',
          subscription_status: 'canceled',
          stripe_subscription_id: null,
          current_period_start: null,
          current_period_end: null,
          cancel_at_period_end: false,
          builds_used_this_period: 0,
        }).eq('stripe_customer_id', subscription.customer as string);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await supabaseAdmin.from('profiles').update({
          subscription_status: 'past_due',
        }).eq('stripe_customer_id', invoice.customer as string);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceRecord = invoice as unknown as { subscription?: string | null };
        const subscriptionId = invoiceRecord.subscription || undefined;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId) as unknown as Stripe.Subscription;
          await supabaseAdmin.from('profiles').update({
            subscription_status: subscription.status,
            current_period_start: isoFromUnix(subscriptionRecord(subscription).current_period_start),
            current_period_end: isoFromUnix(subscriptionRecord(subscription).current_period_end),
            cancel_at_period_end: Boolean(subscriptionRecord(subscription).cancel_at_period_end),
          }).eq('stripe_customer_id', invoice.customer as string);
        }
        break;
      }
    }

    // 5. Mark event as processed
    await supabaseAdmin
      .from('webhook_events')
      .update({ status: 'processed', processed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('event_id', event.id);

    return new Response('ok', { status: 200 });
  } catch (err) {
    // 6. Mark event as failed
    console.error(`Webhook processing failed for ${event.id}:`, err);
    await supabaseAdmin
      .from('webhook_events')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('event_id', event.id);

    return new Response('Processing failed', { status: 500 });
  }
}
