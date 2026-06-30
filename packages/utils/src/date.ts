/**
 * Date / time utilities.
 */

/** Return an ISO-8601 timestamp string for the current moment. */
export function nowIso(): string {
  return new Date().toISOString();
}

/** Parse a date-like value and return a Date, or null if invalid. */
export function parseDate(value: string | number | Date): Date | null {
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/** Format a Date as a human-readable short date (locale-independent). */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
