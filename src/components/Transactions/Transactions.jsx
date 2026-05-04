import { useMemo, useState } from 'react';
import { Plus, ListTree } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import Empty from '../common/Empty';
import TxRow from '../common/TxRow';
import Fab from '../common/Fab';
import TxForm from './TxForm';
import { useAccounts, useTransactions } from '../../hooks/useFinanceData';
import { transactionsByDate } from '../../utils/calculations';
import { loadSampleData } from '../../utils/sampleData';

export default function Transactions() {
  const { accounts } = useAccounts();
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const sorted = useMemo(() => transactionsByDate(transactions), [transactions]);
  const accountById = useMemo(
    () => Object.fromEntries(accounts.map((a) => [a.id, a])),
    [accounts],
  );

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (t) => {
    setEditing(t);
    setOpen(true);
  };
  const handleSave = (data) => {
    if (editing) updateTransaction(editing.id, data);
    else addTransaction(data);
  };

  if (sorted.length === 0) {
    return (
      <div>
        <PageHeader title="Activity" subtitle="Every coin in and out." />
        <Empty
          icon={ListTree}
          title="No transactions yet"
          message="Track what comes in and goes out. We'll roll it into your dashboard, calendar, and trends."
          action={
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={openNew}>
                <Plus size={16} /> Add transaction
              </button>
              <button className="btn" onClick={loadSampleData}>
                Try with sample data
              </button>
            </div>
          }
        />
        <TxForm
          open={open}
          initial={editing}
          accounts={accounts}
          onClose={() => setOpen(false)}
          onSave={handleSave}
          onDelete={deleteTransaction}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Activity"
        subtitle={`${transactions.length} transaction${transactions.length === 1 ? '' : 's'}`}
        action={
          <button className="btn btn-primary" onClick={openNew}>
            <Plus size={16} /> Add
          </button>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map((t) => (
          <TxRow
            key={t.id}
            tx={t}
            accountName={accountById[t.accountId]?.name}
            onClick={() => openEdit(t)}
          />
        ))}
      </div>

      <Fab onClick={openNew} label="Add transaction" />

      <TxForm
        open={open}
        initial={editing}
        accounts={accounts}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        onDelete={deleteTransaction}
      />
    </div>
  );
}
