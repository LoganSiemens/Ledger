import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import { ACCOUNT_TYPES } from '../../utils/categories';

const empty = { name: '', type: 'checking', balance: '' };

export default function AccountForm({ open, initial, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              name: initial.name || '',
              type: initial.type || 'checking',
              balance: String(initial.balance ?? ''),
            }
          : empty,
      );
    }
  }, [open, initial]);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({
      name: form.name.trim(),
      type: form.type,
      balance: parseFloat(form.balance || '0'),
    });
    onClose();
  };

  const handleDelete = () => {
    if (!initial) return;
    if (window.confirm(`Delete "${initial.name}"? Transactions will keep referencing this account by id.`)) {
      onDelete(initial.id);
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      title={initial ? 'Edit account' : 'New account'}
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
        <label className="label" htmlFor="acc-name">Name</label>
        <input
          id="acc-name"
          className="input"
          placeholder="Everyday Checking"
          value={form.name}
          onChange={update('name')}
          autoFocus
        />
      </div>
      <div className="field">
        <label className="label" htmlFor="acc-type">Type</label>
        <select id="acc-type" className="select" value={form.type} onChange={update('type')}>
          {ACCOUNT_TYPES.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="label" htmlFor="acc-balance">
          Balance {['credit', 'loan'].includes(form.type) && '(amount owed)'}
        </label>
        <input
          id="acc-balance"
          className="input tnum"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0.00"
          value={form.balance}
          onChange={update('balance')}
        />
      </div>
    </Modal>
  );
}
