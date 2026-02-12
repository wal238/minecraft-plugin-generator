import { createClient, createAdminClient } from '@/lib/supabase/server';
import { validateOrigin } from '@/lib/csrf';
import {
  createHandoffCode,
  encryptSessionPayload,
  handoffExpiryIso,
  hashHandoffCode,
  getHandoffTtlSeconds,
} from '@/lib/handoff';

export async function POST(req: Request) {
  const csrfError = validateOrigin(req);
  if (csrfError) return csrfError;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const accessToken = body?.accessToken;
  const refreshToken = body?.refreshToken;
  if (!accessToken || !refreshToken) {
    return Response.json({ error: 'Missing session tokens' }, { status: 400 });
  }

  const code = createHandoffCode();
  const codeHash = hashHandoffCode(code);
  const payloadEncrypted = encryptSessionPayload({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('session_handoffs').insert({
    code_hash: codeHash,
    payload_encrypted: payloadEncrypted,
    expires_at: handoffExpiryIso(),
    created_by_user_id: user.id,
  });
  if (error) {
    return Response.json({ error: 'Failed to create handoff' }, { status: 500 });
  }

  return Response.json({ code, expires_in: getHandoffTtlSeconds() });
}
