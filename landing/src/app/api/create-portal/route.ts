import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';
import { validateOrigin } from '@/lib/csrf';
import { acquireIdempotencyLock, cacheIdempotencyResponse } from '@/lib/idempotency';

export async function POST(req: Request) {
  const csrfError = validateOrigin(req);
  if (csrfError) return csrfError;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const idempotencyKey = req.headers.get('idempotency-key');
  if (!idempotencyKey) {
    return Response.json({ error: 'Missing Idempotency-Key header' }, { status: 400 });
  }

  const lockResult = await acquireIdempotencyLock(user.id, idempotencyKey, 'portal');
  if (lockResult.cached) {
    return Response.json(lockResult.cachedResponse);
  }
  if (lockResult.inFlight) {
    return Response.json({ error: 'Request already in progress' }, { status: 409 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return Response.json({ error: 'No subscription found' }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${siteUrl}/account`,
  });

  await cacheIdempotencyResponse(user.id, idempotencyKey, 'portal', { url: session.url });

  return Response.json({ url: session.url });
}
