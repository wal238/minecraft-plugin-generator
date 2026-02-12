'use client';

import { Accordion } from '@/components/ui/Accordion';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

const faqItems = [
  {
    question: 'What is MC Plugin Builder?',
    answer:
      'MC Plugin Builder is a visual drag-and-drop tool that lets you create Minecraft server plugins without writing any Java code. It generates production-ready Paper 1.21.1 plugin JAR files.',
  },
  {
    question: 'Do I need to know Java?',
    answer:
      'Not at all! The entire plugin creation process is visual. You drag and drop events, conditions, and actions to build your plugin logic. Everything builds in the cloud — no local Java setup required.',
  },
  {
    question: 'What Minecraft versions are supported?',
    answer:
      'Currently we support Paper 1.21.1, which is the latest stable version. The generated plugins are compatible with Paper-based servers.',
  },
  {
    question: 'Can I use this for a production server?',
    answer:
      'Yes! The generated plugins are production-ready JAR files. Premium and Pro users get additional features like custom GUIs, boss bars, and persistent data storage.',
  },
  {
    question: "What's included in the free plan?",
    answer:
      'The free plan includes 1 project, 1 build per month, up to 4 events and 8 actions. It\'s perfect for trying out the builder and creating simple plugins.',
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer:
      'Yes, you can change your plan at any time. Upgrades take effect immediately. When downgrading, you keep your current plan until the end of the billing period.',
  },
  {
    question: 'How do I install the generated plugin?',
    answer:
      'Download the JAR file, then drag it into your server\'s /plugins folder. Restart or reload your server, and the plugin is live!',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'We offer a full refund within 7 days of your first subscription payment if you\'re not satisfied. Email us at waleed@allaudintech.com and we\'ll process it right away.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="section">
      <AnimatedSection>
        <h2 className="section-title" style={{ color: 'var(--text-primary)' }}>
          FREQUENTLY ASKED QUESTIONS
        </h2>
      </AnimatedSection>

      <AnimatedSection>
        <div style={{ maxWidth: '768px', margin: '0 auto' }}>
          <Accordion items={faqItems} />
        </div>
      </AnimatedSection>
    </section>
  );
}
