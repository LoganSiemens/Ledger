import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import { CATEGORIES } from '../../utils/categories';

/** Edit a single category's budget. */
export default function BudgetForm({ open, category, current, onClose, onSave, onClear }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (open) setValue(String(current || ''));
  }, [open, current]);

  const cat = CATEGORIES.find((c) => c.id === category);

  const save = () => {
    const v = parseFloat(value);
    onSave(category, isNaN(v) ? 0 : v);
    onClose();
  };

  const clear = () => {
    onClear(category);
    onClose();
  };

  if (!cat) return null;

  return (
    <Modal
      open={open}
      title={`${cat.label} budget`}
      onClose={onClose}
      footer={
        <>
          {current > 0 && (
            <button className="btn btn-danger" onClick={clear} style={{ marginRight: 'auto' }}>
              Remove
            </button>
          )}
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Save</button>
        </>
      }
    >
      <div className="field">
        <label className="label" htmlFor="budget-amount">Monthly budget</label>
        <input
          id="budget-amount"
          className="input tnum"
          type="number"
          inputMode="decimal"
          step="1"
          placeholder="500"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
      </div>
    </Modal>
  );
}
