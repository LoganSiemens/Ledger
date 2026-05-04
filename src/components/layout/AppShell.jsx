import { useEffect, useState } from 'react';
import TopNav from './TopNav';
import BottomNav from './BottomNav';

const MOBILE_QUERY = '(max-width: 768px)';

export default function AppShell({ tab, onChange, children }) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(MOBILE_QUERY).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div style={styles.shell}>
      {!isMobile && <TopNav tab={tab} onChange={onChange} />}
      {isMobile && (
        <div style={styles.mobileBrand}>
          <span style={styles.glyph}>◐</span>
          <span style={styles.brandName}>Ledger</span>
        </div>
      )}

      <main style={styles.main}>
        <div style={styles.inner}>{children}</div>
      </main>

      {isMobile && <BottomNav tab={tab} onChange={onChange} />}
    </div>
  );
}

const styles = {
  shell: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100dvh',
    background: 'var(--bg)',
  },
  mobileBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: 'calc(var(--safe-top) + 12px) 20px 8px',
  },
  glyph: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    color: 'var(--accent)',
    lineHeight: 1,
  },
  brandName: {
    fontFamily: 'var(--font-display)',
    fontSize: 18,
    fontWeight: 500,
  },
  main: { flex: 1, width: '100%' },
  inner: {
    width: '100%',
    maxWidth: 960,
    margin: '0 auto',
    padding: '20px 20px 32px',
  },
};
