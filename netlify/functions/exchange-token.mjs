import { plaidClient } from './_shared/plaid.mjs';
import { supabaseAdmin } from './_shared/supabase.mjs';
import { requireApiKey, jsonResponse, errorResponse } from './_shared/auth.mjs';

export default async (req) => {
  if (req.method !== 'POST') return jsonResponse({ error: 'method not allowed' }, 405);
  const denied = requireApiKey(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const publicToken = body?.public_token;
    if (!publicToken) return jsonResponse({ error: 'public_token required' }, 400);

    const client = plaidClient();
    const exchange = await client.itemPublicTokenExchange({ public_token: publicToken });
    const { access_token: accessToken, item_id: itemId } = exchange.data;

    const meta = body?.metadata || {};
    const institutionId = meta?.institution?.institution_id || null;
    const institutionName = meta?.institution?.name || 'Linked bank';

    const supabase = supabaseAdmin();
    const { error } = await supabase.from('plaid_items').upsert(
      {
        item_id: itemId,
        institution_id: institutionId,
        institution_name: institutionName,
        access_token: accessToken,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'item_id' },
    );
    if (error) throw error;

    return jsonResponse({ item_id: itemId, institution_name: institutionName });
  } catch (err) {
    return errorResponse(err);
  }
};
