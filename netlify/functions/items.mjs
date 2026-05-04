import { plaidClient } from './_shared/plaid.mjs';
import { supabaseAdmin } from './_shared/supabase.mjs';
import { requireApiKey, jsonResponse, errorResponse } from './_shared/auth.mjs';

export default async (req) => {
  const denied = requireApiKey(req);
  if (denied) return denied;
  const supabase = supabaseAdmin();

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('plaid_items')
        .select('item_id, institution_id, institution_name, created_at, updated_at')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return jsonResponse({ items: data || [] });
    } catch (err) {
      return errorResponse(err);
    }
  }

  if (req.method === 'DELETE') {
    try {
      const url = new URL(req.url);
      const itemId = url.searchParams.get('item_id');
      if (!itemId) return jsonResponse({ error: 'item_id required' }, 400);

      const { data: rows, error: selErr } = await supabase
        .from('plaid_items')
        .select('access_token')
        .eq('item_id', itemId)
        .limit(1);
      if (selErr) throw selErr;
      const row = rows?.[0];

      if (row?.access_token) {
        try {
          await plaidClient().itemRemove({ access_token: row.access_token });
        } catch (plaidErr) {
          console.warn('[items] plaid itemRemove failed (continuing)', plaidErr?.response?.data);
        }
      }

      const { error: delErr } = await supabase.from('plaid_items').delete().eq('item_id', itemId);
      if (delErr) throw delErr;

      return jsonResponse({ ok: true });
    } catch (err) {
      return errorResponse(err);
    }
  }

  return jsonResponse({ error: 'method not allowed' }, 405);
};
