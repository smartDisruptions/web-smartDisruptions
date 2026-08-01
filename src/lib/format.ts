const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Format an ISO date string (YYYY-MM-DD) as "July 8, 2026".
 * Parses the parts directly rather than via `new Date()` so the rendered
 * day never shifts with the server's timezone. Falls back to the raw
 * string if it isn't a well-formed ISO date.
 */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d || m < 1 || m > 12) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
