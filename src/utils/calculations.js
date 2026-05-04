import { ACCOUNT_GROUPS, getAccountType } from './categories';
import { fromISO, isSameMonth } from './dates';

/**
 * Net worth = sum of cash + investment balances minus debt balances.
 * Account.balance is stored as the user sees it (debts as positive numbers).
 */
export function netWorth(accounts = []) {
  let total = 0;
  for (const a of accounts) {
    const group = getAccountType(a.type).group;
    const sign = ACCOUNT_GROUPS.find((g) => g.id === group)?.sign ?? 1;
    total += (Number(a.balance) || 0) * sign;
  }
  return total;
}

/**
 * Group accounts and compute subtotals.
 * @returns {Array<{id:string,label:string,sign:number,accounts:Array,subtotal:number}>}
 */
export function groupAccounts(accounts = []) {
  const groups = ACCOUNT_GROUPS.map((g) => ({ ...g, accounts: [], subtotal: 0 }));
  const byId = Object.fromEntries(groups.map((g) => [g.id, g]));
  for (const a of accounts) {
    const groupId = getAccountType(a.type).group;
    const bucket = byId[groupId] || byId.cash;
    bucket.accounts.push(a);
    bucket.subtotal += Number(a.balance) || 0;
  }
  return groups;
}

/**
 * Sum signed transactions for a given month.
 * Transaction.amount is positive for income, negative for expenses.
 */
export function monthlyFlow(transactions = [], date = new Date()) {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    const d = fromISO(t.date);
    if (!isSameMonth(d, date)) continue;
    const amt = Number(t.amount) || 0;
    if (amt >= 0) income += amt;
    else expense += amt;
  }
  return { income, expense, net: income + expense };
}

/** Compare current month against previous month, return percent change. */
export function monthOverMonth(transactions = [], date = new Date()) {
  const prev = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const cur = monthlyFlow(transactions, date);
  const last = monthlyFlow(transactions, prev);
  return {
    current: cur,
    previous: last,
    incomeDelta: pctChange(last.income, cur.income),
    expenseDelta: pctChange(Math.abs(last.expense), Math.abs(cur.expense)),
    netDelta: pctChange(last.net, cur.net),
  };
}

function pctChange(prev, cur) {
  if (!prev) return null;
  return ((cur - prev) / Math.abs(prev)) * 100;
}

export function recentTransactions(transactions = [], n = 5) {
  return [...transactions]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, n);
}

export function transactionsByDate(transactions = []) {
  return [...transactions].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
  );
}
