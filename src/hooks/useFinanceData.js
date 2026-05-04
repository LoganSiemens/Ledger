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

export function useGoals() {
  const [goals, setGoals] = useStorage('goals', []);

  const addGoal = useCallback(
    (data) => {
      const g = {
        id: uid(),
        name: data.name?.trim() || 'Untitled goal',
        targetAmount: Number(data.targetAmount) || 0,
        currentAmount: Number(data.currentAmount) || 0,
        targetDate: data.targetDate || null,
        accountId: data.accountId || null,
        createdAt: todayISO(),
      };
      setGoals((prev) => [...(prev || []), g]);
      return g;
    },
    [setGoals],
  );

  const updateGoal = useCallback(
    (id, patch) => {
      setGoals((prev) =>
        (prev || []).map((g) =>
          g.id === id
            ? {
                ...g,
                ...patch,
                targetAmount: Number(patch.targetAmount ?? g.targetAmount) || 0,
                currentAmount: Number(patch.currentAmount ?? g.currentAmount) || 0,
              }
            : g,
        ),
      );
    },
    [setGoals],
  );

  const deleteGoal = useCallback(
    (id) => setGoals((prev) => (prev || []).filter((g) => g.id !== id)),
    [setGoals],
  );

  return { goals: goals || [], addGoal, updateGoal, deleteGoal };
}

export function useBills() {
  const [bills, setBills] = useStorage('bills', []);

  const addBill = useCallback(
    (data) => {
      const b = {
        id: uid(),
        name: data.name?.trim() || 'Untitled bill',
        amount: Math.abs(Number(data.amount) || 0),
        dueDay: clampDay(data.dueDay),
        category: data.category || 'Bills',
        accountId: data.accountId || null,
        notes: data.notes?.trim() || '',
        paidMonths: [],
        createdAt: todayISO(),
      };
      setBills((prev) => [...(prev || []), b]);
      return b;
    },
    [setBills],
  );

  const updateBill = useCallback(
    (id, patch) => {
      setBills((prev) =>
        (prev || []).map((b) =>
          b.id === id
            ? {
                ...b,
                ...patch,
                amount: Math.abs(Number(patch.amount ?? b.amount) || 0),
                dueDay: clampDay(patch.dueDay ?? b.dueDay),
              }
            : b,
        ),
      );
    },
    [setBills],
  );

  const deleteBill = useCallback(
    (id) => setBills((prev) => (prev || []).filter((b) => b.id !== id)),
    [setBills],
  );

  /** Toggle paid-state for a given bill in a given YYYY-MM key. */
  const togglePaid = useCallback(
    (id, monthKey) => {
      setBills((prev) =>
        (prev || []).map((b) => {
          if (b.id !== id) return b;
          const set = new Set(b.paidMonths || []);
          if (set.has(monthKey)) set.delete(monthKey);
          else set.add(monthKey);
          return { ...b, paidMonths: [...set] };
        }),
      );
    },
    [setBills],
  );

  return { bills: bills || [], addBill, updateBill, deleteBill, togglePaid };
}

function clampDay(d) {
  const n = Number(d) || 1;
  return Math.max(1, Math.min(31, Math.round(n)));
}

export function useBudgets() {
  const [budgets, setBudgets] = useStorage('budgets', {});

  const setBudget = useCallback(
    (category, amount) => {
      setBudgets((prev) => {
        const next = { ...(prev || {}) };
        const v = Number(amount) || 0;
        if (v <= 0) delete next[category];
        else next[category] = v;
        return next;
      });
    },
    [setBudgets],
  );

  const setAll = useCallback(
    (map) => setBudgets(map || {}),
    [setBudgets],
  );

  const clearBudget = useCallback(
    (category) => {
      setBudgets((prev) => {
        const next = { ...(prev || {}) };
        delete next[category];
        return next;
      });
    },
    [setBudgets],
  );

  return { budgets: budgets || {}, setBudget, setAll, clearBudget };
}
