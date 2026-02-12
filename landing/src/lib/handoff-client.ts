import { createClient } from '@/lib/supabase/client';

export async function createHandoffCodeForCurrentSession(): Promise<string | null> {
  const supabase = createClient();
  let { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const refreshed = await supabase.auth.refreshSession();
    session = refreshed.data.session;
  }
  if (!session?.access_token || !session?.refresh_token) {
    return null;
  }

  const response = await fetch('/api/handoff/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    }),
  });
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return typeof data?.code === 'string' ? data.code : null;
}
