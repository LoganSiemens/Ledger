import { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Plus, Loader2 } from 'lucide-react';
import { api } from '../../utils/api';
import { applySyncResponse } from '../../utils/syncMerge';

export default function LinkButton({ onLinked, onError }) {
  const [linkToken, setLinkToken] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [linking, setLinking] = useState(false);

  const fetchLinkToken = async () => {
    setTokenLoading(true);
    try {
      const { link_token } = await api.createLinkToken();
      setLinkToken(link_token);
    } catch (err) {
      onError?.(err.message || 'Could not create Plaid link token.');
    } finally {
      setTokenLoading(false);
    }
  };

  useEffect(() => {
    fetchLinkToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { open, ready, error: plaidError } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken, metadata) => {
      setLinking(true);
      try {
        await api.exchangeToken(publicToken, metadata);
        const sync = await api.sync();
        const counts = applySyncResponse(sync);
        onLinked?.(counts, metadata?.institution?.name);
        // Refresh the link token for the next link.
        fetchLinkToken();
      } catch (err) {
        onError?.(err.message || 'Linking failed during sync.');
      } finally {
        setLinking(false);
      }
    },
    onExit: (err) => {
      if (err) onError?.(err.display_message || err.error_message || 'Plaid Link exited.');
    },
  });

  useEffect(() => {
    if (plaidError) onError?.(plaidError.message || String(plaidError));
  }, [plaidError, onError]);

  const disabled = !ready || tokenLoading || linking;

  return (
    <button
      className="btn btn-primary"
      type="button"
      onClick={() => open()}
      disabled={disabled}
      style={{ minWidth: 160 }}
    >
      {linking ? (
        <>
          <Loader2 size={16} className="spin" /> Importing…
        </>
      ) : tokenLoading ? (
        <>
          <Loader2 size={16} className="spin" /> Preparing…
        </>
      ) : (
        <>
          <Plus size={16} /> Link a bank
        </>
      )}
    </button>
  );
}
