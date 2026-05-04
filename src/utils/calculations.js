import { ACCOUNT_GROUPS, getAccountType, isTransfer } from './categories';
import { fromISO, isSameMonth } from './dates';

const isFlowTx = (t) => !isTransfer(t.category);

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
    if (!isFlowTx(t)) continue;
    const d = fromISO(t.date);
    if (!isSameMonth(d, date)) continue;
    const amt = Number(t.amount) || 0;
    if (amt >= 0) income += amt;
    else expense += amt;
  }
  return { income, expense, net: income + expense };
}

/**
 * Sum signed transactions over a rolling window ending on `endDate` (inclusive).
 * Default window is 30 days. Useful for "last 30 days" dashboard cards that
 * stay meaningful regardless of where you are in the calendar month.
 */
export function rollingFlow(transactions = [], days = 30, endDate = new Date()) {
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);

  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (!isFlowTx(t)) continue;
    const d = fromISO(t.date);
    if (d < start || d > end) continue;
    const amt = Number(t.amount) || 0;
    if (amt >= 0) income += amt;
    else expense += amt;
  }
  return { income, expense, net: income + expense, start, end };
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

/** Rolling 30-day vs prior 30-day comparison. */
export function rollingOverRolling(transactions = [], days = 30, endDate = new Date()) {
  const end = new Date(endDate);
  const prevEnd = new Date(end);
  prevEnd.setDate(prevEnd.getDate() - days);
  const cur = rollingFlow(transactions, days, end);
  const last = rollingFlow(transactions, days, prevEnd);
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

/**
 * Daily spending totals for a window. Returns an array aligned with each
 * day in the window, keyed by ISO date.
 *   [{ date: '2026-04-05', spending: 42.18, income: 0 }, ...]
 */
export function dailyFlow(transactions = [], days = 30, endDate = new Date()) {
  const out = [];
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  const buckets = new Map();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const iso = isoOf(d);
    const row = { date: iso, spending: 0, income: 0 };
    out.push(row);
    buckets.set(iso, row);
  }
  for (const t of transactions) {
    if (!isFlowTx(t)) continue;
    const row = buckets.get(t.date);
    if (!row) continue;
    const amt = Number(t.amount) || 0;
    if (amt < 0) row.spending += -amt;
    else row.income += amt;
  }
  return out;
}

