'use client';

import type { SubscriptionTier } from '@/types';
import { createHandoffCodeForCurrentSession } from '@/lib/handoff-client';

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

  const handleGoToBuilder = async () => {
    const url = new URL(builderUrl);
    const code = await createHandoffCodeForCurrentSession();
    if (code) {
      url.searchParams.set('handoff_code', code);
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
