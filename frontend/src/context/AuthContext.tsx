import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { api } from '../lib/api';
import { clearTokens, getAccessToken, getRefreshToken, getRememberPreference, setTokens } from '../lib/authStorage';
import type { AuthUser, AuthTokensResponse } from '../types/user';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  register: (input: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    remember: boolean;
  }) => Promise<AuthUser>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const { data } = await api.get<AuthUser>('/auth/me');
    setUser(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const access = getAccessToken();
      if (!access) {
        const rt = getRefreshToken();
        if (rt) {
          try {
            const { data } = await api.post<AuthTokensResponse>('/auth/refresh', {
              refreshToken: rt,
            });
            if (cancelled) return;
            setTokens(data.accessToken, data.refreshToken, getRememberPreference());
            setUser(data.user);
          } catch {
            clearTokens();
          }
        }
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const { data } = await api.get<AuthUser>('/auth/me');
        if (!cancelled) setUser(data);
      } catch {
        const rt = getRefreshToken();
        if (rt) {
          try {
            const { data } = await api.post<AuthTokensResponse>('/auth/refresh', {
              refreshToken: rt,
            });
            if (cancelled) return;
            setTokens(data.accessToken, data.refreshToken, getRememberPreference());
            setUser(data.user);
          } catch {
            clearTokens();
          }
        } else {
          clearTokens();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const { data } = await api.post<AuthTokensResponse>('/auth/login', { email, password });
    setTokens(data.accessToken, data.refreshToken, remember);
    setUser(data.user);
  }, []);

  const register = useCallback(
    async (input: {
      fullName: string;
      email: string;
      password: string;
      phone: string;
      remember: boolean;
    }) => {
      const { data } = await api.post<AuthTokensResponse>('/auth/register', {
        fullName: input.fullName,
        email: input.email,
        password: input.password,
        phone: input.phone.trim(),
      });
      setTokens(data.accessToken, data.refreshToken, input.remember);
      setUser(data.user);
      return data.user;
    },
    [],
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, loading, login, register, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
