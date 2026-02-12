import type { Metadata } from 'next';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { PricingSection } from '@/components/landing/PricingSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FAQ } from '@/components/landing/FAQ';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'MC Plugin Builder — Create Minecraft Plugins Without Code',
  description:
    'Drag-and-drop Minecraft plugin builder for Paper 1.21.1. No Java knowledge required. Free to start.',
  openGraph: {
    title: 'MC Plugin Builder — Create Minecraft Plugins Without Code',
    description:
      'Drag-and-drop Minecraft plugin builder for Paper 1.21.1. No Java knowledge required. Free to start.',
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'MC Plugin Builder - Create Minecraft Plugins Without Code',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MC Plugin Builder — Create Minecraft Plugins Without Code',
    description:
      'Drag-and-drop Minecraft plugin builder for Paper 1.21.1. No Java knowledge required. Free to start.',
    images: [`${siteUrl}/og-image.png`],
  },
  alternates: {
    canonical: siteUrl,
  },
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
  { feature: 'Cloud Builds', starter: '\u2713', premium: '\u2713', pro: '\u2713' },
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

const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MC Plugin Builder',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Web',
  url: siteUrl,
  description:
    'Drag-and-drop Minecraft plugin builder for Paper 1.21.1. No Java knowledge required. Free to start.',
  offers: [
    {
      '@type': 'Offer',
      name: 'Starter',
      price: '0',
      priceCurrency: 'USD',
      description: '1 project, 1 build/month, 4 events, 8 actions',
    },
    {
      '@type': 'Offer',
      name: 'Premium',
      price: '4.99',
      priceCurrency: 'USD',
      description: 'Unlimited projects, 5 builds/month, 20 events, 50 actions',
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '9.99',
      priceCurrency: 'USD',
      description: 'Unlimited projects, 20 builds/month, unlimited events & actions, cloud builds',
    },
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do I need to know Java to use MC Plugin Builder?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. MC Plugin Builder uses a visual drag-and-drop editor that generates real Paper API Java code for you. No coding required.',
      },
    },
    {
      '@type': 'Question',
      name: 'What Minecraft server versions are supported?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MC Plugin Builder generates plugins for Paper API 1.21.1, which is compatible with most modern Minecraft servers.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is MC Plugin Builder free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! The Starter plan is completely free and includes 1 project, 1 build per month, and up to 4 events with 8 actions.',
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
