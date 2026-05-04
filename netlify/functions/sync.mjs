import { plaidClient } from './_shared/plaid.mjs';
import { supabaseAdmin } from './_shared/supabase.mjs';
import { requireApiKey, jsonResponse, errorResponse, safeHandler } from './_shared/auth.mjs';

/**
 * Pulls latest accounts + incremental transactions for every linked item.
 *
 * Response:
 *  {
 *    accounts:    [{ plaidAccountId, plaidItemId, name, type, subtype, balance, mask, institutionName }],
 *    added:       [transaction…],
 *    modified:    [transaction…],
 *    removed:     [{ plaidTxId }],
 *  }
 *
 * Transactions are normalized to Ledger's shape:
 *   { plaidTxId, plaidAccountId, date, amount (signed), description, category, accountId:null }
 *
 * Sign convention: Plaid returns expenses as positive numbers; we flip them so
 * money OUT is negative and money IN is positive (matches the manual-entry model).
 */
export default safeHandler(async (req) => {
  if (req.method !== 'POST') return jsonResponse({ error: 'method not allowed' }, 405);
  const denied = requireApiKey(req);
  if (denied) return denied;

  try {
    const supabase = supabaseAdmin();
    const { data: items, error } = await supabase
      .from('plaid_items')
      .select('item_id, institution_name, access_token, sync_cursor');
    if (error) throw error;
    if (!items || items.length === 0) {
      return jsonResponse({ accounts: [], added: [], modified: [], removed: [] });
    }

    const client = plaidClient();
    const allAccounts = [];
    const allAdded = [];
    const allModified = [];
    const allRemoved = [];

    for (const item of items) {
      const accountsResp = await client.accountsGet({ access_token: item.access_token });
      for (const a of accountsResp.data.accounts) {
        allAccounts.push({
          plaidAccountId: a.account_id,
          plaidItemId: item.item_id,
          institutionName: item.institution_name,
          name: a.name,
          officialName: a.official_name || null,
          mask: a.mask || null,
          type: a.type,
          subtype: a.subtype,
          balance: a.balances?.current ?? a.balances?.available ?? 0,
          currency: a.balances?.iso_currency_code || 'USD',
        });
      }

      let cursor = item.sync_cursor || null;
      let hasMore = true;
      let added = [];
      let modified = [];
      let removed = [];
      while (hasMore) {
        const resp = await client.transactionsSync({
          access_token: item.access_token,
          cursor: cursor || undefined,
        });
        added = added.concat(resp.data.added);
        modified = modified.concat(resp.data.modified);
        removed = removed.concat(resp.data.removed);
        hasMore = resp.data.has_more;
        cursor = resp.data.next_cursor;
      }

      await supabase
        .from('plaid_items')
        .update({ sync_cursor: cursor, updated_at: new Date().toISOString() })
        .eq('item_id', item.item_id);

      const normalize = (t) => ({
        plaidTxId: t.transaction_id,
        plaidAccountId: t.account_id,
        date: t.date,
        // Plaid: expenses are positive, deposits are negative. Flip to match Ledger.
        amount: -Number(t.amount),
        description: t.merchant_name || t.name || '',
        category: mapPlaidCategory(t),
        accountId: null,
      });

      allAdded.push(...added.map(normalize));
      allModified.push(...modified.map(normalize));
      allRemoved.push(...removed.map((r) => ({ plaidTxId: r.transaction_id })));
    }

    return jsonResponse({
      accounts: allAccounts,
      added: allAdded,
      modified: allModified,
      removed: allRemoved,
    });
  } catch (err) {
    return errorResponse(err);
  }
});

/**
 * Map Plaid's personal-finance category to Ledger's flat list.
 * Plaid uses a 2-level hierarchy (`primary` and `detailed`); we collapse it.
 */
function mapPlaidCategory(t) {
  const pfc = t.personal_finance_category?.primary;
  switch (pfc) {
    case 'INCOME':
    case 'TRANSFER_IN':
      return 'Income';
    case 'RENT_AND_UTILITIES':
    case 'HOME_IMPROVEMENT':
      return 'Housing';
    case 'FOOD_AND_DRINK':
      return 'Food';
    case 'TRANSPORTATION':
    case 'TRAVEL':
      return 'Transport';
    case 'GENERAL_MERCHANDISE':
    case 'PERSONAL_CARE':
    case 'ENTERTAINMENT':
      return 'Shopping';
    case 'MEDICAL':
      return 'Health';
    case 'LOAN_PAYMENTS':
    case 'BANK_FEES':
    case 'GENERAL_SERVICES':
      return 'Bills';
    default:
      return 'Other';
  }
}
