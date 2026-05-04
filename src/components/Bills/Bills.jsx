import { useMemo, useState } from 'react';
import { Plus, Receipt, Check, Circle } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import Empty from '../common/Empty';
import Money from '../common/Money';
import Fab from '../common/Fab';
import BillForm from './BillForm';
import {
  useAccounts,
  useBills,
  useTransactions,
} from '../../hooks/useFinanceData';
import { upcomingBills, monthKey } from '../../utils/calculations';
import { categoryColor, categoryIcon, getCategory } from '../../utils/categories';
import { toISO, relativeDay } from '../../utils/dates';

export default function Bills() {
  const { accounts } = useAccounts();
  const { bills, addBill, updateBill, deleteBill, togglePaid } = useBills();
  const { addTransaction } = useTransactions();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const upcoming = useMemo(() => upcomingBills(bills, 30), [bills]);
  const totalDue = useMemo(
    () =>
      upcoming
        .filter((u) => !u.paid)
        .reduce((sum, u) => sum + Number(u.bill.amount || 0), 0),
    [upcoming],
  );

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (b) => {
    setEditing(b);
    setOpen(true);
  };
  const handleSave = (data) => {
    if (editing) updateBill(editing.id, data);
    else addBill(data);
  };

  const handleTogglePaid = (e, bill, due, mKey, alreadyPaid) => {
    e.stopPropagation();
    togglePaid(bill.id, mKey);
    if (!alreadyPaid) {
      addTransaction({
        date: toISO(due),
        amount: bill.amount,
        description: bill.name,
        category: bill.category,
        accountId: bill.accountId || null,
      });
    }
  };

  if (bills.length === 0) {
    return (
      <div>
        <PageHeader title="Bills" subtitle="What's due, and when." />
        <Empty
          icon={Receipt}
          title="No bills yet"
          message="Track recurring bills like rent, utilities, and subscriptions. Mark each one paid for the month and we'll log a transaction automatically."
          action={
            <button className="btn btn-primary" onClick={openNew}>
              <Plus size={16} /> Add a bill
            </button>
          }
        />
        <BillForm
          open={open}
          initial={editing}
          accounts={accounts}
          onClose={() => setOpen(false)}
          onSave={handleSave}
          onDelete={deleteBill}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Bills"
        subtitle={`${upcoming.filter((u) => !u.paid).length} unpaid in next 30 days`}
        action={
          <button className="btn btn-primary" onClick={openNew}>
            <Plus size={16} /> Add
          </button>
        }
      />

      <section style={styles.totalCard}>
        <div style={styles.totalLabel}>Due in 30 days</div>
        <Money value={totalDue} size={32} />
      </section>

      <h3 style={styles.sectionTitle}>Upcoming</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {upcoming.length === 0 ? (
          <Empty title="Nothing due in the next 30 days" />
        ) : (
          upcoming.map(({ bill, due, monthKey: mKey, paid }) => {
            const Icon = categoryIcon(bill.category);
            const color = categoryColor(bill.category);
            const dueIso = toISO(due);
            return (
              <button
                key={bill.id + mKey}
                className="tap"
                onClick={() => openEdit(bill)}
                style={{ ...styles.row, opacity: paid ? 0.6 : 1 }}
              >
                <button
                  className="tap"
                  aria-label={paid ? 'Mark unpaid' : 'Mark paid'}
                  onClick={(e) => handleTogglePaid(e, bill, due, mKey, paid)}
                  style={{
                    ...styles.checkbox,
                    background: paid ? 'var(--positive)' : 'transparent',
                    borderColor: paid ? 'var(--positive)' : 'var(--border)',
                    color: paid ? 'var(--surface)' : 'var(--ink-subtle)',
                  }}
                >
                  {paid ? <Check size={14} strokeWidth={3} /> : <Circle size={14} strokeWidth={1.5} />}
                </button>

                <div style={{ ...styles.iconBox, background: `${color}22`, color }}>
                  <Icon size={16} strokeWidth={1.75} />
                </div>

                <div style={styles.center}>
                  <div style={{
                    ...styles.name,
                    textDecoration: paid ? 'line-through' : 'none',
                  }}>
                    {bill.name}
                  </div>
                  <div style={styles.meta}>
                    {getCategory(bill.category).label} · {relativeDay(dueIso)}
                  </div>
                </div>

                <Money value={bill.amount} size={15} weight={500} />
              </button>
            );
          })
        )}
      </div>

      <h3 style={styles.sectionTitle}>All bills</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {bills.map((bill) => {
          const Icon = categoryIcon(bill.category);
          const color = categoryColor(bill.category);
          return (
            <button
              key={bill.id}
              className="tap"
              onClick={() => openEdit(bill)}
              style={styles.allRow}
            >
              <div style={{ ...styles.iconBox, background: `${color}22`, color }}>
                <Icon size={16} strokeWidth={1.75} />
              </div>
              <div style={styles.center}>
                <div style={styles.name}>{bill.name}</div>
                <div style={styles.meta}>
                  Day {bill.dueDay} · {getCategory(bill.category).label}
                </div>
              </div>
              <Money value={bill.amount} size={15} weight={500} />
            </button>
          );
        })}
      </div>

      <Fab onClick={openNew} label="Add bill" />

      <BillForm
        open={open}
        initial={editing}
        accounts={accounts}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        onDelete={deleteBill}
      />
    </div>
  );
}

const styles = {
  totalCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-lg)',
    padding: 20,
    textAlign: 'center',
    boxShadow: 'var(--shadow-soft)',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 12,
    color: 'var(--ink-muted)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 16,
    fontWeight: 500,
    color: 'var(--ink-muted)',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    margin: '24px 0 8px',
    paddingInline: 4,
  },
  row: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 14px',
    background: 'var(--surface)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-md)',
    minHeight: 60,
    textAlign: 'left',
  },
  allRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    background: 'var(--surface-warm)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-md)',
    minHeight: 52,
    textAlign: 'left',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 999,
    border: '1.5px solid',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    cursor: 'pointer',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-pill)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  center: { flex: 1, minWidth: 0 },
  name: { fontSize: 15, fontWeight: 500, color: 'var(--ink)' },
  meta: { fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 },
};
