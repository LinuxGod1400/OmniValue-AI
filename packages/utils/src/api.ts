/**
 * API response envelope helpers.
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ResponseMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
}

export function successResponse<T>(data: T, meta?: ResponseMeta): ApiResponse<T> {
  return { success: true, data, ...(meta !== undefined ? { meta } : {}) };
}

export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>,
): ApiResponse<never> {
  return {
    success: false,
    error: { code, message, ...(details !== undefined ? { details } : {}) },
  };
}

export const ErrorCode = {
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
