import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import { CATEGORIES } from '../../utils/categories';

const empty = {
  name: '',
  amount: '',
  dueDay: '1',
  category: 'Bills',
  accountId: '',
  notes: '',
};

export default function BillForm({ open, initial, accounts, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              name: initial.name || '',
              amount: String(initial.amount ?? ''),
              dueDay: String(initial.dueDay ?? '1'),
              category: initial.category || 'Bills',
              accountId: initial.accountId || '',
              notes: initial.notes || '',
            }
          : { ...empty, accountId: accounts?.[0]?.id ?? '' },
      );
    }
  }, [open, initial, accounts]);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = () => {
    if (!form.name.trim() || !form.amount || !form.dueDay) return;
    onSave({
      name: form.name.trim(),
      amount: parseFloat(form.amount),
      dueDay: parseInt(form.dueDay, 10),
      category: form.category,
      accountId: form.accountId || null,
      notes: form.notes.trim(),
    });
    onClose();
  };

  const handleDelete = () => {
    if (!initial) return;
    if (window.confirm(`Delete bill "${initial.name}"?`)) {
      onDelete(initial.id);
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      title={initial ? 'Edit bill' : 'New bill'}
      onClose={onClose}
      footer={
        <>
          {initial && (
            <button className="btn btn-danger" onClick={handleDelete} style={{ marginRight: 'auto' }}>
              Delete
            </button>
          )}
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </>
      }
    >
      <div className="field">
        <label className="label" htmlFor="bill-name">Name</label>
        <input
          id="bill-name"
          className="input"
          placeholder="Rent, Internet, Phone…"
          value={form.name}
          onChange={update('name')}
          autoFocus
        />
      </div>
      <div className="field">
        <label className="label" htmlFor="bill-amount">Amount</label>
        <input
          id="bill-amount"
          className="input tnum"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0.00"
          value={form.amount}
          onChange={update('amount')}
        />
      </div>
      <div className="field">
        <label className="label" htmlFor="bill-day">Due day of month</label>
        <input
          id="bill-day"
          className="input tnum"
          type="number"
          inputMode="numeric"
          min="1"
          max="31"
          placeholder="1"
          value={form.dueDay}
          onChange={update('dueDay')}
        />
      </div>
      <div className="field">
        <label className="label" htmlFor="bill-cat">Category</label>
        <select id="bill-cat" className="select" value={form.category} onChange={update('category')}>
          {CATEGORIES.filter((c) => c.kind === 'expense').map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>
      {accounts && accounts.length > 0 && (
        <div className="field">
          <label className="label" htmlFor="bill-account">Pay from (optional)</label>
          <select id="bill-account" className="select" value={form.accountId} onChange={update('accountId')}>
            <option value="">— None —</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      )}
      <div className="field">
        <label className="label" htmlFor="bill-notes">Notes (optional)</label>
        <input
          id="bill-notes"
          className="input"
          placeholder="Confirmation #, account #…"
          value={form.notes}
          onChange={update('notes')}
        />
      </div>
    </Modal>
  );
}
