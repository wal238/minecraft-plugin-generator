'use client';

import { useRouter } from 'next/navigation';
import type { SubscriptionTier } from '@/types';

interface AccountActionsProps {
  tier: SubscriptionTier;
}

export function AccountActions({ tier }: AccountActionsProps) {
  const router = useRouter();

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

  return (
    <div className="flex flex-wrap gap-4">
      <a href={builderUrl} className="mc-btn mc-btn-orange">
        GO TO BUILDER
      </a>
      {tier !== 'free' && (
        <button onClick={handleManageSubscription} className="mc-btn mc-btn-outline">
          MANAGE SUBSCRIPTION
        </button>
      )}
    </div>
  );
}
