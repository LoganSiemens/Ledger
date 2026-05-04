import { useCallback } from 'react';
import { useStorage } from './useStorage';
import { todayISO } from '../utils/dates';

const uid = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

const DEFAULT_SETTINGS = { currency: 'USD', weekStartsOn: 0 };

export function useSettings() {
  const [settings, setSettings] = useStorage('settings', DEFAULT_SETTINGS);
  return [{ ...DEFAULT_SETTINGS, ...settings }, setSettings];
}

export function useAccounts() {
  const [accounts, setAccounts] = useStorage('accounts', []);

  const addAccount = useCallback(
    (data) => {
      const a = {
        id: uid(),
        name: data.name?.trim() || 'Untitled',
        type: data.type || 'checking',
        balance: Number(data.balance) || 0,
        createdAt: todayISO(),
      };
      setAccounts((prev) => [...(prev || []), a]);
      return a;
    },
    [setAccounts],
  );

  const updateAccount = useCallback(
    (id, patch) => {
      setAccounts((prev) =>
        (prev || []).map((a) =>
          a.id === id ? { ...a, ...patch, balance: Number(patch.balance ?? a.balance) || 0 } : a,
        ),
      );
    },
    [setAccounts],
  );

  const deleteAccount = useCallback(
    (id) => {
      setAccounts((prev) => (prev || []).filter((a) => a.id !== id));
    },
    [setAccounts],
  );

  return { accounts: accounts || [], addAccount, updateAccount, deleteAccount };
}

export function useTransactions() {
  const [transactions, setTransactions] = useStorage('transactions', []);

  const addTransaction = useCallback(
    (data) => {
      const amount = Number(data.amount) || 0;
      // If category is Income, force positive; else expense (negative).
      const signed = data.category === 'Income' ? Math.abs(amount) : -Math.abs(amount);
      const t = {
        id: uid(),
        date: data.date || todayISO(),
        amount: signed,
        description: data.description?.trim() || '',
        category: data.category || 'Other',
        accountId: data.accountId || null,
      };
      setTransactions((prev) => [...(prev || []), t]);
      return t;
    },
    [setTransactions],
  );

  const updateTransaction = useCallback(
    (id, patch) => {
      setTransactions((prev) =>
        (prev || []).map((t) => {
          if (t.id !== id) return t;
          const merged = { ...t, ...patch };
          const amt = Number(merged.amount) || 0;
          merged.amount = merged.category === 'Income' ? Math.abs(amt) : -Math.abs(amt);
          return merged;
        }),
      );
    },
    [setTransactions],
  );

  const deleteTransaction = useCallback(
    (id) => {
      setTransactions((prev) => (prev || []).filter((t) => t.id !== id));
    },
    [setTransactions],
  );

  return {
    transactions: transactions || [],
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
