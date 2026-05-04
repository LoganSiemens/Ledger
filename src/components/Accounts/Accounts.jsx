import { useMemo, useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import Empty from '../common/Empty';
import Money from '../common/Money';
import Fab from '../common/Fab';
import AccountForm from './AccountForm';
import { useAccounts } from '../../hooks/useFinanceData';
import { groupAccounts, netWorth } from '../../utils/calculations';
import { getAccountType } from '../../utils/categories';
import { loadSampleData } from '../../utils/sampleData';

export default function Accounts() {
  const { accounts, addAccount, updateAccount, deleteAccount } = useAccounts();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const groups = useMemo(() => groupAccounts(accounts), [accounts]);
  const total = useMemo(() => netWorth(accounts), [accounts]);

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (a) => {
    setEditing(a);
    setOpen(true);
  };
  const handleSave = (data) => {
    if (editing) updateAccount(editing.id, data);
    else addAccount(data);
  };

  if (accounts.length === 0) {
    return (
      <div>
        <PageHeader title="Accounts" subtitle="Where your money sits." />
        <Empty
          icon={Wallet}
          title="No accounts yet"
          message="Add your checking, savings, investments, and any debts. We'll group them and total it up."
          action={
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={openNew}>
                <Plus size={16} /> Add an account
              </button>
              <button className="btn" onClick={loadSampleData}>
                Try with sample data
              </button>
            </div>
          }
        />
        <AccountForm
          open={open}
          initial={editing}
          onClose={() => setOpen(false)}
          onSave={handleSave}
          onDelete={deleteAccount}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Accounts"
        subtitle="Where your money sits."
        action={
          <button className="btn btn-primary" onClick={openNew}>
            <Plus size={16} /> Add
          </button>
        }
      />

      <section style={styles.totalCard}>
        <div style={styles.totalLabel}>Net worth</div>
        <Money value={total} signed size={36} />
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 20 }}>
        {groups.map((g) =>
          g.accounts.length === 0 ? null : (
            <section key={g.id}>
              <header style={styles.groupHead}>
                <h3 style={styles.groupTitle}>{g.label}</h3>
                <Money
                  value={g.subtotal * g.sign}
                  signed={g.sign === -1}
                  muted
                  size={15}
                  weight={500}
                />
              </header>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {g.accounts.map((a) => (
                  <button
                    key={a.id}
                    className="tap"
                    onClick={() => openEdit(a)}
                    style={styles.row}
                  >
                    <div style={styles.rowMain}>
                      <div style={styles.name}>{a.name}</div>
                      <div style={styles.type}>{getAccountType(a.type).label}</div>
                    </div>
                    <Money
                      value={a.balance * (g.sign === -1 ? -1 : 1)}
                      size={18}
                      signed={g.sign === -1}
                    />
                  </button>
                ))}
              </div>
            </section>
          ),
        )}
      </div>

      <Fab onClick={openNew} label="Add account" />

      <AccountForm
        open={open}
        initial={editing}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        onDelete={deleteAccount}
      />
    </div>
  );
}

const styles = {
  totalCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-lg)',
    padding: 24,
    boxShadow: 'var(--shadow-soft)',
    textAlign: 'center',
  },
  totalLabel: {
    fontSize: 13,
    color: 'var(--ink-muted)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  groupHead: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingInline: 4,
  },
  groupTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 16,
    fontWeight: 500,
    color: 'var(--ink-muted)',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '14px 16px',
    background: 'var(--surface)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-md)',
    minHeight: 64,
    textAlign: 'left',
    width: '100%',
  },
  rowMain: { minWidth: 0 },
  name: { fontSize: 15, fontWeight: 500, color: 'var(--ink)' },
  type: { fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 },
};
