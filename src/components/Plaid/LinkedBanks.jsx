import { useEffect, useState } from 'react';
import { Building2, RefreshCw, Trash2, Loader2, AlertTriangle, RotateCw } from 'lucide-react';
import LinkButton from './LinkButton';
import { api } from '../../utils/api';
import { applySyncResponse } from '../../utils/syncMerge';

export default function LinkedBanks() {
  const [items, setItems] = useState(null);
  const [loadErr, setLoadErr] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [resyncing, setResyncing] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [status, setStatus] = useState(null);
  const [lastSyncAt, setLastSyncAt] = useState(null);

  const load = async () => {
    setLoadErr(null);
    try {
      const { items } = await api.listItems();
      setItems(items || []);
    } catch (err) {
      setLoadErr(err.message);
      setItems([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onLinked = async (counts, institutionName) => {
    setStatus({
      kind: 'ok',
      msg: `Linked ${institutionName}. Imported ${counts.accounts} account${counts.accounts === 1 ? '' : 's'} and ${counts.added} transaction${counts.added === 1 ? '' : 's'}.`,
    });
    setLastSyncAt(new Date());
    load();
  };

  const onSync = async () => {
    setSyncing(true);
    setStatus(null);
    try {
      const resp = await api.sync();
      const counts = applySyncResponse(resp);
      const parts = [];
      if (counts.added) parts.push(`${counts.added} new`);
      if (counts.modified) parts.push(`${counts.modified} updated`);
      if (counts.removed) parts.push(`${counts.removed} removed`);
      setStatus({
        kind: 'ok',
        msg: parts.length ? `Synced — ${parts.join(', ')}.` : 'Up to date.',
      });
      setLastSyncAt(new Date());
    } catch (err) {
      setStatus({ kind: 'err', msg: err.message });
    } finally {
      setSyncing(false);
    }
  };

  const onFullResync = async () => {
    if (
      !window.confirm(
        'Re-pull every transaction from Plaid with the latest categorization rules. This replaces all synced transactions on this device. (Manual entries are untouched.) Continue?',
      )
    )
      return;
    setResyncing(true);
    setStatus(null);
    try {
      const resp = await api.fullResync();
      const counts = applySyncResponse(resp);
      setStatus({
        kind: 'ok',
        msg: `Re-pulled ${counts.added} transactions across ${counts.accounts} account${counts.accounts === 1 ? '' : 's'}.`,
      });
      setLastSyncAt(new Date());
    } catch (err) {
      setStatus({ kind: 'err', msg: err.message });
    } finally {
      setResyncing(false);
    }
  };

  const onRemove = async (item) => {
    if (
      !window.confirm(
        `Disconnect ${item.institution_name}? Imported transactions stay; new ones won't be pulled.`,
      )
    )
      return;
    setRemoving(item.item_id);
    try {
      await api.removeItem(item.item_id);
      setStatus({ kind: 'ok', msg: `Disconnected ${item.institution_name}.` });
      load();
    } catch (err) {
      setStatus({ kind: 'err', msg: err.message });
    } finally {
      setRemoving(null);
    }
  };

  return (
    <section style={styles.section}>
      <header style={styles.header}>
        <h3 style={styles.h3}>Linked banks</h3>
        <p style={styles.sub}>
          Connect via Plaid. Balances and transactions are pulled into Ledger; the access
          token lives on Supabase, not in your browser.
        </p>
      </header>

      {loadErr && (
        <div style={styles.errBanner}>
          <AlertTriangle size={14} /> Couldn&apos;t reach the server: {loadErr}
        </div>
      )}

      {items === null ? (
        <div style={styles.loading}>
          <Loader2 size={16} className="spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <div style={styles.empty}>
          <Building2 size={28} strokeWidth={1.5} color="var(--ink-subtle)" />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500 }}>
            No banks linked yet
          </div>
          <p style={styles.sub}>
            In Sandbox, use <code style={styles.code}>user_good</code> /{' '}
            <code style={styles.code}>pass_good</code> at any institution.
          </p>
        </div>
      ) : (
        <ul style={styles.list}>
          {items.map((it) => (
            <li key={it.item_id} style={styles.row}>
              <div style={styles.rowMain}>
                <Building2 size={18} strokeWidth={1.75} color="var(--accent)" />
                <div>
                  <div style={styles.bankName}>{it.institution_name}</div>
                  <div style={styles.meta}>
                    Linked {new Date(it.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <button
                className="tap"
                aria-label={`Disconnect ${it.institution_name}`}
                onClick={() => onRemove(it)}
                disabled={removing === it.item_id}
                style={styles.removeBtn}
              >
                {removing === it.item_id ? (
                  <Loader2 size={16} className="spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div style={styles.actions}>
        <LinkButton
          onLinked={onLinked}
          onError={(msg) => setStatus({ kind: 'err', msg })}
        />
        {items && items.length > 0 && (
          <>
            <button
              className="btn"
              type="button"
              onClick={onSync}
              disabled={syncing || resyncing}
            >
              {syncing ? (
                <>
                  <Loader2 size={16} className="spin" /> Syncing…
                </>
              ) : (
                <>
                  <RefreshCw size={16} /> Sync now
                </>
              )}
            </button>
            <button
              className="btn"
              type="button"
              onClick={onFullResync}
              disabled={syncing || resyncing}
              title="Re-pull every transaction with the latest categorization"
            >
              {resyncing ? (
                <>
                  <Loader2 size={16} className="spin" /> Re-pulling…
                </>
              ) : (
                <>
                  <RotateCw size={16} /> Re-categorize
                </>
              )}
            </button>
          </>
        )}
      </div>

      {lastSyncAt && (
        <div style={styles.lastSync}>
          Last synced {lastSyncAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </div>
      )}

      {status && (
        <div
          style={{
            ...styles.status,
            color: status.kind === 'err' ? 'var(--negative)' : 'var(--positive)',
          }}
        >
          {status.msg}
        </div>
      )}
    </section>
  );
}

const styles = {
  section: {
    background: 'var(--surface)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-lg)',
    padding: 20,
    boxShadow: 'var(--shadow-soft)',
  },
  header: { marginBottom: 16 },
  h3: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    fontWeight: 500,
    marginBottom: 4,
  },
  sub: { color: 'var(--ink-muted)', fontSize: 14, margin: 0 },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    background: 'var(--surface-warm)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-md)',
    minHeight: 56,
  },
  rowMain: { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 },
  bankName: { fontSize: 15, fontWeight: 500 },
  meta: { color: 'var(--ink-muted)', fontSize: 12 },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 'var(--radius-pill)',
    color: 'var(--ink-muted)',
    background: 'transparent',
    border: '1px solid var(--border)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 8,
  },
  lastSync: {
    fontSize: 12,
    color: 'var(--ink-subtle)',
    marginTop: 8,
  },
  status: { marginTop: 12, fontSize: 14 },
  errBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: 'var(--negative)',
    background: 'rgba(201, 112, 100, 0.08)',
    border: '1px solid rgba(201, 112, 100, 0.2)',
    padding: '8px 10px',
    borderRadius: 'var(--radius-sm)',
    marginBottom: 12,
  },
  loading: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--ink-muted)',
    fontSize: 14,
    padding: '8px 0',
  },
  empty: {
    background: 'var(--surface-warm)',
    border: '1px dashed var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: 20,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  code: {
    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
    fontSize: 12,
    background: 'var(--surface)',
    padding: '1px 5px',
    borderRadius: 4,
  },
};
