'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PLANS } from '@/lib/stripe/plans';
import type { Profile, SubscriptionTier } from '@/types';

export function useSubscription(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
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
        setLoading(false);
      });
  }, [userId]);

  const tier = (profile?.subscription_tier ?? 'free') as SubscriptionTier;
  const limits = PLANS[tier].limits;
  const buildsUsed = profile?.builds_used_this_period ?? 0;
  const buildsLimit = limits.buildsPerPeriod;

  return { profile, loading, tier, limits, buildsUsed, buildsLimit };
}
