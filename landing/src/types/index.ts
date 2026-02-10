export type SubscriptionTier = 'free' | 'premium' | 'pro';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid' | 'paused';

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  stripe_customer_id: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  builds_used_this_period: number;
  build_period_start: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  config: Record<string, unknown>;
  version: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface TierLimits {
  plugins: number;        // -1 = unlimited
  buildsPerPeriod: number;
  maxEvents: number;      // -1 = unlimited
  maxActions: number;     // -1 = unlimited
  watermark: boolean;
  apiAccess: boolean;
  teamMembers: number;
}

export interface Plan {
  name: string;
  limits: TierLimits;
  stripePriceIds: string[];
}
