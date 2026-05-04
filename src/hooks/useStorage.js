import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Storage adapter contract — swap to IndexedDB later by implementing the same shape.
 * @typedef {Object} StorageAdapter
 * @property {(key: string) => any} get
 * @property {(key: string, value: any) => void} set
 * @property {(key: string) => void} remove
 * @property {() => string[]} keys
 * @property {() => void} clear
 * @property {(listener: (key: string) => void) => () => void} subscribe
 */

const PREFIX = 'ledger:';

const listeners = new Set();
const notify = (key) => {
  for (const fn of listeners) fn(key);
};

/** @type {StorageAdapter} */
export const localAdapter = {
  get(key) {
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      if (raw == null) return undefined;
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
      notify(key);
    } catch (err) {
      console.error('[storage] set failed', key, err);
    }
  },
  remove(key) {
    window.localStorage.removeItem(PREFIX + key);
    notify(key);
  },
  keys() {
    const out = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(PREFIX)) out.push(k.slice(PREFIX.length));
    }
    return out;
  },
  clear() {
    for (const k of localAdapter.keys()) localAdapter.remove(k);
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith(PREFIX)) notify(e.key.slice(PREFIX.length));
  });
}

/**
 * Reactive hook for a single storage key.
 * Returns [value, setValue, remove].
 */
export function useStorage(key, initialValue) {
  const initialRef = useRef(initialValue);

  const read = useCallback(() => {
    const v = localAdapter.get(key);
    return v === undefined ? initialRef.current : v;
  }, [key]);

  const [value, setLocal] = useState(read);

  useEffect(() => {
    setLocal(read());
    return localAdapter.subscribe((changed) => {
      if (changed === key) setLocal(read());
    });
  }, [key, read]);

  useEffect(() => {
    if (localAdapter.get(key) === undefined && initialRef.current !== undefined) {
      localAdapter.set(key, initialRef.current);
    }
  }, [key]);

  const setValue = useCallback(
    (next) => {
      const current = localAdapter.get(key);
      const base = current === undefined ? initialRef.current : current;
      const resolved = typeof next === 'function' ? next(base) : next;
      localAdapter.set(key, resolved);
    },
    [key],
  );

  const remove = useCallback(() => localAdapter.remove(key), [key]);

  return [value, setValue, remove];
}

/** Read-once helper without subscription, useful for one-shot reads. */
export function readStorage(key, fallback) {
  const v = localAdapter.get(key);
  return v === undefined ? fallback : v;
}

/** Imperative writer outside of React. */
export function writeStorage(key, value) {
  localAdapter.set(key, value);
}
