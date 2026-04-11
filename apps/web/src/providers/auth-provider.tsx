'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { auth as authApi, readSession, writeSession, type VoixaSession, type VoixaUser } from '@/src/lib/api-client';

interface AuthContextValue {
  session: VoixaSession | null;
  user: VoixaUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<VoixaSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const existing = readSession();
    setSession(existing);
    setLoading(false);
  }, []);

  const setAndPersist = useCallback((next: VoixaSession | null) => {
    setSession(next);
    writeSession(next);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authApi.login(email, password);
      setAndPersist(result);
    },
    [setAndPersist],
  );

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const result = await authApi.register(email, password, name);
      setAndPersist(result);
    },
    [setAndPersist],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    setAndPersist(null);
  }, [setAndPersist]);

  const refresh = useCallback(async () => {
    if (!session) return;
    try {
      const me = await authApi.me();
      setAndPersist({ accessToken: session.accessToken, user: me });
    } catch {
      setAndPersist(null);
    }
  }, [session, setAndPersist]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      login,
      register,
      logout,
      refresh,
    }),
    [session, loading, login, register, logout, refresh],
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
