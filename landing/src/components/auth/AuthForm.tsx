'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const isSignup = mode === 'signup';
  const message = searchParams.get('message');

  const getSessionForHandoff = async () => {
    let { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const refreshed = await supabase.auth.refreshSession();
      session = refreshed.data.session;
    }
    return session;
  };

  const redirectToBuilderWithSession = async (targetUrl: string) => {
    const session = await getSessionForHandoff();
    const url = new URL(targetUrl);
    if (session?.access_token && session?.refresh_token) {
      url.searchParams.set('access_token', session.access_token);
      url.searchParams.set('refresh_token', session.refresh_token);
      url.searchParams.set('handoff', '1');
    }
    window.location.href = url.toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (isSignup) {
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setLoading(true);

    if (isSignup) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/callback`,
          data: { display_name: displayName || undefined },
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setError(null);
      router.push('/login?message=Check your email to verify your account, then log in');
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (!data.user?.email_confirmed_at && !data.user?.confirmed_at) {
        await supabase.auth.signOut();
        setNotice('Please verify your email before logging in.');
        setLoading(false);
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      const builderUrl = process.env.NEXT_PUBLIC_BUILDER_URL;
      const isBuilderRedirect = builderUrl && redirect?.startsWith(builderUrl);
      const safePath: string = isBuilderRedirect && redirect
        ? redirect
        : redirect && redirect.startsWith('/') && !redirect.startsWith('//')
          ? redirect
          : '/account';
      if (isBuilderRedirect) {
        await redirectToBuilderWithSession(safePath);
      } else {
        router.push(safePath);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="mc-card w-full max-w-md p-8">
        <h1 className="font-pixel text-xl text-center mb-8" style={{ color: 'var(--mc-orange)' }}>
          {isSignup ? 'CREATE ACCOUNT' : 'LOG IN'}
        </h1>

        {isSignup && (
          <div className="mb-5 p-3 text-sm" style={{ background: 'rgba(255, 152, 0, 0.1)', border: '1px solid var(--mc-orange)', color: 'var(--text-primary)' }}>
            After signup: 1) Verify your email, 2) Return here and log in.
          </div>
        )}

        {!isSignup && message && (
          <div className="mb-5 p-3 text-sm" style={{ background: 'rgba(255, 152, 0, 0.1)', border: '1px solid var(--mc-orange)', color: 'var(--text-primary)' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignup && (
            <div>
              <label className="block font-pixel text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-3 bg-(--bg-primary) border-2 border-(--mc-gray-dark) text-(--text-primary) focus:border-(--mc-orange) outline-none transition-colors"
                placeholder="Steve"
                maxLength={50}
              />
            </div>
          )}

          <div>
            <label className="block font-pixel text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 bg-(--bg-primary) border-2 border-(--mc-gray-dark) text-(--text-primary) focus:border-(--mc-orange) outline-none transition-colors"
              placeholder="steve@minecraft.net"
            />
          </div>

          <div>
            <label className="block font-pixel text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full p-3 bg-(--bg-primary) border-2 border-(--mc-gray-dark) text-(--text-primary) focus:border-(--mc-orange) outline-none transition-colors"
              placeholder="••••••••"
            />
            {isSignup && (
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                Min 8 characters
              </p>
            )}
          </div>

          {isSignup && (
            <div>
              <label className="block font-pixel text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full p-3 bg-(--bg-primary) border-2 border-(--mc-gray-dark) text-(--text-primary) focus:border-(--mc-orange) outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          )}

          {error && (
            <div className="p-3 text-sm" style={{ background: 'rgba(244, 67, 54, 0.1)', border: '1px solid var(--mc-red)', color: 'var(--mc-red)' }}>
              {error}
            </div>
          )}

          {notice && (
            <div className="p-3 text-sm" style={{ background: 'rgba(255, 152, 0, 0.1)', border: '1px solid var(--mc-orange)', color: 'var(--text-primary)' }}>
              {notice}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`mc-btn mc-btn-orange w-full justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Loading...' : isSignup ? 'CREATE ACCOUNT' : 'LOG IN'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          {mode === 'login' ? (
            <>
              <p>
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="underline" style={{ color: 'var(--mc-orange)' }}>Sign up</Link>
              </p>
              <p className="mt-2">
                <Link href="/reset-password" className="underline" style={{ color: 'var(--text-muted)' }}>Forgot password?</Link>
              </p>
            </>
          ) : (
            <p>
              Already have an account?{' '}
              <Link href="/login" className="underline" style={{ color: 'var(--mc-orange)' }}>Log in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
