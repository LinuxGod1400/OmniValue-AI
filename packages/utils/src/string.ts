/**
 * String utilities.
 */

/** Truncate a string to `maxLength` characters, appending `…` if truncated. */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}

/** Convert a string to kebab-case. */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/** Capitalize the first letter of a string. */
export function capitalize(str: string): string {
  if (str.length === 0) return str;
  return str[0]!.toUpperCase() + str.slice(1);
}
