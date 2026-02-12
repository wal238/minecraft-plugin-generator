import { createAdminClient } from '@/lib/supabase/server';
import { decryptSessionPayload, hashHandoffCode } from '@/lib/handoff';
import { isAllowedReturnTo } from '@/lib/redirects';

function corsHeaders(origin: string | null): HeadersInit {
  if (origin && isAllowedReturnTo(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      Vary: 'Origin',
    };
  }
  return {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(req.headers.get('origin')) });
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  if (origin && !isAllowedReturnTo(origin)) {
    return new Response('Forbidden: invalid origin', { status: 403, headers: corsHeaders(origin) });
  }

  const body = await req.json().catch(() => ({}));
  const code = typeof body?.code === 'string' ? body.code : '';
  if (!code) {
    return Response.json({ error: 'Missing handoff code' }, { status: 400, headers: corsHeaders(origin) });
  }

  const codeHash = hashHandoffCode(code);
  const now = new Date().toISOString();
  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from('session_handoffs')
    .select('id, payload_encrypted')
    .eq('code_hash', codeHash)
    .is('consumed_at', null)
    .gt('expires_at', now)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return Response.json({ error: 'Invalid or expired handoff code' }, { status: 400, headers: corsHeaders(origin) });
  }

  const { data: consumedRow, error: consumeError } = await supabaseAdmin
    .from('session_handoffs')
    .update({ consumed_at: now })
    .eq('id', data.id)
    .is('consumed_at', null)
    .select('id')
    .maybeSingle();
  if (consumeError || !consumedRow) {
    return Response.json({ error: 'Handoff code already consumed' }, { status: 409, headers: corsHeaders(origin) });
  }

  const payload = decryptSessionPayload(data.payload_encrypted);
  return Response.json(payload, { headers: corsHeaders(origin) });
}
