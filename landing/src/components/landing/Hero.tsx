import Link from 'next/link';

const floatingBlocks = [
  { label: 'Events', color: 'var(--mc-orange)', shadow: 'var(--mc-orange-dark)', delay: '0s', x: '-280px', y: '-60px' },
  { label: 'Conditions', color: 'var(--mc-blue)', shadow: 'var(--mc-blue-dark)', delay: '1s', x: '260px', y: '-40px' },
  { label: 'Actions', color: 'var(--mc-green)', shadow: 'var(--mc-green-dark)', delay: '2s', x: '-240px', y: '80px' },
  { label: 'Generate', color: 'var(--mc-red)', shadow: 'var(--mc-red-dark)', delay: '3s', x: '220px', y: '100px' },
];

export function Hero() {
  return (
    <section
      id="hero"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
      }}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-heading {
          font-family: var(--font-pixel);
          font-size: clamp(1.2rem, 4vw, 2.5rem);
          text-align: center;
          line-height: 1.6;
          color: var(--text-primary);
          margin: 0 0 1.5rem 0;
          animation: fadeInUp 0.8s ease forwards;
        }

        .hero-heading .highlight {
          color: var(--mc-orange);
        }

        .hero-subtitle {
          font-family: var(--font-body);
          font-size: clamp(1rem, 2vw, 1.25rem);
          color: var(--text-secondary);
          text-align: center;
          max-width: 600px;
          margin: 0 auto 2.5rem auto;
          line-height: 1.8;
          animation: fadeInUp 0.8s ease 0.2s forwards;
          opacity: 0;
        }

        .hero-cta-group {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          animation: fadeInUp 0.8s ease 0.4s forwards;
          opacity: 0;
        }

        .hero-floating-block {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .hero-floating-block-square {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-floating-block-label {
          font-family: var(--font-pixel);
          font-size: 0.5rem;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        /* Hide floating blocks on small screens */
        @media (max-width: 900px) {
          .hero-floating-block {
            display: none;
          }
        }
      `}</style>

      {/* Floating blocks */}
      {floatingBlocks.map((block) => (
        <div
          key={block.label}
          className="hero-floating-block"
          style={{
            left: '50%',
            top: '50%',
            marginLeft: block.x,
            marginTop: block.y,
            animation: `float 4s ease-in-out ${block.delay} infinite`,
          }}
        >
          <div
            className="hero-floating-block-square"
            style={{
              background: block.color,
              boxShadow: `4px 4px 0 ${block.shadow}`,
            }}
          />
          <span className="hero-floating-block-label">{block.label}</span>
        </div>
      ))}

      {/* Content */}
      <div className="px-6" style={{ position: 'relative', zIndex: 2, maxWidth: 800 }}>
        <h1 className="hero-heading">
          CREATE MINECRAFT PLUGINS
          <br />
          <span className="highlight">WITHOUT CODE</span>
        </h1>

        <p className="hero-subtitle">
          Drag-and-drop visual builder for Paper 1.21.1. No Java knowledge required.
        </p>

        <div className="hero-cta-group">
          <Link href="/signup" className="mc-btn mc-btn-orange">
            Start Building Free
          </Link>
          <a href="#how-it-works" className="mc-btn mc-btn-outline">
            See How It Works
          </a>
        </div>
      </div>
    </section>
  );
}
