import { plaidClient } from './_shared/plaid.mjs';
import { supabaseAdmin } from './_shared/supabase.mjs';
import { requireApiKey, jsonResponse, errorResponse, safeHandler } from './_shared/auth.mjs';

/**
 * Pulls latest accounts + incremental transactions for every linked item.
 *
 * Query params:
 *   ?full=1    Reset every item's sync cursor first, so Plaid returns the
 *              entire transaction history again. Use this to re-pull after
 *              fixing categorization, sign, or other normalization rules.
 *
 * Response:
 *  {
 *    accounts:    [...],
 *    added:       [transaction…],
 *    modified:    [transaction…],
 *    removed:     [{ plaidTxId }],
 *    full:        boolean,   // whether this was a forced full re-pull
 *  }
 */
export default safeHandler(async (req) => {
  if (req.method !== 'POST') return jsonResponse({ error: 'method not allowed' }, 405);
  const denied = requireApiKey(req);
  if (denied) return denied;

  try {
    const url = new URL(req.url);
    const full = url.searchParams.get('full') === '1';

    const supabase = supabaseAdmin();

    if (full) {
      const { error: resetErr } = await supabase
        .from('plaid_items')
        .update({ sync_cursor: null })
        .neq('item_id', '');
      if (resetErr) throw resetErr;
    }

    const { data: items, error } = await supabase
      .from('plaid_items')
      .select('item_id, institution_name, access_token, sync_cursor');
    if (error) throw error;
    if (!items || items.length === 0) {
      return jsonResponse({ accounts: [], added: [], modified: [], removed: [], full });
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
      full,
    });
  } catch (err) {
    return errorResponse(err);
  }
});

/**
 * Map Plaid's personal-finance category to Ledger's flat list.
 *
 * Important: TRANSFER_IN and TRANSFER_OUT, plus the credit-card-payment
 * detailed code, are mapped to the 'Transfer' category. Transfers are
 * money moving between the user's own accounts and must NOT be counted as
 * income or spending — otherwise a credit-card payment shows up as both a
 * spend (debit on checking) and an income (credit on the card).
 */
function mapPlaidCategory(t) {
  const pfc = t.personal_finance_category?.primary;
  const detailed = t.personal_finance_category?.detailed;

  if (pfc === 'TRANSFER_IN' || pfc === 'TRANSFER_OUT') return 'Transfer';
  if (detailed === 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT') return 'Transfer';

  switch (pfc) {
    case 'INCOME':
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
