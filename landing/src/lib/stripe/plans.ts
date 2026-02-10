import type { Plan, SubscriptionTier } from '@/types';

export const PLANS: Record<SubscriptionTier, Plan> = {
  free: {
    name: 'Freemium',
    limits: { plugins: 1, buildsPerPeriod: 1, maxEvents: 4, maxActions: 8,
              watermark: true, apiAccess: false, teamMembers: 0 },
    stripePriceIds: [],
  },
  premium: {
    name: 'Premium',
    limits: { plugins: -1, buildsPerPeriod: 5, maxEvents: 20, maxActions: 50,
              watermark: false, apiAccess: false, teamMembers: 0 },
    stripePriceIds: ['price_premium_monthly', 'price_premium_yearly'],
  },
  pro: {
    name: 'Pro',
    limits: { plugins: -1, buildsPerPeriod: 20, maxEvents: -1, maxActions: -1,
              watermark: false, apiAccess: true, teamMembers: 5 },
    stripePriceIds: ['price_pro_monthly', 'price_pro_yearly'],
  },
};

export const VALID_PRICE_IDS = new Set(
  Object.values(PLANS).flatMap(p => p.stripePriceIds)
);

export function getTierForPriceId(priceId: string): SubscriptionTier | null {
  for (const [tier, plan] of Object.entries(PLANS)) {
    if (plan.stripePriceIds.includes(priceId)) {
      return tier as SubscriptionTier;
    }
  }
  return null;
}
