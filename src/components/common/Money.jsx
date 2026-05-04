import { useSettings } from '../../hooks/useFinanceData';

export default function Money({
  value,
  signed = false,
  muted = false,
  size = 16,
  weight = 500,
  family = 'display',
  color,
}) {
  const [{ currency }] = useSettings();
  const n = Number(value) || 0;
  const isNeg = n < 0;
  const isPos = n > 0;

  let display;
  try {
    display = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(n));
  } catch {
    display = `$${Math.abs(n).toFixed(2)}`;
  }

  const prefix = signed ? (isNeg ? '−' : isPos ? '+' : '') : isNeg ? '−' : '';
  const auto =
    color != null
      ? color
      : muted
        ? 'var(--ink-muted)'
        : signed && isPos
          ? 'var(--positive)'
          : signed && isNeg
            ? 'var(--negative)'
            : 'var(--ink)';

  return (
    <span
      className="tnum"
      style={{
        fontFamily: family === 'display' ? 'var(--font-display)' : 'var(--font-body)',
        fontSize: size,
        fontWeight: weight,
        color: auto,
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap',
      }}
    >
      {prefix}
      {display}
    </span>
  );
}
