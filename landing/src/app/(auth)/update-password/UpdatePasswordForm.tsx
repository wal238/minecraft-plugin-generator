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

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="mc-card w-full max-w-md p-8">
        <h1 className="font-pixel text-xl text-center mb-8" style={{ color: 'var(--mc-orange)' }}>
          SET NEW PASSWORD
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-pixel text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full p-3 bg-(--bg-primary) border-2 border-(--mc-gray-dark) text-(--text-primary) focus:border-(--mc-orange) outline-none transition-colors"
              placeholder="Min 8 characters"
            />
          </div>

          <div>
            <label className="block font-pixel text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              className="w-full p-3 bg-(--bg-primary) border-2 border-(--mc-gray-dark) text-(--text-primary) focus:border-(--mc-orange) outline-none transition-colors"
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
            {loading ? 'Updating...' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </div>
    </div>
  );
}
