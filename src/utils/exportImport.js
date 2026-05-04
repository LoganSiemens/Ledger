import { localAdapter } from '../hooks/useStorage';

const EXPORT_VERSION = 1;

export function exportAll() {
  const data = {};
  for (const key of localAdapter.keys()) {
    data[key] = localAdapter.get(key);
  }
  return {
    app: 'ledger',
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function downloadExport(filename) {
  const payload = exportAll();
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = filename || `ledger-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * @param {File} file
 * @param {{ merge?: boolean }} [opts]
 */
export async function importFromFile(file, opts = {}) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!parsed || parsed.app !== 'ledger' || !parsed.data) {
    throw new Error('Not a Ledger backup file.');
  }
  if (!opts.merge) {
    localAdapter.clear();
  }
  for (const [key, value] of Object.entries(parsed.data)) {
    localAdapter.set(key, value);
  }
  return {
    keys: Object.keys(parsed.data).length,
    exportedAt: parsed.exportedAt,
  };
}

export function clearAll() {
  localAdapter.clear();
}
