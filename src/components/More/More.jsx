import {
  PiggyBank,
  Target,
  Receipt,
  Wallet,
  Settings as SettingsIcon,
  ChevronRight,
} from 'lucide-react';
import PageHeader from '../common/PageHeader';
import { useNav } from '../../App';

const items = [
  {
    id: 'budgets',
    label: 'Budgets',
    sub: 'Set monthly limits, track progress',
    icon: PiggyBank,
    color: 'var(--positive)',
  },
  {
    id: 'goals',
    label: 'Goals',
    sub: "What you're saving toward",
    icon: Target,
    color: 'var(--accent)',
  },
  {
    id: 'bills',
    label: 'Bills',
    sub: "What's due, and when",
    icon: Receipt,
    color: 'var(--accent-warm)',
  },
  {
    id: 'accounts',
    label: 'Accounts',
    sub: 'Cash, investments, debts',
    icon: Wallet,
    color: 'var(--ink)',
  },
  {
    id: 'settings',
    label: 'Settings',
    sub: 'Linked banks, backup, danger zone',
    icon: SettingsIcon,
    color: 'var(--ink-muted)',
  },
];

export default function More() {
  const { go } = useNav();

  return (
    <div>
      <PageHeader title="More" subtitle="Everything else." />

      <div style={styles.list}>
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <button
              key={it.id}
              className="tap"
              onClick={() => go(it.id)}
              style={styles.row}
            >
              <div style={{ ...styles.iconBox, color: it.color }}>
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <div style={styles.center}>
                <div style={styles.label}>{it.label}</div>
                <div style={styles.sub}>{it.sub}</div>
              </div>
              <ChevronRight size={18} color="var(--ink-subtle)" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  row: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 16px',
    background: 'var(--surface)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-md)',
    minHeight: 64,
    textAlign: 'left',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 'var(--radius-pill)',
    background: 'var(--surface-warm)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  center: { flex: 1, minWidth: 0 },
  label: { fontSize: 16, fontWeight: 500 },
  sub: { color: 'var(--ink-muted)', fontSize: 13, marginTop: 2 },
};
