import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { dailyFlow } from '../../utils/calculations';
import { useSettings } from '../../hooks/useFinanceData';

export default function SpendingChart({ transactions, days = 30 }) {
  const data = useMemo(() => dailyFlow(transactions, days), [transactions, days]);
  const [{ currency }] = useSettings();
  const fmt = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }),
    [currency],
  );

  const max = data.reduce((m, d) => (d.spending > m ? d.spending : m), 0);

  if (max === 0) return null;

  return (
    <div style={styles.wrap}>
      <header style={styles.head}>
        <h3 style={styles.title}>Daily spending</h3>
        <span style={styles.sub}>last {days} days</span>
      </header>

      <div style={{ width: '100%', height: 160 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--border-soft)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(iso) => {
                const d = new Date(iso);
                return d.getDate() === 1 || d.getDate() % 7 === 0
                  ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                  : '';
              }}
              tick={{ fill: 'var(--ink-subtle)', fontSize: 10 }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
              interval={0}
            />
            <YAxis
              tickFormatter={(v) => (v === 0 ? '' : fmt.format(v))}
              tick={{ fill: 'var(--ink-subtle)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              cursor={{ fill: 'rgba(160, 137, 104, 0.08)' }}
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
                padding: '6px 10px',
              }}
              formatter={(value) => [fmt.format(value), 'Spent']}
              labelFormatter={(iso) =>
                new Date(iso).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })
              }
            />
            <Bar dataKey="spending" fill="var(--accent)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    background: 'var(--surface)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-lg)',
    padding: 18,
    boxShadow: 'var(--shadow-soft)',
    marginTop: 16,
  },
  head: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 16,
    fontWeight: 500,
  },
  sub: { color: 'var(--ink-muted)', fontSize: 12 },
};
