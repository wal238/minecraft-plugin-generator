'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getDefaultBuilderUrl, isAllowedReturnTo } from '@/lib/redirects';

const MAX_POLLS = 15;
const POLL_MS = 2000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function CheckoutSuccessPage() {
  const [statusText, setStatusText] = useState('Finalizing your upgrade...');
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const params = new URLSearchParams(window.location.search);
      const requestedReturn = params.get('return_to');
      const returnTo = requestedReturn && isAllowedReturnTo(requestedReturn)
        ? requestedReturn
        : getDefaultBuilderUrl();

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const loginUrl = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        window.location.assign(loginUrl);
        return;
      }

      let upgraded = false;
      for (let i = 0; i < MAX_POLLS; i += 1) {
        if (cancelled) return;
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', session.user.id)
          .maybeSingle();
        if (profile?.subscription_tier && profile.subscription_tier !== 'free') {
          upgraded = true;
          break;
        }
        await sleep(POLL_MS);
      }

      setStatusText(upgraded ? 'Upgrade complete. Redirecting to builder...' : 'Upgrade processing. Redirecting to builder...');
      const handoffResponse = await fetch('/api/handoff/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
        }),
      });
      const handoffData = await handoffResponse.json();
      if (!handoffResponse.ok || !handoffData?.code) {
        window.location.assign(`${returnTo}${returnTo.includes('?') ? '&' : '?'}checkout=${upgraded ? 'success' : 'pending'}`);
        return;
      }

      const url = new URL(returnTo);
      url.searchParams.set('handoff_code', handoffData.code);
      url.searchParams.set('checkout', upgraded ? 'success' : 'pending');
      window.location.assign(url.toString());
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="mc-card w-full max-w-lg p-8 text-center">
        <h1 className="font-pixel text-xl mb-5" style={{ color: 'var(--mc-orange)' }}>
          CHECKOUT SUCCESS
        </h1>
        <p style={{ color: 'var(--text-primary)' }}>{statusText}</p>
      </div>
    </div>
  );
}
