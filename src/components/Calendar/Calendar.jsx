import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Receipt } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import Money from '../common/Money';
import Modal from '../common/Modal';
import TxRow from '../common/TxRow';
import { useAccounts, useBills, useTransactions } from '../../hooks/useFinanceData';
import { categoryColor } from '../../utils/categories';
import { toISO, fromISO } from '../../utils/dates';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function Calendar() {
  const { transactions } = useTransactions();
  const { bills } = useBills();
  const { accounts } = useAccounts();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedISO, setSelectedISO] = useState(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const accountById = useMemo(
    () => Object.fromEntries(accounts.map((a) => [a.id, a])),
    [accounts],
  );

  const grid = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor]);

  const txByDate = useMemo(() => {
    const map = new Map();
    for (const t of transactions) {
      const arr = map.get(t.date) || [];
      arr.push(t);
      map.set(t.date, arr);
    }
    return map;
  }, [transactions]);

  // Bills due in the visible month, keyed by ISO of their due date.
  const billsByDate = useMemo(() => {
    const map = new Map();
    const last = new Date(cursor.year, cursor.month + 1, 0).getDate();
    for (const b of bills) {
      const day = Math.min(b.dueDay, last);
      const iso = toISO(new Date(cursor.year, cursor.month, day));
      const arr = map.get(iso) || [];
      arr.push(b);
      map.set(iso, arr);
    }
    return map;
  }, [bills, cursor]);

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const goPrev = () =>
    setCursor((c) => {
      const m = c.month - 1;
      return m < 0 ? { year: c.year - 1, month: 11 } : { ...c, month: m };
    });
  const goNext = () =>
    setCursor((c) => {
      const m = c.month + 1;
      return m > 11 ? { year: c.year + 1, month: 0 } : { ...c, month: m };
    });
  const goToday = () => setCursor({ year: today.getFullYear(), month: today.getMonth() });

  const onCurrentMonth =
    cursor.year === today.getFullYear() && cursor.month === today.getMonth();

  // Touch swipe for month navigation
  const touchStart = useRef(null);
  const onTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchStart.current = null;
  };

  const monthTotal = useMemo(() => {
    let spending = 0;
    let income = 0;
    for (const day of grid) {
      if (!day.inMonth) continue;
      const txs = txByDate.get(day.iso) || [];
      for (const t of txs) {
        const amt = Number(t.amount) || 0;
        if (amt < 0) spending += -amt;
        else income += amt;
      }
    }
    return { spending, income };
  }, [grid, txByDate]);

  const selectedTx = selectedISO ? txByDate.get(selectedISO) || [] : [];
  const selectedBills = selectedISO ? billsByDate.get(selectedISO) || [] : [];

  return (
    <div>
      <PageHeader title="Calendar" subtitle="Your month at a glance." />

      <div style={styles.controls}>
        <div style={styles.controlsLeft}>
          <button className="tap" aria-label="Previous month" onClick={goPrev} style={styles.navBtn}>
            <ChevronLeft size={18} />
          </button>
          <div style={styles.monthLabel}>{monthLabel}</div>
          <button className="tap" aria-label="Next month" onClick={goNext} style={styles.navBtn}>
            <ChevronRight size={18} />
          </button>
        </div>
        {!onCurrentMonth && (
          <button className="btn" onClick={goToday} style={styles.todayBtn}>
            <CalIcon size={14} /> Today
          </button>
        )}
      </div>

      <section style={styles.totals}>
        <div style={styles.totalCell}>
          <div style={styles.totalLabel}>Income</div>
          <Money value={monthTotal.income} size={18} />
        </div>
        <div style={styles.totalCell}>
          <div style={styles.totalLabel}>Spending</div>
          <Money value={monthTotal.spending} size={18} />
        </div>
        <div style={styles.totalCell}>
          <div style={styles.totalLabel}>Net</div>
          <Money
            value={monthTotal.income - monthTotal.spending}
            size={18}
            signed
          />
        </div>
      </section>

      <div
        style={styles.grid}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-label={`${monthLabel} calendar`}
      >
        {WEEKDAYS.map((d, i) => (
          <div key={`wd-${i}`} style={styles.weekday}>
            {d}
          </div>
        ))}
        {grid.map((day) => {
          const txs = txByDate.get(day.iso) || [];
          const dayBills = billsByDate.get(day.iso) || [];
          let spent = 0;
          for (const t of txs) {
            const amt = Number(t.amount) || 0;
            if (amt < 0) spent += -amt;
          }
          const isToday = day.iso === toISO(today);
          return (
            <button
              key={day.iso}
              className="tap"
              onClick={() => setSelectedISO(day.iso)}
              style={{
                ...styles.cell,
                background: !day.inMonth
                  ? 'transparent'
                  : isToday
                    ? 'var(--surface-warm)'
                    : 'var(--surface)',
                borderColor: isToday ? 'var(--accent)' : 'var(--border-soft)',
                opacity: day.inMonth ? 1 : 0.35,
              }}
              aria-label={`${day.iso}${spent ? `, spent ${spent.toFixed(2)}` : ''}`}
            >
              <div
                style={{
                  ...styles.dayNum,
                  color: isToday ? 'var(--accent)' : 'var(--ink)',
                  fontWeight: isToday ? 600 : 500,
                }}
              >
                {day.d}
              </div>
              {spent > 0 && (
                <div style={styles.spentText} className="tnum">
                  {abbreviateAmount(spent)}
                </div>
              )}
              {dayBills.length > 0 && (
                <div style={styles.billDots}>
                  {dayBills.slice(0, 3).map((b, i) => (
                    <span
                      key={b.id + i}
                      style={{
                        ...styles.billDot,
                        background: categoryColor(b.category),
                      }}
                    />
                  ))}
                  {dayBills.length > 3 && (
                    <span style={styles.billMore}>+{dayBills.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Modal
        open={!!selectedISO}
        title={selectedISO ? formatLongDate(selectedISO) : ''}
        onClose={() => setSelectedISO(null)}
      >
        {selectedBills.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <h4 style={styles.sectionLabel}>Bills due</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {selectedBills.map((b) => (
                <div key={b.id} style={styles.billRow}>
                  <Receipt size={16} color={categoryColor(b.category)} />
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{b.name}</div>
                  <Money value={b.amount} size={14} weight={500} />
                </div>
              ))}
            </div>
          </div>
        )}
        {selectedTx.length === 0 && selectedBills.length === 0 ? (
          <p style={{ color: 'var(--ink-muted)', margin: 0 }}>
            No transactions or bills on this day.
          </p>
        ) : selectedTx.length > 0 ? (
          <>
            <h4 style={styles.sectionLabel}>Transactions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {selectedTx.map((t) => (
                <TxRow key={t.id} tx={t} accountName={accountById[t.accountId]?.name} />
              ))}
            </div>
          </>
        ) : null}
      </Modal>
    </div>
  );
}

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const lead = first.getDay(); // 0 = Sunday
  const lastDay = new Date(year, month + 1, 0).getDate();
  const cells = [];
  // Lead-in: previous month
  const prevLast = new Date(year, month, 0).getDate();
  for (let i = lead - 1; i >= 0; i -= 1) {
    const d = prevLast - i;
    const date = new Date(year, month - 1, d);
    cells.push({ d, iso: toISO(date), inMonth: false });
  }
  // This month
  for (let d = 1; d <= lastDay; d += 1) {
    const date = new Date(year, month, d);
    cells.push({ d, iso: toISO(date), inMonth: true });
  }
  // Trailing fill to multiple of 7
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1];
    const next = fromISO(last.iso);
    next.setDate(next.getDate() + 1);
    cells.push({ d: next.getDate(), iso: toISO(next), inMonth: false });
  }
  return cells;
}

function abbreviateAmount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  if (n >= 100) return Math.round(n).toString();
  return n.toFixed(0);
}

function formatLongDate(iso) {
  const d = fromISO(iso);
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

const styles = {
  controls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  controlsLeft: { display: 'flex', alignItems: 'center', gap: 6 },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 'var(--radius-pill)',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--ink)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: 18,
    fontWeight: 500,
    minWidth: 140,
    textAlign: 'center',
  },
  todayBtn: { padding: '6px 12px', minHeight: 36 },
  totals: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
    marginBottom: 14,
  },
  totalCell: {
    background: 'var(--surface-warm)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-md)',
    padding: 10,
    textAlign: 'center',
  },
  totalLabel: {
    fontSize: 11,
    color: 'var(--ink-muted)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 4,
    touchAction: 'pan-y',
  },
  weekday: {
    fontSize: 11,
    color: 'var(--ink-subtle)',
    textAlign: 'center',
    fontWeight: 500,
    paddingBottom: 4,
  },
  cell: {
    aspectRatio: '1 / 1.05',
    background: 'var(--surface)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-sm)',
    padding: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 44,
    gap: 2,
  },
  dayNum: { fontSize: 13, lineHeight: 1.2 },
  spentText: { fontSize: 10, color: 'var(--negative)', lineHeight: 1 },
  billDots: { display: 'flex', gap: 2, marginTop: 'auto', alignItems: 'center' },
  billDot: { width: 5, height: 5, borderRadius: 999, display: 'inline-block' },
  billMore: {
    fontSize: 9,
    color: 'var(--ink-subtle)',
    marginLeft: 1,
  },
  sectionLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--ink-muted)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    margin: '0 0 8px',
  },
  billRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    background: 'var(--surface-warm)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-md)',
  },
};
