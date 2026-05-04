export default function Empty({ icon: Icon, title, message, action }) {
  return (
    <div style={styles.wrap}>
      {Icon && (
        <div style={styles.icon}>
          <Icon size={28} strokeWidth={1.5} color="var(--ink-subtle)" />
        </div>
      )}
      <h3 style={styles.title}>{title}</h3>
      {message && <p style={styles.msg}>{message}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

const styles = {
  wrap: {
    background: 'var(--surface)',
    border: '1px dashed var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '40px 24px',
    textAlign: 'center',
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 999,
    background: 'var(--surface-warm)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 20,
    fontWeight: 500,
    marginBottom: 4,
  },
  msg: {
    color: 'var(--ink-muted)',
    fontSize: 14,
    margin: 0,
    maxWidth: 360,
    marginInline: 'auto',
  },
};
