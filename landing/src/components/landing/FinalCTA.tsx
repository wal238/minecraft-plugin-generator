import { MinecraftButton } from '@/components/ui/MinecraftButton';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export function FinalCTA() {
  return (
    <section
      style={{
        background: 'linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
        padding: '6rem 1.5rem',
      }}
    >
      <AnimatedSection>
        <div
          style={{
            maxWidth: 800,
            margin: '0 auto',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 'clamp(1.25rem, 3.5vw, 2.25rem)',
              color: 'var(--text-primary)',
              lineHeight: 1.5,
            }}
          >
            READY TO BUILD?
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.8,
              maxWidth: 600,
            }}
          >
            Join thousands of Minecraft server owners creating custom plugins without code.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: '1rem',
            }}
          >
            <MinecraftButton variant="orange" href="/signup">
              START BUILDING FREE
            </MinecraftButton>
            <MinecraftButton variant="outline" href="#pricing">
              VIEW PRICING
            </MinecraftButton>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
