import { localAdapter } from '../hooks/useStorage';

const uid = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

/**
 * Map a Plaid account type/subtype to our internal type ids.
 * (See utils/categories.js for the canonical list.)
 */
function plaidTypeToInternal(type, subtype) {
  if (type === 'depository') {
    if (subtype === 'savings') return 'savings';
    if (subtype === 'cd' || subtype === 'money market') return 'savings';
    return 'checking';
  }
  if (type === 'credit') return 'credit';
  if (type === 'loan') return 'loan';
  if (type === 'investment' || type === 'brokerage') return 'investment';
  return 'checking';
}

/**
 * Apply the /sync response against localStorage. Pure local merge — no network.
 * Returns counts so the UI can show a useful toast.
 */
export function applySyncResponse(resp) {
  const incoming = resp || {};
  const remoteAccounts = incoming.accounts || [];
  const added = incoming.added || [];
  const modified = incoming.modified || [];
  const removed = incoming.removed || [];

  // ---- Accounts ----
  const existing = localAdapter.get('accounts') || [];
  const manual = existing.filter((a) => a.source !== 'plaid');
  const existingPlaidById = Object.fromEntries(
    existing.filter((a) => a.source === 'plaid').map((a) => [a.plaidAccountId, a]),
  );

  const nextPlaid = remoteAccounts.map((r) => {
    const prior = existingPlaidById[r.plaidAccountId];
    return {
      id: prior?.id || uid(),
      source: 'plaid',
      name: r.name,
      type: plaidTypeToInternal(r.type, r.subtype),
      balance: Number(r.balance) || 0,
      mask: r.mask,
      plaidAccountId: r.plaidAccountId,
      plaidItemId: r.plaidItemId,
      institutionName: r.institutionName,
      createdAt: prior?.createdAt || new Date().toISOString().slice(0, 10),
    };
  });

  const accountsNext = [...manual, ...nextPlaid];
  localAdapter.set('accounts', accountsNext);

  // Lookup: plaidAccountId -> local account.id (for tagging transactions)
  const accountIdByPlaidId = Object.fromEntries(
    nextPlaid.map((a) => [a.plaidAccountId, a.id]),
  );

  // ---- Transactions ----
  const existingTx = localAdapter.get('transactions') || [];
  const byPlaidTxId = new Map();
  const manualTx = [];
  for (const t of existingTx) {
    if (t.plaidTxId) byPlaidTxId.set(t.plaidTxId, t);
    else manualTx.push(t);
  }

  const upsert = (t) => {
    const prev = byPlaidTxId.get(t.plaidTxId);
    const merged = {
      id: prev?.id || uid(),
      source: 'plaid',
      plaidTxId: t.plaidTxId,
      plaidAccountId: t.plaidAccountId,
      accountId: accountIdByPlaidId[t.plaidAccountId] || null,
      date: t.date,
      amount: Number(t.amount) || 0,
      description: t.description,
      category: t.category,
    };
    byPlaidTxId.set(t.plaidTxId, merged);
  };

  for (const t of added) upsert(t);
  for (const t of modified) upsert(t);
  for (const r of removed) byPlaidTxId.delete(r.plaidTxId);

  const txNext = [...manualTx, ...byPlaidTxId.values()];
  localAdapter.set('transactions', txNext);

  return {
    accounts: nextPlaid.length,
    added: added.length,
    modified: modified.length,
    removed: removed.length,
  };
}
