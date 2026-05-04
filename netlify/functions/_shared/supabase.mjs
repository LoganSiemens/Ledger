import { createClient } from '@supabase/supabase-js';

let cached;

export function supabaseAdmin() {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  // Diagnostic: log what env vars look like without exposing full secret.
  const summarize = (v) => {
    if (v == null) return '(null)';
    if (v === '') return '(empty string)';
    return `len=${v.length} starts="${v.slice(0, 12)}..." ends="...${v.slice(-12)}"`;
  };
  console.log('[supabase] SUPABASE_URL', summarize(url));
  console.log('[supabase] SUPABASE_SERVICE_KEY', summarize(key));

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set.');
  }
  if (!/^https?:\/\//.test(url)) {
    throw new Error(
      `SUPABASE_URL doesn't look like a URL (missing https://). Got: "${url.slice(0, 40)}…"`,
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
