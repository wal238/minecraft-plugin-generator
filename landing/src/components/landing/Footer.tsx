import Link from 'next/link';

const builderUrl = process.env.NEXT_PUBLIC_BUILDER_URL || '/';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Builder', href: builderUrl, external: true },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Support', href: 'mailto:waleed@allaudintech.com' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

export function Footer() {
  return (
    <footer
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div
        className="px-6 py-16"
        style={{ maxWidth: 1200, margin: '0 auto' }}
      >
        {/* 4-column grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2rem',
          }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div
                style={{
                  width: 24,
                  height: 24,
                  background: 'var(--mc-orange)',
                  boxShadow: '2px 2px 0 var(--mc-orange-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                }}
              >
                <span>&#9632;</span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.65rem',
                  color: 'var(--text-primary)',
                  letterSpacing: '0.05em',
                }}
              >
                MC PLUGIN BUILDER
              </span>
            </div>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                lineHeight: 1.7,
              }}
            >
              The visual drag-and-drop tool for creating Minecraft Paper plugins without writing Java code.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.6rem',
                  color: 'var(--text-primary)',
                  letterSpacing: '0.08em',
                  marginBottom: '1.25rem',
                  textTransform: 'uppercase',
                }}
              >
                {col.title}
              </h4>
              <ul className="flex flex-col gap-3" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link"
                        style={{
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          transition: 'color 0.2s ease',
                        }}
                      >
                        {link.label}
                      </a>
                    ) : link.href.startsWith('#') ? (
                      <a
                        href={link.href}
                        className="footer-link"
                        style={{
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          transition: 'color 0.2s ease',
                        }}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="footer-link"
                        style={{
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          transition: 'color 0.2s ease',
                        }}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'var(--bg-primary)',
        }}
      >
        <div
          className="px-6 py-5 flex items-center justify-center"
          style={{ maxWidth: 1200, margin: '0 auto' }}
        >
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              margin: 0,
            }}
          >
            &copy; 2026 MC Plugin Builder. All rights reserved.
          </p>
        </div>
      </div>

      {/* Footer-specific styles */}
      <style>{`
        .footer-link:hover {
          color: var(--mc-orange) !important;
        }

        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </footer>
  );
}
