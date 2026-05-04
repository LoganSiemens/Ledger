import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import { todayISO } from '../../utils/dates';

const empty = {
  name: '',
  targetAmount: '',
  currentAmount: '',
  targetDate: '',
  accountId: '',
};

export default function GoalForm({ open, initial, accounts, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              name: initial.name || '',
              targetAmount: String(initial.targetAmount ?? ''),
              currentAmount: String(initial.currentAmount ?? ''),
              targetDate: initial.targetDate || '',
              accountId: initial.accountId || '',
            }
          : { ...empty, currentAmount: '0' },
      );
    }
  }, [open, initial]);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = () => {
    if (!form.name.trim() || !form.targetAmount) return;
    onSave({
      name: form.name.trim(),
      targetAmount: parseFloat(form.targetAmount),
      currentAmount: parseFloat(form.currentAmount || '0'),
      targetDate: form.targetDate || null,
      accountId: form.accountId || null,
      createdAt: initial?.createdAt || todayISO(),
    });
    onClose();
  };

  const handleDelete = () => {
    if (!initial) return;
    if (window.confirm(`Delete goal "${initial.name}"?`)) {
      onDelete(initial.id);
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      title={initial ? 'Edit goal' : 'New goal'}
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
        <label className="label" htmlFor="goal-name">Name</label>
        <input
          id="goal-name"
          className="input"
          placeholder="Emergency fund, Trip to Japan…"
          value={form.name}
          onChange={update('name')}
          autoFocus
        />
      </div>
      <div className="field">
        <label className="label" htmlFor="goal-target">Target amount</label>
        <input
          id="goal-target"
          className="input tnum"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="5000.00"
          value={form.targetAmount}
          onChange={update('targetAmount')}
        />
      </div>
      <div className="field">
        <label className="label" htmlFor="goal-current">Current amount</label>
        <input
          id="goal-current"
          className="input tnum"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0.00"
          value={form.currentAmount}
          onChange={update('currentAmount')}
        />
      </div>
      <div className="field">
        <label className="label" htmlFor="goal-date">Target date (optional)</label>
        <input
          id="goal-date"
          className="input"
          type="date"
          value={form.targetDate}
          onChange={update('targetDate')}
        />
      </div>
      {accounts && accounts.length > 0 && (
        <div className="field">
          <label className="label" htmlFor="goal-account">Linked account (optional)</label>
          <select id="goal-account" className="select" value={form.accountId} onChange={update('accountId')}>
            <option value="">— None —</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      )}
    </Modal>
  );
}
