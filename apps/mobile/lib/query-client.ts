import { QueryClient } from '@tanstack/react-query';

const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:3000';

export function getApiUrl(): string {
  return API_URL;
}

async function defaultFetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: ({ queryKey }) => defaultFetcher(String(queryKey[0])),
      staleTime: 1000 * 60,
      retry: 2,
    },
  },
});

export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  const url = new URL(path, getApiUrl()).toString();
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    throw new Error(`${method} ${path} failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
