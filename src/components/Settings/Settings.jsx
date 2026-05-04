import PageHeader from '../common/PageHeader';
import ImportExport from './ImportExport';
import LinkedBanks from '../Plaid/LinkedBanks';
import { useApiKey } from '../../hooks/useApiKey';

export default function Settings() {
  const [, setApiKey] = useApiKey();

  const lock = () => {
    if (window.confirm('Sign out of this device? You will need to re-enter your access key.')) {
      setApiKey('');
    }
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Tune Ledger to your taste." />

      <div style={styles.list}>
        <LinkedBanks />
        <ImportExport />

        <section style={styles.about}>
          <h3 style={styles.h3}>About</h3>
          <p style={styles.p}>
            Manual entries stay on this device. When you link a bank, an access token lives
            on Supabase so the server can fetch fresh transactions; the transactions
            themselves are pulled to this device on each sync.
          </p>
          <button className="btn" onClick={lock} style={{ marginTop: 8 }}>
            Sign out of this device
          </button>
          <p style={styles.meta}>v0.2.5 · Plaid + Supabase</p>
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
  meta: { color: 'var(--ink-subtle)', fontSize: 12, margin: 0, marginTop: 12 },
};
