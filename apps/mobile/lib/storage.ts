/**
 * Secure token storage — wraps expo-secure-store with a fallback.
 * On web, falls back to localStorage (dev only).
 */

import { Platform } from 'react-native';

const TOKEN_KEY = 'omnivalue_access_token';
const REFRESH_KEY = 'omnivalue_refresh_token';
const USER_KEY = 'omnivalue_user';

async function getSecureStore() {
  if (Platform.OS === 'web') return null;
  try {
    return await import('expo-secure-store');
  } catch {
    return null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  const SecureStore = await getSecureStore();
  if (SecureStore) {
    await SecureStore.setItemAsync(key, value);
  } else {
    localStorage.setItem(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  const SecureStore = await getSecureStore();
  if (SecureStore) {
    return SecureStore.getItemAsync(key);
  }
  return localStorage.getItem(key);
}

async function removeItem(key: string): Promise<void> {
  const SecureStore = await getSecureStore();
  if (SecureStore) {
    await SecureStore.deleteItemAsync(key);
  } else {
    localStorage.removeItem(key);
  }
}

export const tokenStorage = {
  saveTokens: async (access: string, refresh: string) => {
    await Promise.all([setItem(TOKEN_KEY, access), setItem(REFRESH_KEY, refresh)]);
  },
  getAccessToken: () => getItem(TOKEN_KEY),
  getRefreshToken: () => getItem(REFRESH_KEY),
  clearTokens: async () => {
    await Promise.all([removeItem(TOKEN_KEY), removeItem(REFRESH_KEY)]);
  },
};

export const userStorage = {
  save: (user: object) => setItem(USER_KEY, JSON.stringify(user)),
  get: async <T>(): Promise<T | null> => {
    const raw = await getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  clear: () => removeItem(USER_KEY),
};
