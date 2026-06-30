import { describe, expect, it } from 'vitest';
import { truncate, toKebabCase, capitalize } from './string.js';

describe('truncate', () => {
  it('returns string unchanged when within limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates and appends ellipsis', () => {
    const result = truncate('hello world', 8);
    expect(result).toHaveLength(8);
    expect(result.endsWith('…')).toBe(true);
  });
});

describe('toKebabCase', () => {
  it('converts camelCase to kebab-case', () => {
    expect(toKebabCase('myVariableName')).toBe('my-variable-name');
  });

  it('converts spaces to hyphens', () => {
    expect(toKebabCase('hello world')).toBe('hello-world');
  });
});

describe('capitalize', () => {
  it('capitalizes the first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('handles empty string', () => {
    expect(capitalize('')).toBe('');
  });
});
