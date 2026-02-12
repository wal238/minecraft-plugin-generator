'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { UserMenu } from '@/components/auth/UserMenu';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
];

const builderUrl = process.env.NEXT_PUBLIC_BUILDER_URL || 'http://localhost:5173';
const loginHref = `/login?redirect=${encodeURIComponent(builderUrl)}`;
const signupHref = `/signup?redirect=${encodeURIComponent(builderUrl)}`;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: scrolled ? 'var(--bg-secondary)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid transparent',
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}
    >
      <style>{`
        @media (max-width: 767px) {
          .nav-desktop-links { display: none !important; }
          .nav-mobile-hamburger { display: flex !important; }
        }
        @media (min-width: 768px) {
          .nav-mobile-dropdown { display: none !important; }
        }
      `}</style>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: 'var(--mc-orange)',
              boxShadow: '2px 2px 0 var(--mc-orange-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
            }}
          >
            <span role="img" aria-label="block">&#9632;</span>
          </div>
          <span
            className="font-pixel"
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 'clamp(0.6rem, 1.5vw, 0.8rem)',
              color: 'var(--text-primary)',
              letterSpacing: '0.05em',
            }}
          >
            MC PLUGIN BUILDER
          </span>
        </Link>

        {/* Center nav links — desktop */}
        <div className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.6rem',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                letterSpacing: '0.05em',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--mc-orange)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right buttons — desktop */}
        <div className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!loading && user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Link
                href={loginHref}
                className="mc-btn mc-btn-outline"
                style={{ padding: '0.625rem 1.25rem', fontSize: '0.625rem' }}
              >
                Login
              </Link>
              <Link
                href={signupHref}
                className="mc-btn mc-btn-orange"
                style={{ padding: '0.625rem 1.25rem', fontSize: '0.625rem' }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Hamburger — mobile */}
        <button
          className="nav-mobile-hamburger"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
          style={{
            display: 'none',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.375rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
          }}
        >
          <span
            style={{
              display: 'block',
              width: 24,
              height: 2,
              background: 'var(--text-primary)',
              transition: 'transform 0.3s ease, opacity 0.3s ease',
              transform: mobileMenuOpen ? 'rotate(45deg) translateY(5.5px)' : 'none',
            }}
          />
          <span
            style={{
              display: 'block',
              width: 24,
              height: 2,
              background: 'var(--text-primary)',
              transition: 'opacity 0.3s ease',
              opacity: mobileMenuOpen ? 0 : 1,
            }}
          />
          <span
            style={{
              display: 'block',
              width: 24,
              height: 2,
              background: 'var(--text-primary)',
              transition: 'transform 0.3s ease, opacity 0.3s ease',
              transform: mobileMenuOpen ? 'rotate(-45deg) translateY(-5.5px)' : 'none',
            }}
          />
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        style={{
          maxHeight: mobileMenuOpen ? 400 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
          background: 'var(--bg-secondary)',
          borderTop: mobileMenuOpen ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
        }}
        className="nav-mobile-dropdown"
      >
        <div style={{ display: 'flex', flexDirection: 'column', padding: '1rem 1.5rem', gap: '1rem' }}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.65rem',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                padding: '0.5rem 0',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--mc-orange)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              {link.label}
            </a>
          ))}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem' }}>
            {!loading && user ? (
              <UserMenu user={user} />
            ) : (
              <>
                <Link
                  href={loginHref}
                  className="mc-btn mc-btn-outline"
                  style={{ fontSize: '0.625rem', textAlign: 'center' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href={signupHref}
                  className="mc-btn mc-btn-orange"
                  style={{ fontSize: '0.625rem', textAlign: 'center' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
