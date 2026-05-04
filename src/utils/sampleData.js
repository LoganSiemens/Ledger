import { todayISO, toISO } from './dates';
import { writeStorage } from '../hooks/useStorage';

function uid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function buildSampleData() {
  const checking = uid();
  const savings = uid();
  const investment = uid();
  const credit = uid();

  const accounts = [
    { id: checking, name: 'Everyday Checking', type: 'checking', balance: 2840.55, createdAt: todayISO() },
    { id: savings, name: 'Rainy Day', type: 'savings', balance: 6200.0, createdAt: todayISO() },
    { id: investment, name: 'Brokerage', type: 'investment', balance: 14820.12, createdAt: todayISO() },
    { id: credit, name: 'Travel Card', type: 'credit', balance: 482.31, createdAt: todayISO() },
  ];

  const transactions = [
    { id: uid(), date: dateOffset(-1), amount: -42.18, description: 'Groceries — Trader Joe\'s', category: 'Food', accountId: checking },
    { id: uid(), date: dateOffset(-2), amount: -14.5, description: 'Coffee', category: 'Food', accountId: checking },
    { id: uid(), date: dateOffset(-3), amount: -86.4, description: 'Gas', category: 'Transport', accountId: credit },
    { id: uid(), date: dateOffset(-5), amount: -1450, description: 'Rent', category: 'Housing', accountId: checking },
    { id: uid(), date: dateOffset(-6), amount: -22.0, description: 'Phone bill', category: 'Bills', accountId: checking },
    { id: uid(), date: dateOffset(-7), amount: -68.2, description: 'New running shoes', category: 'Shopping', accountId: credit },
    { id: uid(), date: dateOffset(-8), amount: 3200, description: 'Paycheck', category: 'Income', accountId: checking },
    { id: uid(), date: dateOffset(-10), amount: -54.0, description: 'Pharmacy', category: 'Health', accountId: checking },
    { id: uid(), date: dateOffset(-12), amount: -38.75, description: 'Dinner out', category: 'Food', accountId: credit },
    { id: uid(), date: dateOffset(-15), amount: -120, description: 'Internet', category: 'Bills', accountId: checking },
    { id: uid(), date: dateOffset(-18), amount: -28.0, description: 'Bookstore', category: 'Shopping', accountId: checking },
    { id: uid(), date: dateOffset(-22), amount: 3200, description: 'Paycheck', category: 'Income', accountId: checking },
    { id: uid(), date: dateOffset(-25), amount: -1450, description: 'Rent', category: 'Housing', accountId: checking },
    { id: uid(), date: dateOffset(-28), amount: -64.3, description: 'Groceries — Whole Foods', category: 'Food', accountId: checking },
  ];

  return { accounts, transactions };
}

export function loadSampleData() {
  const sample = buildSampleData();
  writeStorage('accounts', sample.accounts);
  writeStorage('transactions', sample.transactions);
}
