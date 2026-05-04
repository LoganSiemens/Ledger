import {
  Home,
  UtensilsCrossed,
  ShoppingBag,
  Car,
  Heart,
  Briefcase,
  Receipt,
  CircleDot,
} from 'lucide-react';
import { theme } from '../styles/theme';

/**
 * Spending and income categories.
 * `kind` distinguishes income from expense for default behavior.
 */
export const CATEGORIES = [
  { id: 'Income', label: 'Income', kind: 'income', icon: Briefcase },
  { id: 'Housing', label: 'Housing', kind: 'expense', icon: Home },
  { id: 'Food', label: 'Food', kind: 'expense', icon: UtensilsCrossed },
  { id: 'Shopping', label: 'Shopping', kind: 'expense', icon: ShoppingBag },
  { id: 'Transport', label: 'Transport', kind: 'expense', icon: Car },
  { id: 'Health', label: 'Health', kind: 'expense', icon: Heart },
  { id: 'Bills', label: 'Bills', kind: 'expense', icon: Receipt },
  { id: 'Other', label: 'Other', kind: 'expense', icon: CircleDot },
];

const byId = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export const getCategory = (id) => byId[id] || byId.Other;
export const categoryColor = (id) => theme.colors.categories[id] || theme.colors.categories.Other;
export const categoryIcon = (id) => getCategory(id).icon;

/**
 * Account groups — order is the display order on the Accounts screen.
 */
export const ACCOUNT_GROUPS = [
  { id: 'cash', label: 'Cash', sign: 1 },
  { id: 'investments', label: 'Investments', sign: 1 },
  { id: 'debts', label: 'Debts', sign: -1 },
];

export const ACCOUNT_TYPES = [
  { id: 'checking', label: 'Checking', group: 'cash' },
  { id: 'savings', label: 'Savings', group: 'cash' },
  { id: 'cash', label: 'Cash', group: 'cash' },
  { id: 'investment', label: 'Investment', group: 'investments' },
  { id: 'retirement', label: 'Retirement', group: 'investments' },
  { id: 'credit', label: 'Credit card', group: 'debts' },
  { id: 'loan', label: 'Loan', group: 'debts' },
];

const typeById = Object.fromEntries(ACCOUNT_TYPES.map((t) => [t.id, t]));
export const getAccountType = (id) => typeById[id] || ACCOUNT_TYPES[0];
