import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const isDev = process.env.NODE_ENV === 'development';
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (publishableKey?.startsWith('sb_secret_')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must not be a secret key');
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    publishableKey!,
    {
      cookieOptions: isDev
        ? { sameSite: 'lax' as const, secure: false }
        : { domain: '.mcpluginbuilder.com', sameSite: 'lax' as const, secure: true },
    }
  );
}
