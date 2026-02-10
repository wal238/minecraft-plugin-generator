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

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="mc-card w-full max-w-md p-8">
        <h1 className="font-pixel text-xl text-center mb-8" style={{ color: 'var(--mc-orange)' }}>
          RESET PASSWORD
        </h1>

        {sent ? (
          <div className="text-center space-y-4">
            <p style={{ color: 'var(--mc-green)' }} className="font-pixel text-xs">
              Check your email!
            </p>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
              We sent a password reset link to <strong>{email}</strong>
            </p>
            <Link href="/login" className="mc-btn mc-btn-outline inline-block mt-4">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-pixel text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 bg-[var(--bg-primary)] border-2 border-[var(--mc-gray-dark)] text-[var(--text-primary)] focus:border-[var(--mc-orange)] outline-none transition-colors"
                placeholder="steve@minecraft.net"
              />
            </div>

            {error && (
              <div className="p-3 text-sm" style={{ background: 'rgba(244, 67, 54, 0.1)', border: '1px solid var(--mc-red)', color: 'var(--mc-red)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`mc-btn mc-btn-orange w-full justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Sending...' : 'SEND RESET LINK'}
            </button>

            <div className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
              <Link href="/login" className="underline" style={{ color: 'var(--text-muted)' }}>
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
