import PageHeader from '../common/PageHeader';
import ImportExport from './ImportExport';

export default function Settings() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Tune Ledger to your taste." />

      <div style={styles.list}>
        <ImportExport />

        <section style={styles.about}>
          <h3 style={styles.h3}>About</h3>
          <p style={styles.p}>
            Ledger is a calm, private finance journal. Your data stays on this device — no
            accounts, no syncing, no tracking.
          </p>
          <p style={styles.meta}>v0.1.0 · Phase 1 (shell)</p>
        </section>
      </div>
    </div>
  );
}

const styles = {
  list: { display: 'flex', flexDirection: 'column', gap: 16 },
  about: {
    background: 'var(--surface-warm)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-lg)',
    padding: 20,
  },
  h3: {
    fontFamily: 'var(--font-display)',
    fontSize: 20,
    fontWeight: 500,
    marginBottom: 6,
  },
  p: { color: 'var(--ink-muted)', fontSize: 14, margin: 0, marginBottom: 8 },
  meta: { color: 'var(--ink-subtle)', fontSize: 12, margin: 0 },
};
