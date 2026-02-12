'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PLANS } from '@/lib/stripe/plans';
import type { Profile, SubscriptionTier } from '@/types';

export function useSubscription(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setProfile(data as Profile);
        }
        setLoadedUserId(userId);
      });
  }, [userId]);

  const effectiveProfile = userId ? profile : null;
  const tier = (effectiveProfile?.subscription_tier ?? 'free') as SubscriptionTier;
  const limits = PLANS[tier].limits;
  const buildsUsed = effectiveProfile?.builds_used_this_period ?? 0;
  const buildsLimit = limits.buildsPerPeriod;
  const effectiveLoading = userId ? loadedUserId !== userId : false;

  return { profile: effectiveProfile, loading: effectiveLoading, tier, limits, buildsUsed, buildsLimit };
}
