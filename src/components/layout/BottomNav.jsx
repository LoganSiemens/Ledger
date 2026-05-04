import { LayoutDashboard, Calendar, ListTree, PiggyBank, Menu } from 'lucide-react';

const items = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'transactions', label: 'Activity', icon: ListTree },
  { id: 'budgets', label: 'Budgets', icon: PiggyBank },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'more', label: 'More', icon: Menu },
];

const SECONDARY_TABS = ['accounts', 'goals', 'bills', 'settings'];

export default function BottomNav({ tab, onChange }) {
  return (
    <nav style={styles.bar} aria-label="Primary">
      {items.map((it) => {
        const Icon = it.icon;
        const active = tab === it.id || (it.id === 'more' && SECONDARY_TABS.includes(tab));
        return (
          <button
            key={it.id}
            className="tap"
            style={{ ...styles.btn, color: active ? 'var(--ink)' : 'var(--ink-subtle)' }}
            onClick={() => onChange(it.id)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={22} strokeWidth={active ? 2 : 1.5} />
            <span style={{ ...styles.label, fontWeight: active ? 600 : 500 }}>{it.label}</span>
            {active && <span style={styles.dot} />}
          </button>
        );
      })}
    </nav>
  );
}

const styles = {
  bar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 50,
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    background: 'rgba(245, 241, 234, 0.92)',
    backdropFilter: 'saturate(140%) blur(14px)',
    WebkitBackdropFilter: 'saturate(140%) blur(14px)',
    borderTop: '1px solid var(--border-soft)',
    paddingBottom: 'calc(var(--safe-bottom) + 4px)',
  },
  btn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: '10px 4px 6px',
    minHeight: 56,
    position: 'relative',
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
  dot: {
    position: 'absolute',
    top: 4,
    width: 4,
    height: 4,
    borderRadius: 999,
    background: 'var(--accent)',
  },
};
