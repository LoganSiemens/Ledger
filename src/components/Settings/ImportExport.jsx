import { useRef, useState } from 'react';
import { Download, Upload, AlertTriangle, Eraser } from 'lucide-react';
import {
  downloadExport,
  importFromFile,
  clearAll,
  clearManualEntries,
} from '../../utils/exportImport';

export default function ImportExport() {
  const fileRef = useRef(null);
  const [status, setStatus] = useState(null);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [confirmingManual, setConfirmingManual] = useState(false);

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const result = await importFromFile(file);
      setStatus({
        kind: 'ok',
        msg: `Imported ${result.keys} keys${
          result.exportedAt ? ` from ${new Date(result.exportedAt).toLocaleDateString()}` : ''
        }.`,
      });
    } catch (err) {
      setStatus({ kind: 'err', msg: err.message || 'Import failed.' });
    }
  };

  const handleClear = () => {
    clearAll();
    setConfirmingClear(false);
    setStatus({ kind: 'ok', msg: 'All data cleared.' });
  };

  const handleClearManual = () => {
    const counts = clearManualEntries();
    setConfirmingManual(false);
    setStatus({
      kind: 'ok',
      msg: `Manual entries cleared. Kept ${counts.accounts} linked account${counts.accounts === 1 ? '' : 's'} and ${counts.transactions} synced transaction${counts.transactions === 1 ? '' : 's'}.`,
    });
  };

  return (
    <section style={styles.section}>
      <header style={styles.header}>
        <h3 style={styles.h3}>Backup &amp; restore</h3>
        <p style={styles.sub}>
          Your data lives only in this browser. Export regularly so you don&apos;t lose
          anything if you clear Safari data or switch devices.
        </p>
      </header>

      <div style={styles.row}>
        <button className="tap" style={styles.btnPrimary} onClick={() => downloadExport()}>
          <Download size={16} />
          <span>Export JSON</span>
        </button>

        <button className="tap" style={styles.btn} onClick={() => fileRef.current?.click()}>
          <Upload size={16} />
          <span>Import JSON</span>
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </div>

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

      <div style={styles.danger}>
        <div style={styles.dangerRow}>
          <Eraser size={16} color="var(--ink-muted)" />
          <h4 style={styles.h4}>Clear manual entries</h4>
        </div>
        <p style={styles.sub}>
          Removes only manually-entered accounts and transactions (and any sample data).
          Plaid-linked accounts and synced transactions stay.
        </p>
        {!confirmingManual ? (
          <button
            className="tap"
            style={styles.btn}
            onClick={() => setConfirmingManual(true)}
          >
            Clear manual entries
          </button>
        ) : (
          <div style={styles.row}>
            <button className="tap" style={styles.btnDangerSolid} onClick={handleClearManual}>
              Yes, clear them
            </button>
            <button
              className="tap"
              style={styles.btn}
              onClick={() => setConfirmingManual(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div style={{ ...styles.danger, marginTop: 16 }}>
        <div style={styles.dangerRow}>
          <AlertTriangle size={16} color="var(--negative)" />
          <h4 style={styles.h4}>Danger zone</h4>
        </div>
        <p style={styles.sub}>Removes everything on this device — manual + synced. Linked banks stay connected on the server.</p>
        {!confirmingClear ? (
          <button
            className="tap"
            style={styles.btnDanger}
            onClick={() => setConfirmingClear(true)}
          >
            Clear all data
          </button>
        ) : (
          <div style={styles.row}>
            <button className="tap" style={styles.btnDangerSolid} onClick={handleClear}>
              Yes, clear everything
            </button>
            <button
              className="tap"
              style={styles.btn}
              onClick={() => setConfirmingClear(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
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
  h4: { fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500 },
  sub: { color: 'var(--ink-muted)', fontSize: 14, margin: 0 },
  row: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    background: 'var(--surface-warm)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--ink)',
    fontSize: 14,
    fontWeight: 500,
    minHeight: 44,
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    background: 'var(--ink)',
    border: '1px solid var(--ink)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--surface)',
    fontSize: 14,
    fontWeight: 500,
    minHeight: 44,
  },
  btnDanger: {
    padding: '10px 14px',
    background: 'transparent',
    border: '1px solid var(--negative)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--negative)',
    fontSize: 14,
    fontWeight: 500,
    minHeight: 44,
  },
  btnDangerSolid: {
    padding: '10px 14px',
    background: 'var(--negative)',
    border: '1px solid var(--negative)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--surface)',
    fontSize: 14,
    fontWeight: 500,
    minHeight: 44,
  },
  status: { marginTop: 12, fontSize: 14 },
  danger: {
    marginTop: 24,
    paddingTop: 16,
    borderTop: '1px dashed var(--border)',
  },
  dangerRow: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 },
};
