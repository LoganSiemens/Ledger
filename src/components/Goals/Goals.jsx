import { useMemo, useState } from 'react';
import { Plus, Target, CheckCircle2, AlertTriangle } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import Empty from '../common/Empty';
import Money from '../common/Money';
import Fab from '../common/Fab';
import GoalForm from './GoalForm';
import { useAccounts, useGoals } from '../../hooks/useFinanceData';
import { goalProgress } from '../../utils/calculations';

export default function Goals() {
  const { accounts } = useAccounts();
  const { goals, addGoal, updateGoal, deleteGoal } = useGoals();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const accountById = useMemo(
    () => Object.fromEntries(accounts.map((a) => [a.id, a])),
    [accounts],
  );

  // Optionally reflect linked-account balance back into currentAmount on render.
  const enriched = useMemo(
    () =>
      goals.map((g) => {
        const acct = g.accountId ? accountById[g.accountId] : null;
        const currentFromAccount = acct ? Number(acct.balance) || 0 : null;
        const current = currentFromAccount != null ? currentFromAccount : g.currentAmount;
        return { ...g, displayCurrent: current, accountName: acct?.name };
      }),
    [goals, accountById],
  );

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (g) => {
    setEditing(g);
    setOpen(true);
  };
  const handleSave = (data) => {
    if (editing) updateGoal(editing.id, data);
    else addGoal(data);
  };

  if (goals.length === 0) {
    return (
      <div>
        <PageHeader title="Goals" subtitle="What you're saving toward." />
        <Empty
          icon={Target}
          title="No goals yet"
          message="Set a target with an optional date and we'll show progress and the suggested monthly contribution to hit it."
          action={
            <button className="btn btn-primary" onClick={openNew}>
              <Plus size={16} /> Add a goal
            </button>
          }
        />
        <GoalForm
          open={open}
          initial={editing}
          accounts={accounts}
          onClose={() => setOpen(false)}
          onSave={handleSave}
          onDelete={deleteGoal}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Goals"
        subtitle={`${goals.length} active`}
        action={
          <button className="btn btn-primary" onClick={openNew}>
            <Plus size={16} /> Add
          </button>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {enriched.map((g) => {
          const prog = goalProgress(
            { ...g, currentAmount: g.displayCurrent },
          );
          const target = Number(g.targetAmount) || 0;
          return (
            <button
              key={g.id}
              className="tap"
              onClick={() => openEdit(g)}
              style={styles.card}
            >
              <header style={styles.head}>
                <div style={{ minWidth: 0 }}>
                  <div style={styles.name}>{g.name}</div>
                  {g.accountName && (
                    <div style={styles.linked}>linked · {g.accountName}</div>
                  )}
                </div>
                <Status onTrack={prog.onTrack} />
              </header>

              <div style={styles.amounts}>
                <Money value={g.displayCurrent} size={22} />
                <span style={styles.of}>of</span>
                <Money value={target} muted size={15} />
              </div>

              <div style={styles.progressOuter}>
                <div
                  style={{
                    ...styles.progressInner,
                    width: `${Math.round(prog.pct * 100)}%`,
                    background:
                      prog.onTrack === false
                        ? 'var(--negative)'
                        : prog.pct >= 1
                          ? 'var(--positive)'
                          : 'var(--accent)',
                  }}
                />
              </div>

              <footer style={styles.foot}>
                <span className="tnum">{Math.round(prog.pct * 100)}%</span>
                {g.targetDate && (
                  <span style={styles.metaSep}>
                    {prog.daysLeft != null && (
                      <>
                        {prog.daysLeft === 0
                          ? 'Due today'
                          : prog.daysLeft === 1
                            ? '1 day left'
                            : `${prog.daysLeft} days left`}
                      </>
                    )}
                  </span>
                )}
                {prog.suggestedMonthly != null && prog.suggestedMonthly > 0 && (
                  <span style={styles.metaSep}>
                    save <Money value={prog.suggestedMonthly} size={12} weight={500} family="body" />/mo
                  </span>
                )}
              </footer>
            </button>
          );
        })}
      </div>

      <Fab onClick={openNew} label="Add goal" />

      <GoalForm
        open={open}
        initial={editing}
        accounts={accounts}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        onDelete={deleteGoal}
      />
    </div>
  );
}

function Status({ onTrack }) {
  if (onTrack == null) return null;
  if (onTrack) {
    return (
      <span style={{ ...styles.status, color: 'var(--positive)' }}>
        <CheckCircle2 size={14} strokeWidth={1.75} /> on track
      </span>
    );
  }
  return (
    <span style={{ ...styles.status, color: 'var(--negative)' }}>
      <AlertTriangle size={14} strokeWidth={1.75} /> behind
    </span>
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
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  head: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  name: {
    fontFamily: 'var(--font-display)',
    fontSize: 18,
    fontWeight: 500,
    color: 'var(--ink)',
  },
  linked: {
    fontSize: 12,
    color: 'var(--ink-muted)',
    marginTop: 2,
  },
  amounts: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
  },
  of: { color: 'var(--ink-subtle)', fontSize: 13 },
  progressOuter: {
    height: 6,
    background: 'var(--surface-warm)',
    border: '1px solid var(--border-soft)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressInner: {
    height: '100%',
    transition: 'width 240ms ease',
  },
  foot: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 13,
    color: 'var(--ink-muted)',
    flexWrap: 'wrap',
  },
  status: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    fontWeight: 500,
    flexShrink: 0,
  },
  metaSep: { display: 'flex', alignItems: 'center', gap: 4 },
};
