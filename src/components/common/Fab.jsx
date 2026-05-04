import { Plus } from 'lucide-react';

export default function Fab({ onClick, label = 'Add', icon: Icon = Plus }) {
  return (
    <button
      className="tap fab"
      onClick={onClick}
      aria-label={label}
      style={styles.fab}
      title={label}
    >
      <Icon size={22} strokeWidth={2} />
    </button>
  );
}

const styles = {
  fab: {
    width: 56,
    height: 56,
    borderRadius: 'var(--radius-pill)',
    background: 'var(--ink)',
    color: 'var(--surface)',
    boxShadow: 'var(--shadow-lift)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
