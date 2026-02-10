import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PLANS } from '@/lib/stripe/plans';
import type { Profile, SubscriptionTier } from '@/types';
import { AccountActions } from './AccountActions';

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const tier = ((profile as Profile | null)?.subscription_tier ?? 'free') as SubscriptionTier;
  const plan = PLANS[tier];
  const buildsUsed = (profile as Profile | null)?.builds_used_this_period ?? 0;

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-pixel text-2xl mb-8" style={{ color: 'var(--mc-orange)' }}>
          MY ACCOUNT
        </h1>

        {/* Plan Info */}
        <div className="mc-card mb-6">
          <h2 className="font-pixel text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            CURRENT PLAN
          </h2>
          <div className="flex items-center justify-between mb-4">
            <span className="font-pixel text-lg" style={{ color: tier === 'pro' ? 'var(--mc-yellow)' : tier === 'premium' ? 'var(--mc-green)' : 'var(--text-primary)' }}>
              {plan.name}
            </span>
            {tier === 'free' && (
              <a href="/#pricing" className="mc-btn mc-btn-green text-xs py-2 px-4">
                UPGRADE
              </a>
            )}
          </div>

          {/* Usage Stats */}
          <div className="space-y-3 mt-6">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: 'var(--text-secondary)' }}>Builds this period</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {buildsUsed} / {plan.limits.buildsPerPeriod === -1 ? '∞' : plan.limits.buildsPerPeriod}
                </span>
              </div>
              <div className="w-full h-2" style={{ background: 'var(--bg-primary)' }}>
                <div
                  className="h-full transition-all"
                  style={{
                    width: plan.limits.buildsPerPeriod === -1
                      ? '10%'
                      : `${Math.min(100, (buildsUsed / plan.limits.buildsPerPeriod) * 100)}%`,
                    background: 'var(--mc-green)',
                  }}
                />
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Max Events per Plugin</span>
              <span style={{ color: 'var(--text-primary)' }}>
                {plan.limits.maxEvents === -1 ? 'Unlimited' : plan.limits.maxEvents}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Max Actions per Plugin</span>
              <span style={{ color: 'var(--text-primary)' }}>
                {plan.limits.maxActions === -1 ? 'Unlimited' : plan.limits.maxActions}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Projects</span>
              <span style={{ color: 'var(--text-primary)' }}>
                {plan.limits.plugins === -1 ? 'Unlimited' : plan.limits.plugins}
              </span>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="mc-card mb-6">
          <h2 className="font-pixel text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            ACCOUNT
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Email</span>
              <span style={{ color: 'var(--text-primary)' }}>{user.email}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <AccountActions tier={tier} />
      </div>
    </div>
  );
}
