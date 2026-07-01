/**
 * Authenticated API client.
 * Automatically injects Bearer token and refreshes on 401.
 */

import { tokenStorage } from './storage';

const API_URL = (process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:3000').replace(/\/$/, '');

export function getApiUrl(): string {
  return API_URL;
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  isFormData?: boolean;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiCall<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, isFormData = false } = options;
  const token = await tokenStorage.getAccessToken();

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData && body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Auto-refresh on 401
  if (res.status === 401 && path !== '/auth/refresh') {
    const refreshed = await tryRefresh();
    if (refreshed) return apiCall<T>(path, options);
  }

  const json = (await res.json()) as { success: boolean; data?: T; error?: { code: string; message: string } };

  if (!res.ok) {
    throw new ApiError(res.status, json.error?.code ?? 'UNKNOWN', json.error?.message ?? 'Request failed');
  }

  return json.data as T;
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const json = (await res.json()) as { data?: { accessToken: string; refreshToken: string } };
    if (json.data) {
      await tokenStorage.saveTokens(json.data.accessToken, json.data.refreshToken);
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}
