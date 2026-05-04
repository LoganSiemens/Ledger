import { useMemo, useState } from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, PiggyBank } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import Empty from '../common/Empty';
import Money from '../common/Money';
import Modal from '../common/Modal';
import BudgetForm from './BudgetForm';
import {
  useBills,
  useBudgets,
  useGoals,
  useTransactions,
} from '../../hooks/useFinanceData';
import { budgetStatus, suggestBudgets } from '../../utils/calculations';
import { categoryColor, categoryIcon, getCategory, CATEGORIES } from '../../utils/categories';

export default function Budgets() {
  const { transactions } = useTransactions();
  const { bills } = useBills();
  const { goals } = useGoals();
  const { budgets, setBudget, setAll, clearBudget } = useBudgets();

  const [editing, setEditing] = useState(null); // category id
  const [suggestOpen, setSuggestOpen] = useState(false);

  const status = useMemo(
    () => budgetStatus(budgets, transactions),
    [budgets, transactions],
  );

  const totalBudget = useMemo(
    () => Object.values(budgets).reduce((s, v) => s + (Number(v) || 0), 0),
    [budgets],
  );
  const totalSpent = useMemo(
    () => status.reduce((s, r) => s + r.spent, 0),
    [status],
  );

  const overCount = status.filter((r) => r.state === 'over').length;
  const hasBudgets = Object.keys(budgets).length > 0;

  const monthName = new Date().toLocaleDateString(undefined, {
    month: 'long',
  });

  if (!hasBudgets) {
    return (
      <div>
        <PageHeader title="Budgets" subtitle="What you've decided to spend each month." />
        <Empty
          icon={Sparkles}
          title="No budgets yet"
          message="Set monthly limits per category. We can suggest reasonable starting numbers based on your last 3 months of spending and known recurring bills."
          action={
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => setSuggestOpen(true)}>
                <Sparkles size={16} /> Suggest budgets
              </button>
              <button className="btn" onClick={() => setEditing('Food')}>
                Set one manually
              </button>
            </div>
          }
        />
        <SuggestModal
          open={suggestOpen}
          transactions={transactions}
          bills={bills}
          goals={goals}
          existing={budgets}
          onClose={() => setSuggestOpen(false)}
          onApply={(map) => {
            setAll(map);
            setSuggestOpen(false);
          }}
        />
        <BudgetForm
          open={editing !== null}
          category={editing}
          current={editing ? budgets[editing] : 0}
          onClose={() => setEditing(null)}
          onSave={(cat, amt) => setBudget(cat, amt)}
          onClear={(cat) => clearBudget(cat)}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Budgets"
        subtitle={`${monthName} · ${overCount > 0 ? `${overCount} over budget` : 'on pace'}`}
        action={
          <button className="btn" onClick={() => setSuggestOpen(true)}>
            <Sparkles size={14} /> Re-suggest
          </button>
        }
      />

      <section style={styles.totalCard}>
        <div style={styles.totalRow}>
          <div>
            <div style={styles.totalLabel}>Spent this month</div>
            <Money value={totalSpent} size={28} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={styles.totalLabel}>Budget</div>
            <Money value={totalBudget} size={20} muted />
          </div>
        </div>
        <ProgressBar
          pct={totalBudget > 0 ? totalSpent / totalBudget : 0}
          state={
            totalBudget && totalSpent > totalBudget
              ? 'over'
              : totalBudget && totalSpent / totalBudget >= 0.8
                ? 'warn'
                : 'good'
          }
        />
      </section>

      <h3 style={styles.sectionTitle}>By category</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {status.map((row) => {
          const cat = getCategory(row.category);
          if (cat.kind === 'transfer' || cat.id === 'Income') return null;
          const Icon = categoryIcon(row.category);
          const color = categoryColor(row.category);
          return (
            <button
              key={row.category}
              className="tap"
              onClick={() => setEditing(row.category)}
              style={styles.row}
            >
              <div style={styles.rowHead}>
                <div style={styles.rowHeadLeft}>
                  <div style={{ ...styles.iconBox, background: `${color}22`, color }}>
                    <Icon size={16} strokeWidth={1.75} />
                  </div>
                  <div style={styles.rowName}>{cat.label}</div>
                  <StatusBadge state={row.state} hasBudget={row.budget > 0} />
                </div>
                <div style={styles.rowAmounts}>
                  <Money value={row.spent} size={14} weight={500} family="body" />
                  {row.budget > 0 && (
                    <span style={styles.of}>
                      &nbsp;/&nbsp;
                      <Money value={row.budget} size={13} muted family="body" />
                    </span>
                  )}
                </div>
              </div>
              {row.budget > 0 ? (
                <ProgressBar pct={row.pct} state={row.state} />
              ) : (
                <div style={styles.unbudgeted}>No budget set — tap to add</div>
              )}
            </button>
          );
        })}
      </div>

      <SuggestModal
        open={suggestOpen}
        transactions={transactions}
        bills={bills}
        goals={goals}
        existing={budgets}
        onClose={() => setSuggestOpen(false)}
        onApply={(map) => {
          setAll(map);
          setSuggestOpen(false);
        }}
      />

      <BudgetForm
        open={editing !== null}
        category={editing}
        current={editing ? budgets[editing] : 0}
        onClose={() => setEditing(null)}
        onSave={(cat, amt) => setBudget(cat, amt)}
        onClear={(cat) => clearBudget(cat)}
      />
    </div>
  );
}

