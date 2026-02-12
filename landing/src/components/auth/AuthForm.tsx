'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createHandoffCodeForCurrentSession } from '@/lib/handoff-client';

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

  const redirectToBuilderWithSession = async (targetUrl: string) => {
    let code: string | null = null;
    try {
      code = await createHandoffCodeForCurrentSession();
    } catch {
      // Handoff creation failed — will retry below
    }
    if (!code) {
      // Retry once after a brief delay (cookies may not be flushed yet)
      await new Promise((r) => setTimeout(r, 500));
      try {
        code = await createHandoffCodeForCurrentSession();
      } catch {
        // Ignore — will redirect without code and show error on builder
      }
    }
    const url = new URL(targetUrl);
    if (code) {
      url.searchParams.set('handoff_code', code);
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
      const redirect = searchParams.get('redirect');
      const loginParams = new URLSearchParams({ message: 'Check your email to verify your account, then log in' });
      if (redirect) {
        loginParams.set('redirect', redirect);
      }
      router.push(`/login?${loginParams.toString()}`);
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
          {isSignup ? 'CREATE ACCOUNT' : 'LOG IN'}
        </h1>

        {isSignup && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '0.75rem 1rem',
              fontSize: '0.8rem',
              lineHeight: 1.5,
              background: 'rgba(255, 152, 0, 0.08)',
              border: '1px solid rgba(255, 152, 0, 0.3)',
              color: 'var(--text-secondary)',
            }}
          >
            After signup: 1) Verify your email, 2) Return here and log in.
          </div>
        )}

        {!isSignup && message && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '0.75rem 1rem',
              fontSize: '0.8rem',
              lineHeight: 1.5,
              background: 'rgba(255, 152, 0, 0.08)',
              border: '1px solid rgba(255, 152, 0, 0.3)',
              color: 'var(--text-secondary)',
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {isSignup && (
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
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onFocus={inputFocusHandler}
                onBlur={inputBlurHandler}
                style={inputStyle}
                placeholder="Steve"
                maxLength={50}
              />
            </div>
          )}

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
              onFocus={inputFocusHandler}
              onBlur={inputBlurHandler}
              style={inputStyle}
              placeholder="steve@minecraft.net"
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
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              onFocus={inputFocusHandler}
              onBlur={inputBlurHandler}
              style={inputStyle}
              placeholder="••••••••"
            />
            {isSignup && (
              <p style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Min 8 characters
              </p>
            )}
          </div>

          {isSignup && (
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                onFocus={inputFocusHandler}
                onBlur={inputBlurHandler}
                style={inputStyle}
                placeholder="••••••••"
              />
            </div>
          )}

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

          {notice && (
            <div
              style={{
                padding: '0.75rem 1rem',
                fontSize: '0.8rem',
                background: 'rgba(255, 152, 0, 0.08)',
                border: '1px solid rgba(255, 152, 0, 0.3)',
                color: 'var(--text-primary)',
              }}
            >
              {notice}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`mc-btn mc-btn-orange ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '0.25rem' }}
          >
            {loading ? 'Loading...' : isSignup ? 'CREATE ACCOUNT' : 'LOG IN'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {mode === 'login' ? (
            <>
              <p>
                Don&apos;t have an account?{' '}
                <Link href={`/signup${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`} style={{ color: 'var(--mc-orange)', textDecoration: 'underline' }}>Sign up</Link>
              </p>
              <p style={{ marginTop: '0.5rem' }}>
                <Link href="/reset-password" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Forgot password?</Link>
              </p>
            </>
          ) : (
            <p>
              Already have an account?{' '}
              <Link href={`/login${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`} style={{ color: 'var(--mc-orange)', textDecoration: 'underline' }}>Log in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
