import { createContext, startTransition, useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { authApi } from '@/api/auth';
import { registerUnauthorizedHandler } from '@/api/http';
import type { AuthResponseDto, StorageMode, StoredSession, UserDetailsDto } from '@/api/types';
import { clearSession, readSession, writeSession } from '@/lib/session';

interface AuthContextValue {
  session: StoredSession | null;
  user: UserDetailsDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (session: AuthResponseDto, storageMode: StorageMode) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserDetailsDto) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<StoredSession | null>(() => readSession());
  const [user, setUser] = useState<UserDetailsDto | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(readSession()));

  const resetAuth = useCallback(() => {
    clearSession();
    startTransition(() => {
      setSession(null);
      setUser(null);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(resetAuth);
    return () => registerUnauthorizedHandler(null);
  }, [resetAuth]);

  useEffect(() => {
    const stored = readSession();
    if (!stored) {
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

    void authApi
      .me()
      .then((profile) => {
        if (!active) {
          return;
        }

        startTransition(() => {
          setSession(stored);
          setUser(profile);
          setIsLoading(false);
        });
      })
      .catch(() => {
        if (!active) {
          return;
        }

        resetAuth();
      });

    return () => {
      active = false;
    };
  }, [resetAuth]);

  const login = useCallback(async (authSession: AuthResponseDto, storageMode: StorageMode) => {
    setIsLoading(true);
    const stored = writeSession(authSession, storageMode);
    const profile = await authApi.me();

    startTransition(() => {
      setSession(stored);
      setUser(profile);
      setIsLoading(false);
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      if (readSession()) {
        await authApi.logout();
      }
    } finally {
      resetAuth();
    }
  }, [resetAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      isLoading,
      isAuthenticated: Boolean(session && user),
      login,
      logout,
      setUser,
    }),
    [session, user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
