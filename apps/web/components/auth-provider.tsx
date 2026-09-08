'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type User = { id: string; email: string; name: string | null };

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const raw = window.localStorage.getItem('researchtrail_user');
      if (raw) {
        try { setUser(JSON.parse(raw) as User); } catch { window.localStorage.removeItem('researchtrail_user'); }
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    ready,
    login: (accessToken, nextUser) => {
      window.localStorage.setItem('researchtrail_token', accessToken);
      window.localStorage.setItem('researchtrail_user', JSON.stringify(nextUser));
      setUser(nextUser);
    },
    logout: () => {
      window.localStorage.removeItem('researchtrail_token');
      window.localStorage.removeItem('researchtrail_user');
      setUser(null);
    },
  }), [user, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
