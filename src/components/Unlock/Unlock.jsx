import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useApiKey } from '../../hooks/useApiKey';

export default function Unlock() {
  const [, setApiKey] = useApiKey();
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Paste your access key.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/items', {
        headers: { authorization: `Bearer ${trimmed}` },
      });
      if (res.status === 401) {
        setError('That key is not valid for this app.');
        setBusy(false);
        return;
      }
      if (!res.ok) {
        setError(`Server returned ${res.status}. Try again in a moment.`);
        setBusy(false);
        return;
      }
      setApiKey(trimmed);
    } catch {
      setError('Could not reach the server.');
      setBusy(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <form onSubmit={submit} style={styles.card}>
        <div style={styles.iconWrap}>
          <Lock size={22} strokeWidth={1.5} color="var(--accent)" />
        </div>
        <h1 style={styles.title}>Unlock Ledger</h1>
        <p style={styles.sub}>
          Paste the access key you set in Netlify (<span style={styles.code}>LEDGER_API_SECRET</span>).
          You only have to do this once on each device.
        </p>

        <input
          type="password"
          autoComplete="current-password"
          className="input"
          placeholder="Access key"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          style={{ marginTop: 16 }}
        />

        {error && <div style={styles.err}>{error}</div>}

        <button className="btn btn-primary" type="submit" style={styles.btn} disabled={busy}>
          {busy ? 'Checking…' : 'Unlock'}
        </button>

        <p style={styles.foot}>
          Lost it? Generate a new one and update <span style={styles.code}>LEDGER_API_SECRET</span> in
          Netlify, then redeploy.
        </p>
      </form>
    </div>
  );
}

const styles = {
  wrap: {
    flex: 1,
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    background: 'var(--bg)',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-lg)',
    padding: 28,
    width: '100%',
    maxWidth: 420,
    boxShadow: 'var(--shadow-soft)',
    textAlign: 'center',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 999,
    background: 'var(--surface-warm)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 26,
    fontWeight: 500,
    letterSpacing: '-0.01em',
    marginBottom: 6,
  },
  sub: { color: 'var(--ink-muted)', fontSize: 14, margin: 0 },
  code: {
    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
    fontSize: 13,
    background: 'var(--surface-warm)',
    padding: '1px 6px',
    borderRadius: 4,
  },
  err: {
    marginTop: 8,
    fontSize: 13,
    color: 'var(--negative)',
    textAlign: 'left',
  },
  btn: { width: '100%', marginTop: 12 },
  foot: {
    color: 'var(--ink-subtle)',
    fontSize: 12,
    marginTop: 16,
    marginBottom: 0,
  },
};