function ProgressBar({ pct, state }) {
  const safe = Math.min(1, Math.max(0, pct || 0));
  const overflow = Math.max(0, (pct || 0) - 1);
  const color =
    state === 'over'
      ? 'var(--negative)'
      : state === 'warn'
        ? 'var(--accent-warm)'
        : 'var(--positive)';
  return (
    <div style={styles.progressOuter}>
      <div
        style={{
          ...styles.progressInner,
          width: `${Math.round(safe * 100)}%`,
          background: color,
        }}
      />
      {overflow > 0 && (
        <div
          style={{
            ...styles.progressOverflow,
            width: `${Math.min(20, Math.round(overflow * 100))}%`,
          }}
        />
      )}
    </div>
  );
}

function StatusBadge({ state, hasBudget }) {
  if (!hasBudget) return null;
  if (state === 'over') {
    return (
      <span style={{ ...styles.badge, color: 'var(--negative)' }}>
        <AlertTriangle size={12} strokeWidth={1.75} /> over
      </span>
    );
  }
  if (state === 'warn') {
    return (
      <span style={{ ...styles.badge, color: 'var(--accent-warm)' }}>
        <AlertTriangle size={12} strokeWidth={1.75} /> close
      </span>
    );
  }
  return (
    <span style={{ ...styles.badge, color: 'var(--positive)' }}>
      <CheckCircle2 size={12} strokeWidth={1.75} /> good
    </span>
  );
}

function SuggestModal({ open, transactions, bills, goals, existing, onClose, onApply }) {
  const result = useMemo(() => {
    if (!open) return { suggestions: {}, savingsTarget: 0 };
    return suggestBudgets(transactions, bills, goals);
  }, [open, transactions, bills, goals]);

  const merged = useMemo(
    () => ({ ...result.suggestions, ...existing, ...result.suggestions }),
    [result.suggestions, existing],
  );
  // Note: existing values are kept where suggestions don't overwrite. For
  // re-suggest, the user expects fresh numbers, so suggestions win.

  const apply = () => onApply(result.suggestions);

  if (!open) return null;

  const rows = Object.entries(result.suggestions)
    .map(([cat, amt]) => ({ cat, amt, prev: existing?.[cat] || 0 }))
    .sort((a, b) => b.amt - a.amt);

  return (
    <Modal
      open={open}
      title="Suggested budgets"
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={apply}>
            Apply suggestions
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--ink-muted)', fontSize: 14, margin: '0 0 16px' }}>
        Based on the last 3 months of spending, plus your recurring bills.
        Round numbers to the nearest $5. Tweak each category later if these
        feel too tight or loose.
      </p>

      {rows.length === 0 ? (
        <p style={{ color: 'var(--ink-muted)' }}>
          Not enough spending history yet to suggest budgets. Try again next
          month, or set them manually.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rows.map((r) => {
            const Icon = categoryIcon(r.cat);
            const color = categoryColor(r.cat);
            const cat = getCategory(r.cat);
            return (
              <div key={r.cat} style={styles.suggestRow}>
                <div style={{ ...styles.iconBox, background: `${color}22`, color }}>
                  <Icon size={14} strokeWidth={1.75} />
                </div>
                <div style={{ flex: 1, fontSize: 14 }}>{cat.label}</div>
                {r.prev > 0 && r.prev !== r.amt && (
                  <span style={styles.suggestPrev}>
                    <Money value={r.prev} size={12} muted family="body" /> →
                  </span>
                )}
                <Money value={r.amt} size={14} weight={500} family="body" />
              </div>
            );
          })}
        </div>
      )}

      {result.savingsTarget > 0 && (
        <div style={styles.savingsBox}>
          <PiggyBank size={16} color="var(--positive)" />
          <span style={{ fontSize: 13 }}>
            Goal contributions suggest setting aside&nbsp;
            <strong>
              <Money value={result.savingsTarget} size={13} family="body" weight={600} />
            </strong>
            &nbsp;per month toward your goals.
          </span>
        </div>
      )}
    </Modal>
  );
}

const styles = {
  totalCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-lg)',
    padding: 20,
    boxShadow: 'var(--shadow-soft)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  totalRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 12,
    color: 'var(--ink-muted)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 16,
    fontWeight: 500,
    color: 'var(--ink-muted)',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    margin: '20px 0 10px',
    paddingInline: 4,
  },
  row: {
    width: '100%',
    textAlign: 'left',
    background: 'var(--surface)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-md)',
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  rowHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowHeadLeft: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 },
  rowName: {
    fontSize: 15,
    fontWeight: 500,
    color: 'var(--ink)',
  },
  rowAmounts: { display: 'flex', alignItems: 'baseline', flexShrink: 0 },
  of: { color: 'var(--ink-subtle)', fontSize: 12, display: 'inline-flex', alignItems: 'center' },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-pill)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    fontSize: 11,
    fontWeight: 500,
    marginLeft: 4,
  },
  progressOuter: {
    height: 6,
    background: 'var(--surface-warm)',
    border: '1px solid var(--border-soft)',
    borderRadius: 999,
    overflow: 'hidden',
    position: 'relative',
  },
  progressInner: {
    height: '100%',
    transition: 'width 240ms ease',
  },
  progressOverflow: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%',
    background: 'repeating-linear-gradient(45deg, var(--negative), var(--negative) 4px, rgba(255,255,255,0.4) 4px, rgba(255,255,255,0.4) 8px)',
  },
  unbudgeted: {
    fontSize: 12,
    color: 'var(--ink-subtle)',
    fontStyle: 'italic',
  },
  suggestRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 10px',
    background: 'var(--surface-warm)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-md)',
  },
  suggestPrev: { color: 'var(--ink-subtle)', fontSize: 12 },
  savingsBox: {
    marginTop: 16,
    padding: 12,
    background: 'rgba(122, 155, 118, 0.08)',
    border: '1px solid rgba(122, 155, 118, 0.2)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
};
