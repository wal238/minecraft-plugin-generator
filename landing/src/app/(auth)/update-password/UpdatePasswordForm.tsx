'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function UpdatePasswordForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/account');
    }
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

  const inputFocusHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'var(--mc-orange)';
  };
  const inputBlurHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
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
          SET NEW PASSWORD
        </h1>

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
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              style={inputStyle}
              onFocus={inputFocusHandler}
              onBlur={inputBlurHandler}
              placeholder="Min 8 characters"
            />
          </div>

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
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              style={inputStyle}
              onFocus={inputFocusHandler}
              onBlur={inputBlurHandler}
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
            style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '0.25rem' }}
          >
            {loading ? 'Updating...' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </div>
    </div>
  );
}
