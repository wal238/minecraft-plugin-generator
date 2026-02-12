import { createClient, createAdminClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';
import { VALID_PRICE_IDS } from '@/lib/stripe/plans';
import { validateOrigin } from '@/lib/csrf';
import { acquireIdempotencyLock, cacheIdempotencyResponse } from '@/lib/idempotency';
import { getDefaultBuilderUrl, isAllowedReturnTo } from '@/lib/redirects';

export async function POST(req: Request) {
  // 0. CSRF: Validate origin + Sec-Fetch-Site
  const csrfError = validateOrigin(req);
  if (csrfError) return csrfError;

  // 1. Verify authenticated user from Supabase session (server-side)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Duplicate-click guard
  const idempotencyKey = req.headers.get('idempotency-key');
  if (!idempotencyKey) {
    return Response.json({ error: 'Missing Idempotency-Key header' }, { status: 400 });
  }
  const lockResult = await acquireIdempotencyLock(user.id, idempotencyKey, 'checkout');
  if (lockResult.cached) {
    return Response.json(lockResult.cachedResponse);
  }
  if (lockResult.inFlight) {
    return Response.json({ error: 'Request already in progress' }, { status: 409 });
  }

  // 3. Read priceId from body, validate against server-side allowlist
  const { priceId, returnTo } = await req.json();
  if (!VALID_PRICE_IDS.has(priceId)) {
    return Response.json({ error: 'Invalid price' }, { status: 400 });
  }

  const safeReturnTo = typeof returnTo === 'string' && isAllowedReturnTo(returnTo)
    ? returnTo
    : getDefaultBuilderUrl();

  // 4. Get or create Stripe customer (userId from session, NOT from client)
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    // Update via admin client (bypasses RLS column restriction)
    const supabaseAdmin = createAdminClient();
    await supabaseAdmin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
  }

  // 5. Create checkout session — userId from server, not client
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${siteUrl}/checkout/success?return_to=${encodeURIComponent(safeReturnTo)}`,
    cancel_url: `${siteUrl}/#pricing`,
    metadata: { userId: user.id },
  });

  // Cache the response
  await cacheIdempotencyResponse(user.id, idempotencyKey, 'checkout', { url: session.url });

  return Response.json({ url: session.url });
}
