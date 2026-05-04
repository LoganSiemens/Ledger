import { categoryColor, categoryIcon, getCategory } from '../../utils/categories';
import { relativeDay } from '../../utils/dates';
import Money from './Money';

export default function TxRow({ tx, accountName, onClick }) {
  const Icon = categoryIcon(tx.category);
  const cat = getCategory(tx.category);
  const color = categoryColor(tx.category);

  return (
    <button
      className="tap"
      onClick={onClick}
      style={styles.row}
      aria-label={`${tx.description || cat.label}, ${tx.amount}`}
    >
      <div style={{ ...styles.icon, background: `${color}22`, color }}>
        <Icon size={18} strokeWidth={1.75} />
      </div>
      <div style={styles.center}>
        <div style={styles.desc}>{tx.description || cat.label}</div>
        <div style={styles.meta}>
          <span>{cat.label}</span>
          {accountName && (
            <>
              <span style={styles.dot} />
              <span>{accountName}</span>
            </>
          )}
          <span style={styles.dot} />
          <span>{relativeDay(tx.date)}</span>
        </div>
      </div>
      <Money value={tx.amount} signed size={15} weight={500} />
    </button>
  );
}

const styles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    padding: '12px 14px',
    background: 'var(--surface)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-md)',
    textAlign: 'left',
    minHeight: 64,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 'var(--radius-pill)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  center: { flex: 1, minWidth: 0 },
  desc: {
    fontSize: 15,
    fontWeight: 500,
    color: 'var(--ink)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--ink-muted)',
    fontSize: 12,
    marginTop: 2,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 999,
    background: 'var(--ink-subtle)',
  },
};
