import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, title, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      style={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-sheet"
        style={styles.sheet}
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="modal-title"
      >
        <header style={styles.header}>
          <h2 id="modal-title" style={styles.title}>
            {title}
          </h2>
          <button
            className="tap"
            aria-label="Close"
            style={styles.close}
            onClick={onClose}
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </header>
        <div style={styles.body}>{children}</div>
        {footer && <footer style={styles.footer}>{footer}</footer>}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(60, 50, 35, 0.32)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: 'env(safe-area-inset-top, 0px) 0 0',
  },
  sheet: {
    background: 'var(--surface)',
    width: '100%',
    maxWidth: 540,
    maxHeight: '92dvh',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lift)',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: 'var(--safe-bottom)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px 8px',
    borderBottom: '1px solid var(--border-soft)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    fontWeight: 500,
    letterSpacing: '-0.01em',
  },
  close: {
    width: 36,
    height: 36,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-pill)',
    color: 'var(--ink-muted)',
    background: 'var(--surface-warm)',
  },
  body: {
    padding: 20,
    overflow: 'auto',
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTop: '1px solid var(--border-soft)',
    display: 'flex',
    gap: 8,
    justifyContent: 'flex-end',
  },
};
