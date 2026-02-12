'use client';

import { useState } from 'react';
import { MinecraftCard } from '@/components/ui/MinecraftCard';
import { MinecraftButton } from '@/components/ui/MinecraftButton';
import { PricingToggle } from '@/components/ui/PricingToggle';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { useUser } from '@/hooks/useUser';
import { PLANS } from '@/lib/stripe/plans';
import { getDefaultBuilderUrl, isAllowedReturnTo } from '@/lib/redirects';

interface PlanFeature {
  label: string;
  included: boolean;
}

interface PricingPlan {
  tier: string;
  headerColor: string;
  monthlyPrice: string;
  yearlyPrice: string;
  priceSuffix: { monthly: string; yearly: string };
  yearlySavings: string | null;
  features: PlanFeature[];
  buttonVariant: 'outline' | 'green' | 'orange';
  buttonLabel: string;
  highlighted: boolean;
}

const plans: PricingPlan[] = [
  {
    tier: 'STARTER',
    headerColor: 'var(--mc-orange)',
    monthlyPrice: '$0',
    yearlyPrice: '$0',
    priceSuffix: { monthly: '/forever', yearly: '/forever' },
    yearlySavings: null,
    features: [
      { label: '1 Project', included: true },
      { label: '1 Build/Month', included: true },
      { label: '4 Events', included: true },
      { label: '8 Actions', included: true },
      { label: 'Custom Commands', included: true },
      { label: 'Cloud Builds', included: true },
      { label: 'Community Support', included: true },
      { label: 'Custom GUIs', included: false },
      { label: 'Boss Bars & Scoreboards', included: false },
    ],
    buttonVariant: 'outline',
    buttonLabel: 'GET STARTED',
    highlighted: false,
  },
  {
    tier: 'PREMIUM',
    headerColor: 'var(--mc-green)',
    monthlyPrice: '$4.99',
    yearlyPrice: '$49.99',
    priceSuffix: { monthly: '/mo', yearly: '/yr' },
    yearlySavings: 'Save $10/yr',
    features: [
      { label: 'Unlimited Projects', included: true },
      { label: '5 Builds/Month', included: true },
      { label: '20 Events', included: true },
      { label: '50 Actions', included: true },
      { label: 'Custom GUIs', included: true },
      { label: 'Boss Bars & Scoreboards', included: true },
      { label: 'Cloud Builds', included: true },
      { label: 'Config Persistence', included: true },
      { label: 'No Watermark', included: true },
      { label: 'Priority Support', included: true },
    ],
    buttonVariant: 'green',
    buttonLabel: 'GO PREMIUM',
    highlighted: true,
  },
  {
    tier: 'PRO',
    headerColor: 'var(--mc-yellow)',
    monthlyPrice: '$9.99',
    yearlyPrice: '$99.99',
    priceSuffix: { monthly: '/mo', yearly: '/yr' },
    yearlySavings: 'Save $20/yr',
    features: [
      { label: 'Everything in Premium', included: true },
      { label: '20 Builds/Month', included: true },
      { label: 'Unlimited Events', included: true },
      { label: 'Unlimited Actions', included: true },
      { label: 'Cloud Builds', included: true },
      { label: 'Priority Support', included: true },
    ],
    buttonVariant: 'orange',
    buttonLabel: 'GO PRO',
    highlighted: false,
  },
];

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const { user } = useUser();

  const getPriceIdForTier = (tier: string, yearly: boolean): string | null => {
    const key = tier.toLowerCase() as keyof typeof PLANS;
    const ids = PLANS[key]?.stripePriceIds;
    if (!ids || ids.length === 0) return null;
    if (yearly && ids[1]) return ids[1];
    return ids[0] || null;
  };

  const handlePaidCheckout = async (tier: string) => {
    const priceId = getPriceIdForTier(tier, isYearly);
    if (!priceId) return;

    const currentUrl = new URL(window.location.href);
    const fromBuilder = currentUrl.searchParams.get('source') === 'builder';
    const rawReturnTo = currentUrl.searchParams.get('return_to') || '';
    const returnTo = fromBuilder && isAllowedReturnTo(rawReturnTo)
      ? rawReturnTo
      : getDefaultBuilderUrl();

    if (!user) {
      const loginRedirect = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      window.location.assign(loginRedirect);
      return;
    }

    setLoadingTier(tier);
    try {
      const idempotencyKey = crypto.randomUUID();
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({ priceId, returnTo }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to start checkout');
      }
      if (data?.url) {
        window.location.assign(data.url);
        return;
      }
      throw new Error('Checkout URL missing in response');
    } catch (err) {
      console.error('Checkout start failed:', err);
      window.alert(err instanceof Error ? err.message : 'Failed to start checkout');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <section id="pricing" className="section">
      <AnimatedSection>
        <h2 className="section-title" style={{ color: 'var(--text-primary)' }}>
          CHOOSE YOUR PLAN
        </h2>
      </AnimatedSection>

      <PricingToggle isYearly={isYearly} onToggle={() => setIsYearly((prev) => !prev)} />

      <AnimatedSection stagger>
        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{
            gap: '1.5rem',
            alignItems: 'stretch',
          }}
        >
          {plans.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const suffix = isYearly ? plan.priceSuffix.yearly : plan.priceSuffix.monthly;
            const showSavings = isYearly && plan.yearlySavings;

            return (
              <MinecraftCard key={plan.tier} highlighted={plan.highlighted} className="flex flex-col">
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    padding: '0.5rem 0',
                    flex: 1,
                  }}
                >
                  {/* Tier name */}
                  <h3
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '0.85rem',
                      color: plan.headerColor,
                      textAlign: 'center',
                    }}
                  >
                    {plan.tier}
                  </h3>

                  {/* Price */}
                  <div style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {price}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9rem',
                        color: 'var(--text-muted)',
                        marginLeft: '0.25rem',
                      }}
                    >
                      {suffix}
                    </span>

                    {/* Yearly savings badge */}
                    {showSavings && (
                      <div
                        style={{
                          marginTop: '0.5rem',
                          display: 'inline-block',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--font-pixel)',
                            fontSize: '0.5rem',
                            background: 'var(--mc-green)',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            display: 'inline-block',
                          }}
                        >
                          {plan.yearlySavings}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div
                    style={{
                      height: 1,
                      background: 'rgba(255, 255, 255, 0.08)',
                      width: '100%',
                    }}
                  />

                  {/* Features */}
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    {plan.features.map((feature) => (
                      <li
                        key={feature.label}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.9rem',
                          color: feature.included
                            ? 'var(--text-secondary)'
                            : 'var(--text-muted)',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--font-pixel)',
                            fontSize: '0.6rem',
                            color: feature.included
                              ? 'var(--mc-green)'
                              : 'var(--text-muted)',
                            flexShrink: 0,
                            width: '1rem',
                            textAlign: 'center',
                          }}
                        >
                          {feature.included ? '\u2713' : '\u2717'}
                        </span>
                        {feature.label}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                    {plan.tier === 'STARTER' ? (
                      <MinecraftButton
                        variant={plan.buttonVariant}
                        href="/signup"
                        className="w-full"
                      >
                        {plan.buttonLabel}
                      </MinecraftButton>
                    ) : (
                      <MinecraftButton
                        variant={plan.buttonVariant}
                        className="w-full"
                        loading={loadingTier === plan.tier}
                        onClick={() => handlePaidCheckout(plan.tier)}
                      >
                        {plan.buttonLabel}
                      </MinecraftButton>
                    )}
                  </div>
                </div>
              </MinecraftCard>
            );
          })}
        </div>
      </AnimatedSection>
    </section>
  );
}
