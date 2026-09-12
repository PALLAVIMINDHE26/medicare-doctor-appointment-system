import { format, parseISO, isValid } from 'date-fns';

/** Formats an ISO date/date-string to e.g. "12 Sep 2026". */
export const formatDate = (date) => {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? format(d, 'dd MMM yyyy') : '—';
};

/** Formats an ISO date to e.g. "Friday, 12 Sep 2026". */
export const formatDateLong = (date) => {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? format(d, 'EEEE, dd MMM yyyy') : '—';
};

/** Converts a 24-hour 'HH:mm' string to 12-hour display, e.g. "09:30" -> "9:30 AM". */
export const formatTime = (hhmm) => {
  if (!hhmm) return '—';
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    amount
  );
};

/** Converts a Date object to a 'YYYY-MM-DD' string in local time (not UTC-shifted). */
export const toDateInputValue = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');
