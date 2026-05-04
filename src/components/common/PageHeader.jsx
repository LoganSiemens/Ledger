export default function PageHeader({ title, subtitle, action }) {
  return (
    <header style={styles.wrap}>
      <div>
        <h1 style={styles.title}>{title}</h1>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(28px, 6vw, 36px)',
    fontWeight: 500,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    color: 'var(--ink-muted)',
    fontSize: 15,
    margin: 0,
    marginTop: 4,
  },
};
