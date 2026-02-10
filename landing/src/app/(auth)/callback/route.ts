import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/account';
  const type = searchParams.get('type');

  // Only allow relative paths starting with / (prevent open redirect)
  const safePath = next.startsWith('/') && !next.startsWith('//') ? next : '/account';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/update-password`);
      }
      return NextResponse.redirect(`${origin}${safePath}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
