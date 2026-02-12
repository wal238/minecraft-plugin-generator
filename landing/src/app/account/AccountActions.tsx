'use client';

import { createClient } from '@/lib/supabase/client';
import type { SubscriptionTier } from '@/types';

interface AccountActionsProps {
  tier: SubscriptionTier;
}

export function AccountActions({ tier }: AccountActionsProps) {
  const handleManageSubscription = async () => {
    const idempotencyKey = crypto.randomUUID();
    const res = await fetch('/api/create-portal', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  const builderUrl = process.env.NEXT_PUBLIC_BUILDER_URL || 'http://localhost:5173';
  const supabase = createClient();

  const getSessionForHandoff = async () => {
    let { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const refreshed = await supabase.auth.refreshSession();
      session = refreshed.data.session;
    }
    return session;
  };

  const handleGoToBuilder = async () => {
    const url = new URL(builderUrl);
    const session = await getSessionForHandoff();
    if (session?.access_token && session?.refresh_token) {
      url.searchParams.set('access_token', session.access_token);
      url.searchParams.set('refresh_token', session.refresh_token);
      url.searchParams.set('handoff', '1');
    }
    window.location.href = url.toString();
  };

  return (
    <div className="flex flex-wrap gap-4">
      <button onClick={handleGoToBuilder} className="mc-btn mc-btn-orange">
        GO TO BUILDER
      </button>
      {tier !== 'free' && (
        <button onClick={handleManageSubscription} className="mc-btn mc-btn-outline">
          MANAGE SUBSCRIPTION
        </button>
      )}
    </div>
  );
}
