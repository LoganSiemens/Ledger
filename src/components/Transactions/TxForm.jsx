import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import { CATEGORIES } from '../../utils/categories';
import { todayISO } from '../../utils/dates';

const empty = {
  date: todayISO(),
  amount: '',
  description: '',
  category: 'Food',
  accountId: '',
};

export default function TxForm({ open, initial, accounts, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              date: initial.date,
              amount: String(Math.abs(initial.amount)),
              description: initial.description || '',
              category: initial.category || 'Other',
              accountId: initial.accountId || (accounts?.[0]?.id ?? ''),
            }
          : { ...empty, accountId: accounts?.[0]?.id ?? '' },
      );
    }
  }, [open, initial, accounts]);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = () => {
    if (!form.amount) return;
    onSave({
      date: form.date,
      amount: parseFloat(form.amount),
      description: form.description.trim(),
      category: form.category,
      accountId: form.accountId || null,
    });
    onClose();
  };

  const handleDelete = () => {
    if (!initial) return;
    if (window.confirm('Delete this transaction?')) {
      onDelete(initial.id);
      onClose();
    }
  };

  const isIncome = form.category === 'Income';

  return (
    <Modal
      open={open}
      title={initial ? 'Edit transaction' : 'New transaction'}
      onClose={onClose}
      footer={
        <>
          {initial && (
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              style={{ marginRight: 'auto' }}
            >
              Delete
            </button>
          )}
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </>
      }
    >
      <div className="field">
        <label className="label" htmlFor="tx-amount">
          Amount {isIncome ? '(income)' : '(expense)'}
        </label>
        <input
          id="tx-amount"
          className="input tnum"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0.00"
          value={form.amount}
          onChange={update('amount')}
          autoFocus
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="tx-desc">Description</label>
        <input
          id="tx-desc"
          className="input"
          placeholder="What was it?"
          value={form.description}
          onChange={update('description')}
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="tx-cat">Category</label>
        <select id="tx-cat" className="select" value={form.category} onChange={update('category')}>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      {accounts && accounts.length > 0 && (
        <div className="field">
          <label className="label" htmlFor="tx-account">Account</label>
          <select id="tx-account" className="select" value={form.accountId} onChange={update('accountId')}>
            <option value="">— None —</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="field">
        <label className="label" htmlFor="tx-date">Date</label>
        <input
          id="tx-date"
          className="input"
          type="date"
          value={form.date}
          onChange={update('date')}
        />
      </div>
    </Modal>
  );
}
