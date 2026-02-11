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
    stripePriceIds: ['price_1SziI5GMuUp3wEans8AEvC3S', 'price_1SziIcGMuUp3wEaneZqtsRHs'],
  },
  pro: {
    name: 'Pro',
    limits: { plugins: -1, buildsPerPeriod: 20, maxEvents: -1, maxActions: -1,
              watermark: false, apiAccess: true, teamMembers: 5 },
    stripePriceIds: ['price_1SziHmGMuUp3wEanuA1XIRKT', 'price_1SziHmGMuUp3wEanTwRZjPq1'],
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
