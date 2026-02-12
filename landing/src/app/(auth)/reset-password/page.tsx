'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/callback?type=recovery`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="mc-card w-full max-w-md" style={{ padding: '2.5rem 2rem' }}>
        <h1
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '1.1rem',
            color: 'var(--mc-orange)',
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          RESET PASSWORD
        </h1>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--mc-green)', fontFamily: 'var(--font-pixel)', fontSize: '0.7rem', marginBottom: '1rem' }}>
              Check your email!
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              We sent a password reset link to <strong>{email}</strong>
            </p>
            <Link href="/login" className="mc-btn mc-btn-outline" style={{ display: 'inline-block' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.6rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.5rem',
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'var(--mc-orange)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
                placeholder="steve@minecraft.net"
              />
            </div>

            {error && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.8rem',
                  background: 'rgba(244, 67, 54, 0.08)',
                  border: '1px solid rgba(244, 67, 54, 0.3)',
                  color: 'var(--mc-red)',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`mc-btn mc-btn-orange ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
            >
              {loading ? 'Sending...' : 'SEND RESET LINK'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Link href="/login" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
