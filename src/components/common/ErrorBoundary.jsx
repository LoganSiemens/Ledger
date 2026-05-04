import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[Ledger] crash:', error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div style={styles.wrap}>
          <div style={styles.card}>
            <div style={styles.glyph}>◐</div>
            <h2 style={styles.title}>Something snagged.</h2>
            <p style={styles.msg}>
              A part of Ledger didn&apos;t render. Your data is safe — try reloading.
            </p>
            <pre style={styles.pre}>{String(this.state.error?.message || this.state.error)}</pre>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button className="tap" style={styles.btn} onClick={this.reset}>
                Try again
              </button>
              <button
                className="tap"
                style={styles.btnPrimary}
                onClick={() => window.location.reload()}
              >
                Reload app
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const styles = {
  wrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-lg)',
    padding: 32,
    maxWidth: 440,
    textAlign: 'center',
    boxShadow: 'var(--shadow-soft)',
  },
  glyph: {
    fontFamily: 'var(--font-display)',
    fontSize: 40,
    color: 'var(--accent)',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    fontWeight: 500,
    marginBottom: 6,
  },
  msg: { color: 'var(--ink-muted)', fontSize: 14, marginBottom: 16 },
  pre: {
    fontSize: 12,
    background: 'var(--surface-warm)',
    border: '1px solid var(--border-soft)',
    padding: 10,
    borderRadius: 'var(--radius-sm)',
    color: 'var(--ink-muted)',
    overflow: 'auto',
    textAlign: 'left',
    margin: '0 0 16px',
  },
  btn: {
    padding: '10px 14px',
    background: 'var(--surface-warm)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    fontSize: 14,
    fontWeight: 500,
    minHeight: 44,
  },
  btnPrimary: {
    padding: '10px 14px',
    background: 'var(--ink)',
    border: '1px solid var(--ink)',
    color: 'var(--surface)',
    borderRadius: 'var(--radius-md)',
    fontSize: 14,
    fontWeight: 500,
    minHeight: 44,
  },
};
