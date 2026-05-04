const items = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'goals', label: 'Goals' },
  { id: 'bills', label: 'Bills' },
  { id: 'settings', label: 'Settings' },
];

export default function TopNav({ tab, onChange }) {
  return (
    <header style={styles.bar}>
      <div style={styles.brand}>
        <span style={styles.glyph}>◐</span>
        <span style={styles.brandName}>Ledger</span>
      </div>
      <nav style={styles.tabs} aria-label="Primary">
        {items.map((it) => {
          const active = tab === it.id;
          return (
            <button
              key={it.id}
              className="tap"
              style={{
                ...styles.tab,
                color: active ? 'var(--ink)' : 'var(--ink-muted)',
                background: active ? 'var(--surface-warm)' : 'transparent',
                borderColor: active ? 'var(--border)' : 'transparent',
              }}
              onClick={() => onChange(it.id)}
              aria-current={active ? 'page' : undefined}
            >
              {it.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

const styles = {
  bar: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: '14px 24px',
    background: 'rgba(245, 241, 234, 0.86)',
    backdropFilter: 'saturate(140%) blur(14px)',
    WebkitBackdropFilter: 'saturate(140%) blur(14px)',
    borderBottom: '1px solid var(--border-soft)',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 8 },
  glyph: {
    fontFamily: 'var(--font-display)',
    fontSize: 24,
    color: 'var(--accent)',
    lineHeight: 1,
  },
  brandName: {
    fontFamily: 'var(--font-display)',
    fontSize: 20,
    fontWeight: 500,
    letterSpacing: '-0.01em',
  },
  tabs: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  tab: {
    padding: '8px 12px',
    fontSize: 14,
    fontWeight: 500,
    borderRadius: 'var(--radius-pill)',
    border: '1px solid transparent',
  },
};
