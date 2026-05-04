import { readStorage } from '../hooks/useStorage';

const API_KEY_STORAGE = 'apiKey';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const apiKey = readStorage(API_KEY_STORAGE);
  if (!apiKey) throw new ApiError('No API key set', 401);

  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) {
    throw new ApiError(payload?.error || `HTTP ${res.status}`, res.status);
  }
  return payload || {};
}

export const api = {
  createLinkToken: () => request('/link-token', { method: 'POST' }),
  exchangeToken: (publicToken, metadata) =>
    request('/exchange-token', {
      method: 'POST',
      body: { public_token: publicToken, metadata },
    }),
  listItems: () => request('/items'),
  removeItem: (itemId) =>
    request(`/items?item_id=${encodeURIComponent(itemId)}`, { method: 'DELETE' }),
  sync: () => request('/sync', { method: 'POST' }),
  fullResync: () => request('/sync?full=1', { method: 'POST' }),
};

export { ApiError, API_KEY_STORAGE };
