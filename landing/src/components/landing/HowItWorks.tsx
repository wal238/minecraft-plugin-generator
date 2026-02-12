import { AnimatedSection } from '@/components/ui/AnimatedSection';

const steps = [
  {
    number: '1',
    color: 'var(--mc-orange)',
    title: 'Choose Events',
    description:
      'Select what triggers your plugin — player joins, block breaks, commands, and more.',
  },
  {
    number: '2',
    color: 'var(--mc-blue)',
    title: 'Add Logic',
    description:
      'Stack conditions and actions visually. If-else, loops, delays — all drag-and-drop.',
  },
  {
    number: '3',
    color: 'var(--mc-green)',
    title: 'Configure',
    description:
      'Set messages, items, particles, sounds. Preview your code in real-time.',
  },
  {
    number: '4',
    color: 'var(--mc-red)',
    title: 'Build & Download',
    description:
      'One click builds your Paper 1.21.1 JAR in the cloud. No Java setup — just download and drop it in your server.',
  },
];

function StepCircle({ number, color }: { number: string; color: string }) {
  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-pixel)',
        fontSize: '1rem',
        color: '#ffffff',
        flexShrink: 0,
      }}
    >
      {number}
    </div>
  );
}

function Connector() {
  return (
    <>
      {/* Mobile: vertical dotted line */}
      <div
        className="block md:hidden"
        style={{
          borderLeft: '2px dotted var(--text-muted)',
          height: '2rem',
          marginLeft: '27px',
        }}
      />
      {/* Desktop: horizontal dotted line */}
      <div
        className="hidden md:flex"
        style={{
          borderTop: '2px dotted var(--text-muted)',
          alignSelf: 'flex-start',
          marginTop: '28px',
          flex: 1,
          minWidth: '1.5rem',
        }}
      />
    </>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section">
      <AnimatedSection>
        <h2 className="section-title" style={{ color: 'var(--text-primary)' }}>
          HOW IT WORKS
        </h2>
      </AnimatedSection>

      <AnimatedSection stagger>
        <div className="flex flex-col md:flex-row md:items-start">
          {steps.map((step, index) => (
            <div key={step.number} className="contents">
              {/* Step card */}
              <div
                className="flex flex-col items-start md:items-center md:text-center"
                style={{ gap: '0.75rem', flex: 1 }}
              >
                <StepCircle number={step.number} color={step.color} />
                <h3
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.7rem',
                    color: 'var(--text-primary)',
                    lineHeight: '1.6',
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.7',
                    maxWidth: '240px',
                  }}
                >
                  {step.description}
                </p>
              </div>

              {/* Connector between steps */}
              {index < steps.length - 1 && <Connector />}
            </div>
          ))}
        </div>
      </AnimatedSection>
    </section>
  );
}