function isoOf(d) {
  const tz = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

/**
 * Spending grouped by category for a window.
 * Returns [{ category, total }, ...] sorted descending by total.
 */
export function spendingByCategory(transactions = [], days = 30, endDate = new Date()) {
  const totals = new Map();
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);
  for (const t of transactions) {
    if (!isFlowTx(t)) continue;
    const amt = Number(t.amount) || 0;
    if (amt >= 0) continue;
    const d = fromISO(t.date);
    if (d < start || d > end) continue;
    const cat = t.category || 'Other';
    totals.set(cat, (totals.get(cat) || 0) + -amt);
  }
  return [...totals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Per-category spending for a calendar month (current month by default).
 * Returns a plain { Housing: 234.5, Food: 102.0 } map.
 */
export function spendingByCategoryThisMonth(transactions = [], date = new Date()) {
  const map = {};
  for (const t of transactions) {
    if (!isFlowTx(t)) continue;
    const amt = Number(t.amount) || 0;
    if (amt >= 0) continue;
    const d = fromISO(t.date);
    if (!isSameMonth(d, date)) continue;
    const cat = t.category || 'Other';
    map[cat] = (map[cat] || 0) + -amt;
  }
  return map;
}

/**
 * Compute suggested per-category budgets from the last 3 full months of
 * spending plus optional inputs:
 *   - bills:  array of recurring bills; their summed monthly amount is the
 *             floor for the Bills category.
 *   - goals:  array of goals with `targetDate`; the suggested monthly
 *             contribution is added to the suggested 'Savings' target
 *             (returned separately, not as a budget).
 *
 * Categories with no spending and no input get no suggestion.
 */
export function suggestBudgets(transactions = [], bills = [], goals = [], today = new Date()) {
  const months = [];
  for (let i = 1; i <= 3; i += 1) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push(spendingByCategoryThisMonth(transactions, d));
  }
  const cats = new Set();
  months.forEach((m) => Object.keys(m).forEach((k) => cats.add(k)));

  const suggestions = {};
  for (const cat of cats) {
    const totals = months.map((m) => m[cat] || 0);
    const nonZero = totals.filter((v) => v > 0);
    if (nonZero.length === 0) continue;
    const avg = nonZero.reduce((s, v) => s + v, 0) / nonZero.length;
    // Round to nearest $5 for tidier numbers.
    suggestions[cat] = Math.max(5, Math.round(avg / 5) * 5);
  }

  // Bills floor: ensure Bills budget covers the known recurring monthly total.
  const billsMonthly = bills.reduce(
    (sum, b) => sum + (Number(b.amount) || 0),
    0,
  );
  if (billsMonthly > 0) {
    suggestions.Bills = Math.max(suggestions.Bills || 0, Math.round(billsMonthly / 5) * 5);
  }

  // Savings target from goals — informational, not a category budget.
  let savingsTarget = 0;
  for (const g of goals) {
    if (!g.targetDate) continue;
    const prog = goalProgress(g, today);
    if (prog.suggestedMonthly && prog.suggestedMonthly > 0) {
      savingsTarget += prog.suggestedMonthly;
    }
  }

  return { suggestions, savingsTarget: Math.round(savingsTarget / 5) * 5 };
}

/**
 * Per-category budget status for a given month.
 * Returns [{ category, budget, spent, remaining, pct, state }, ...].
 * state: 'good' (<80%), 'warn' (80-100%), 'over' (>100%)
 */
export function budgetStatus(budgets = {}, transactions = [], date = new Date()) {
  const spent = spendingByCategoryThisMonth(transactions, date);
  const out = [];
  // All categories that have either a budget or any spend
  const cats = new Set([...Object.keys(budgets), ...Object.keys(spent)]);
  for (const cat of cats) {
    const budget = Number(budgets[cat]) || 0;
    const used = Number(spent[cat]) || 0;
    const remaining = budget - used;
    const pct = budget > 0 ? used / budget : 0;
    let state = 'good';
    if (budget > 0) {
      if (pct > 1) state = 'over';
      else if (pct >= 0.8) state = 'warn';
    }
    out.push({ category: cat, budget, spent: used, remaining, pct, state });
  }
  // Sort: over-budget first, then by % descending, then unbudgeted at end.
  return out.sort((a, b) => {
    if (a.state === 'over' && b.state !== 'over') return -1;
    if (b.state === 'over' && a.state !== 'over') return 1;
    if (a.budget && !b.budget) return -1;
    if (b.budget && !a.budget) return 1;
    return b.pct - a.pct;
  });
}

/**
 * Goal progress + on-track status.
 * onTrack: null when there's no targetDate; otherwise true/false.
 * suggestedMonthly: null when no targetDate; otherwise the contribution needed
 * each remaining month to hit the target.
 */
export function goalProgress(goal, today = new Date()) {
  const target = Number(goal.targetAmount) || 0;
  const current = Number(goal.currentAmount) || 0;
  const pct = target > 0 ? Math.min(1, current / target) : current > 0 ? 1 : 0;

  if (!goal.targetDate) {
    return { pct, onTrack: null, suggestedMonthly: null, daysLeft: null };
  }
  const target_d = fromISO(goal.targetDate);
  const today_d = new Date(today);
  today_d.setHours(0, 0, 0, 0);
  target_d.setHours(0, 0, 0, 0);

  const totalDays = Math.max(
    1,
    Math.round((target_d - fromISO(goal.createdAt || goal.targetDate)) / 86_400_000),
  );
  const elapsed = Math.max(
    0,
    Math.round((today_d - fromISO(goal.createdAt || goal.targetDate)) / 86_400_000),
  );
  const expectedPct = Math.min(1, elapsed / totalDays);
  const onTrack = pct >= expectedPct - 0.05;

  const daysLeft = Math.max(0, Math.round((target_d - today_d) / 86_400_000));
  const monthsLeft = Math.max(1, daysLeft / 30);
  const remaining = Math.max(0, target - current);
  const suggestedMonthly = remaining / monthsLeft;

  return { pct, onTrack, suggestedMonthly, daysLeft };
}

/**
 * For a bill with a dueDay, compute the next occurrence on or after `from`.
 * Handles months that don't have day 31 etc. by clamping to last day.
 */
export function nextBillDue(bill, from = new Date()) {
  const day = clampDayForMonth(bill.dueDay, from.getFullYear(), from.getMonth());
  const candidate = new Date(from.getFullYear(), from.getMonth(), day);
  candidate.setHours(0, 0, 0, 0);
  const today = new Date(from);
  today.setHours(0, 0, 0, 0);
  if (candidate >= today) return candidate;
  // Next month
  const nm = from.getMonth() + 1;
  const ny = from.getFullYear() + (nm > 11 ? 1 : 0);
  const nmIdx = nm % 12;
  return new Date(ny, nmIdx, clampDayForMonth(bill.dueDay, ny, nmIdx));
}

function clampDayForMonth(day, year, monthIdx) {
  const last = new Date(year, monthIdx + 1, 0).getDate();
  return Math.min(day, last);
}

export function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Bills due within `days` from `from`, sorted ascending. Each entry includes
 * the next due date and whether it's been paid for that month.
 */
export function upcomingBills(bills = [], days = 30, from = new Date()) {
  const horizon = new Date(from);
  horizon.setDate(horizon.getDate() + days);
  return bills
    .map((b) => {
      const due = nextBillDue(b, from);
      return { bill: b, due, monthKey: monthKey(due) };
    })
    .filter(({ due }) => due <= horizon)
    .map((row) => ({
      ...row,
      paid: (row.bill.paidMonths || []).includes(row.monthKey),
    }))
    .sort((a, b) => a.due - b.due);
}
