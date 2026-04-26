/** Format a `Date` for `<input type="datetime-local" />` in local time. */
export function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Monday 00:00:00 local of the week containing `d`. */
export function startOfWeekMonday(d: Date): Date {
  const x = new Date(d);
  const mondayOffset = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - mondayOffset);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export function endOfWeekSunday(weekStartMonday: Date): Date {
  const x = addDays(weekStartMonday, 6);
  x.setHours(23, 59, 59, 999);
  return x;
}

/** ISO range for API `from` / `to` (inclusive day bounds). */
export function toIsoRange(from: Date, to: Date): { from: string; to: string } {
  const f = new Date(from);
  f.setHours(0, 0, 0, 0);
  const t = new Date(to);
  t.setHours(23, 59, 59, 999);
  return { from: f.toISOString(), to: t.toISOString() };
}

export function formatBookingRange(startIso: string, endIso: string): string {
  const s = new Date(startIso);
  const e = new Date(endIso);
  return `${s.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} – ${e.toLocaleTimeString(undefined, { timeStyle: 'short' })}`;
}
