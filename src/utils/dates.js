/** All dates handled as ISO date strings (YYYY-MM-DD) for stability across timezones. */

export function todayISO() {
  const d = new Date();
  return toISO(d);
}

export function toISO(d) {
  const tz = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function fromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function isSameMonth(aDate, bDate) {
  return (
    aDate.getFullYear() === bDate.getFullYear() &&
    aDate.getMonth() === bDate.getMonth()
  );
}

export function monthLabel(d = new Date()) {
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function shortDate(iso) {
  const d = fromISO(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function dayOfWeek(iso) {
  const d = fromISO(iso);
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

export function relativeDay(iso) {
  const d = fromISO(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diffDays = Math.round((d - today) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1 && diffDays < 7) return d.toLocaleDateString(undefined, { weekday: 'long' });
  return shortDate(iso);
}

export function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
