'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { cookieClient } from '@/lib/cookies';
import { loginApi, logoutApi, getMeApi } from '@/features/auth/auth.api';
import type { User, TenantInfo } from '@/features/auth/auth.types';

interface AuthState {
  user: User | null;
  tenant: TenantInfo | null;
  enabledModules: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (tenant: string, email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  hasModule: (slug: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    tenant: null,
    enabledModules: [],
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = cookieClient.getToken();

    if (!token) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    getMeApi()
      .then(({ user, tenant, modules }) => {
        setState({ user: user, tenant, enabledModules: modules, isAuthenticated: true, isLoading: false });
      })
      .catch(() => {
        cookieClient.clear();
        setState({ user: null, tenant: null, enabledModules: [], isAuthenticated: false, isLoading: false });
      });
  }, []);

  async function login(tenantSlug: string, email: string, password: string, rememberMe: boolean): Promise<void> {
    cookieClient.setTenant(tenantSlug);

    const { token, expires_at, user, tenant } = await loginApi(tenantSlug, email, password, rememberMe);

    const daysToExpire = Math.ceil(
      (new Date(expires_at).getTime() - Date.now()) / 86_400_000
    );
    cookieClient.setToken(token, daysToExpire);

    const { modules } = await getMeApi();

    setState({ user: user, tenant, enabledModules: modules, isAuthenticated: true, isLoading: false });
  }

  async function logout(): Promise<void> {
    try {
      await logoutApi();
    } finally {
      cookieClient.clear();
      setState({ user: null, tenant: null, enabledModules: [], isAuthenticated: false, isLoading: false });
      router.push('/login');
    }
  }

  function hasModule(slug: string): boolean {
    return state.enabledModules.includes(slug);
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, hasModule }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
