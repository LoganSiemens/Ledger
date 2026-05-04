import { useMemo } from 'react';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import Money from '../common/Money';
import { useBudgets, useTransactions } from '../../hooks/useFinanceData';
import { budgetStatus } from '../../utils/calculations';
import { categoryColor, categoryIcon, getCategory } from '../../utils/categories';

export default function BudgetCard({ onOpen }) {
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();
  const status = useMemo(
    () => budgetStatus(budgets, transactions),
    [budgets, transactions],
  );

  const hasBudgets = Object.keys(budgets).length > 0;
  if (!hasBudgets) return null;

  // Show first 3 in already-sorted (over → high % → unbudgeted) order.
  const top = status
    .filter((r) => r.budget > 0)
    .slice(0, 3);

  if (top.length === 0) return null;

  const overCount = status.filter((r) => r.state === 'over').length;

  return (
    <button className="tap" onClick={onOpen} style={styles.card}>
      <header style={styles.head}>
        <h3 style={styles.title}>This month&rsquo;s budgets</h3>
        <span style={styles.cta}>
          {overCount > 0 ? (
            <span style={{ color: 'var(--negative)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={13} />
              {overCount} over
            </span>
          ) : (
            <span style={{ color: 'var(--ink-muted)' }}>on pace</span>
          )}
          <ChevronRight size={16} color="var(--ink-subtle)" />
        </span>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {top.map((row) => {
          const cat = getCategory(row.category);
          const Icon = categoryIcon(row.category);
          const color = categoryColor(row.category);
          const barColor =
            row.state === 'over'
              ? 'var(--negative)'
              : row.state === 'warn'
                ? 'var(--accent-warm)'
                : 'var(--positive)';
          return (
            <div key={row.category} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={styles.line}>
                <div style={styles.lineLeft}>
                  <div style={{ ...styles.iconBox, background: `${color}22`, color }}>
                    <Icon size={12} strokeWidth={1.75} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{cat.label}</span>
                </div>
                <div style={styles.lineRight}>
                  <Money value={row.spent} size={12} weight={500} family="body" />
                  <span style={styles.of}>&nbsp;/&nbsp;</span>
                  <Money value={row.budget} size={12} muted family="body" />
                </div>
              </div>
              <div style={styles.bar}>
                <div
                  style={{
                    ...styles.barInner,
                    width: `${Math.min(100, Math.round(row.pct * 100))}%`,
                    background: barColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </button>
  );
}

const styles = {
  card: {
    width: '100%',
    textAlign: 'left',
    background: 'var(--surface)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-lg)',
    padding: 18,
    boxShadow: 'var(--shadow-soft)',
    marginTop: 16,
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 16,
    fontWeight: 500,
  },
  cta: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 },
  line: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  lineLeft: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 },
  lineRight: { display: 'flex', alignItems: 'baseline' },
  of: { color: 'var(--ink-subtle)', fontSize: 11 },
  iconBox: {
    width: 22,
    height: 22,
    borderRadius: 'var(--radius-pill)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bar: {
    height: 4,
    background: 'var(--surface-warm)',
    border: '1px solid var(--border-soft)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  barInner: { height: '100%', transition: 'width 240ms ease' },
};
