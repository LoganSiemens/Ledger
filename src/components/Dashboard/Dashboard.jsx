import { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import Empty from '../common/Empty';
import Money from '../common/Money';
import TxRow from '../common/TxRow';
import { useAccounts, useTransactions } from '../../hooks/useFinanceData';
import {
  netWorth,
  rollingOverRolling,
  recentTransactions,
} from '../../utils/calculations';
import { greeting } from '../../utils/dates';
import { loadSampleData } from '../../utils/sampleData';

export default function Dashboard() {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();

  const total = useMemo(() => netWorth(accounts), [accounts]);
  const mom = useMemo(() => rollingOverRolling(transactions, 30), [transactions]);
  const recent = useMemo(() => recentTransactions(transactions, 6), [transactions]);
  const accountById = useMemo(
    () => Object.fromEntries(accounts.map((a) => [a.id, a])),
    [accounts],
  );

  const isEmpty = accounts.length === 0 && transactions.length === 0;

  if (isEmpty) {
    return (
      <div>
        <PageHeader
          title={`${greeting()}.`}
          subtitle="A quiet read on where your money lives."
        />
        <Empty
          icon={Sparkles}
          title="Welcome to Ledger"
          message="Add an account and a few transactions, or load some example data to see how it feels."
          action={
            <button className="btn btn-primary" onClick={loadSampleData}>
              Load sample data
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={`${greeting()}.`} subtitle="Last 30 days" />

      <section style={styles.hero}>
        <div style={styles.heroLabel}>Net worth</div>
        <Money value={total} signed size={44} weight={500} />
      </section>

      <section style={styles.threeUp}>
        <FlowCard
          label="Income"
          value={mom.current.income}
          delta={mom.incomeDelta}
          tone="positive"
        />
        <FlowCard
          label="Spending"
          value={Math.abs(mom.current.expense)}
          delta={mom.expenseDelta}
          tone="negative"
          invertDelta
        />
        <FlowCard
          label="Cash flow"
          value={mom.current.net}
          delta={mom.netDelta}
          tone={mom.current.net >= 0 ? 'positive' : 'negative'}
          signed
        />
      </section>

      <section style={{ marginTop: 28 }}>
        <header style={styles.sectionHead}>
          <h3 style={styles.sectionTitle}>Recent activity</h3>
        </header>
        {recent.length === 0 ? (
          <Empty title="Nothing this period" message="Add a transaction to see it here." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recent.map((t) => (
              <TxRow key={t.id} tx={t} accountName={accountById[t.accountId]?.name} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FlowCard({ label, value, delta, tone, signed = false, invertDelta = false }) {
  const hasDelta = delta != null && Number.isFinite(delta);
  const arrowUp = invertDelta ? delta < 0 : delta > 0;
  const arrowGood = invertDelta ? delta < 0 : delta > 0;
  const Arrow = arrowUp ? ArrowUpRight : ArrowDownRight;
  const deltaColor = arrowGood ? 'var(--positive)' : 'var(--negative)';

  return (
    <div style={styles.card}>
      <div style={styles.cardLabel}>{label}</div>
      <div style={{ marginTop: 4 }}>
        <Money
          value={value}
          signed={signed}
          size={22}
          color={tone === 'negative' ? 'var(--negative)' : tone === 'positive' ? 'var(--ink)' : undefined}
        />
      </div>
      {hasDelta && (
        <div style={{ ...styles.delta, color: deltaColor }}>
          <Arrow size={13} strokeWidth={2} />
          <span className="tnum">{Math.abs(delta).toFixed(0)}%</span>
          <span style={{ color: 'var(--ink-subtle)' }}>vs prior 30d</span>
        </div>
      )}
    </div>
  );
}

const styles = {
  hero: {
    background: 'var(--surface)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-lg)',
    padding: 28,
    boxShadow: 'var(--shadow-soft)',
    textAlign: 'center',
  },
  heroLabel: {
    fontSize: 12,
    color: 'var(--ink-muted)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  threeUp: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
    marginTop: 16,
  },
  card: {
    background: 'var(--surface-warm)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-md)',
    padding: 14,
    minWidth: 0,
  },
  cardLabel: {
    fontSize: 12,
    color: 'var(--ink-muted)',
    fontWeight: 500,
  },
  delta: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    marginTop: 4,
  },
  sectionHead: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingInline: 4,
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 18,
    fontWeight: 500,
  },
};
