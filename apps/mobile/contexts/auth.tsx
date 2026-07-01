import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { tokenStorage, userStorage } from '@/lib/storage';
import { apiCall, ApiError } from '@/lib/api';

interface User {
  id: string;
  email: string;
  displayName: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<(AuthState & AuthActions) | null>(null);

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    void (async () => {
      try {
        const [token, savedUser] = await Promise.all([
          tokenStorage.getAccessToken(),
          userStorage.get<User>(),
        ]);
        if (token && savedUser) setUser(savedUser);
      } catch {
        /* ignore */
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleAuthResponse = useCallback(async (data: AuthResponse) => {
    await tokenStorage.saveTokens(data.accessToken, data.refreshToken);
    await userStorage.save(data.user);
    setUser(data.user);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiCall<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    await handleAuthResponse(data);
  }, [handleAuthResponse]);

  const register = useCallback(async (email: string, password: string, displayName?: string) => {
    const data = await apiCall<AuthResponse>('/auth/register', {
      method: 'POST',
      body: { email, password, ...(displayName ? { displayName } : {}) },
    });
    await handleAuthResponse(data);
  }, [handleAuthResponse]);

  const logout = useCallback(async () => {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) {
        await apiCall('/auth/logout', { method: 'POST', body: { refreshToken } }).catch(() => undefined);
      }
    } finally {
      await Promise.all([tokenStorage.clearTokens(), userStorage.clear()]);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState & AuthActions {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { ApiError };
