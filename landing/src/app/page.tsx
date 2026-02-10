import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { PricingSection } from '@/components/landing/PricingSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FAQ } from '@/components/landing/FAQ';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export const metadata = {
  title: 'MC Plugin Builder — Create Minecraft Plugins Without Code',
  description:
    'Drag-and-drop Minecraft plugin builder for Paper 1.21.1. No Java knowledge required. Build, generate, and download production-ready plugins.',
};

/* ------------------------------------------------------------------ */
/*  Feature Comparison Table                                          */
/* ------------------------------------------------------------------ */

const comparisonRows: { feature: string; starter: string; premium: string; pro: string }[] = [
  { feature: 'Projects', starter: '1', premium: 'Unlimited', pro: 'Unlimited' },
  { feature: 'Builds per Month', starter: '1', premium: '5', pro: '20' },
  { feature: 'Max Events', starter: '4', premium: '20', pro: 'Unlimited' },
  { feature: 'Max Actions', starter: '8', premium: '50', pro: 'Unlimited' },
  { feature: 'Custom Commands', starter: '\u2713', premium: '\u2713', pro: '\u2713' },
  { feature: 'Custom GUIs', starter: '\u2717', premium: '\u2713', pro: '\u2713' },
  { feature: 'Boss Bars', starter: '\u2717', premium: '\u2713', pro: '\u2713' },
  { feature: 'Scoreboards', starter: '\u2717', premium: '\u2713', pro: '\u2713' },
  { feature: 'Config Persistence', starter: '\u2717', premium: '\u2713', pro: '\u2713' },
  { feature: 'API Access', starter: '\u2717', premium: '\u2717', pro: '\u2713' },
  { feature: 'Team Members', starter: '0', premium: '0', pro: '5' },
  { feature: 'Watermark', starter: 'Yes', premium: 'No', pro: 'No' },
  { feature: 'Support', starter: 'Community', premium: 'Priority', pro: 'Priority' },
];

function FeatureComparison() {
  const checkColor = 'var(--mc-green)';
  const crossColor = 'var(--text-muted)';

  function cellStyle(value: string): React.CSSProperties {
    if (value === '\u2713') return { color: checkColor, fontFamily: 'var(--font-pixel)', fontSize: '0.65rem' };
    if (value === '\u2717') return { color: crossColor, fontFamily: 'var(--font-pixel)', fontSize: '0.65rem' };
    return { color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: '0.85rem' };
  }

  return (
    <section className="section">
      <AnimatedSection>
        <h2 className="section-title" style={{ color: 'var(--text-primary)' }}>
          COMPARE PLANS
        </h2>
      </AnimatedSection>

      <AnimatedSection>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: 520,
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.6rem',
                    color: 'var(--text-muted)',
                    textAlign: 'left',
                    padding: '1rem 0.75rem',
                    borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  Feature
                </th>
                <th
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.6rem',
                    color: 'var(--mc-orange)',
                    textAlign: 'center',
                    padding: '1rem 0.75rem',
                    borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  Starter
                </th>
                <th
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.6rem',
                    color: 'var(--mc-green)',
                    textAlign: 'center',
                    padding: '1rem 0.75rem',
                    borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  Premium
                </th>
                <th
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.6rem',
                    color: 'var(--mc-yellow)',
                    textAlign: 'center',
                    padding: '1rem 0.75rem',
                    borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  Pro
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.feature}>
                  <td
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      padding: '0.75rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    {row.feature}
                  </td>
                  <td
                    style={{
                      textAlign: 'center',
                      padding: '0.75rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      ...cellStyle(row.starter),
                    }}
                  >
                    {row.starter}
                  </td>
                  <td
                    style={{
                      textAlign: 'center',
                      padding: '0.75rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      ...cellStyle(row.premium),
                    }}
                  >
                    {row.premium}
                  </td>
                  <td
                    style={{
                      textAlign: 'center',
                      padding: '0.75rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      ...cellStyle(row.pro),
                    }}
                  >
                    {row.pro}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimatedSection>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <FeaturesGrid />
      <PricingSection />
      <FeatureComparison />
      <HowItWorks />
      <FAQ />
      <FinalCTA />
      <Footer />
    </>
  );
}
