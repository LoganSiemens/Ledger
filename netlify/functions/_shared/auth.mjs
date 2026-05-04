/**
 * Bearer-token auth for all Plaid endpoints.
 * The shared secret lives in `LEDGER_API_SECRET` (Netlify env var) and in
 * the user's localStorage on the client. Constant-time compare avoids
 * timing attacks.
 */
export function requireApiKey(req) {
  const expected = process.env.LEDGER_API_SECRET;
  if (!expected) {
    return new Response(
      JSON.stringify({ error: 'server-misconfigured: LEDGER_API_SECRET not set' }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }
  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !timingSafeEqual(token, expected)) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }
  return null;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export function errorResponse(err, status = 500) {
  const msg =
    err?.response?.data?.error_message ||
    err?.message ||
    (typeof err === 'string' ? err : 'unknown error');
  console.error('[api]', status, msg, err?.response?.data || '');
  return jsonResponse({ error: msg }, status);
}
