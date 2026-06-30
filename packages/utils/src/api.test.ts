import { describe, expect, it } from 'vitest';
import { successResponse, errorResponse, ErrorCode } from './api.js';

describe('successResponse', () => {
  it('returns success: true with data', () => {
    const res = successResponse({ id: '1' });
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ id: '1' });
    expect(res.error).toBeUndefined();
  });

  it('includes meta when provided', () => {
    const meta = { page: 1, pageSize: 10, total: 100, totalPages: 10 };
    const res = successResponse([], meta);
    expect(res.meta).toEqual(meta);
  });
});

describe('errorResponse', () => {
  it('returns success: false with error envelope', () => {
    const res = errorResponse(ErrorCode.NOT_FOUND, 'Resource not found');
    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('NOT_FOUND');
    expect(res.error?.message).toBe('Resource not found');
  });

  it('includes details when provided', () => {
    const res = errorResponse(ErrorCode.BAD_REQUEST, 'Validation failed', { field: 'email' });
    expect(res.error?.details).toEqual({ field: 'email' });
  });
});
