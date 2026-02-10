import { MinecraftCard } from '@/components/ui/MinecraftCard';
import { BlockShape } from '@/components/ui/BlockShape';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

const features = [
  {
    color: 'orange' as const,
    icon: '\u2699',
    title: 'Visual Event Builder',
    description:
      'Drag and drop events, conditions, and actions. See your plugin logic visually.',
  },
  {
    color: 'blue' as const,
    icon: '\u2731',
    title: 'Smart Conditions',
    description:
      'Add if/else logic, permission checks, cooldowns, and probability conditions.',
  },
  {
    color: 'green' as const,
    icon: '\u26A1',
    title: '100+ Actions',
    description:
      'Send messages, spawn entities, modify blocks, create GUIs, manage scoreboards, and more.',
  },
  {
    color: 'red' as const,
    icon: '\u25B6',
    title: 'One-Click Build',
    description:
      'Generate a production-ready Paper 1.21.1 JAR file. Download and drop into your server.',
  },
  {
    color: 'purple' as const,
    icon: '/',
    title: 'Custom Commands',
    description:
      'Create slash commands with arguments, tab completion, and permission nodes.',
  },
  {
    color: 'yellow' as const,
    icon: '\u2728',
    title: 'No Code Required',
    description:
      'Build complex plugins without writing a single line of Java.',
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="section">
      <AnimatedSection>
        <h2 className="section-title" style={{ color: 'var(--text-primary)' }}>
          POWERFUL FEATURES
        </h2>
      </AnimatedSection>

      <AnimatedSection stagger>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <MinecraftCard key={feature.title}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <BlockShape color={feature.color} size={48} icon={feature.icon} />
                <h3
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.7rem',
                    color: 'var(--text-primary)',
                    lineHeight: '1.6',
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.7',
                  }}
                >
                  {feature.description}
                </p>
              </div>
            </MinecraftCard>
          ))}
        </div>
      </AnimatedSection>
    </section>
  );
}
