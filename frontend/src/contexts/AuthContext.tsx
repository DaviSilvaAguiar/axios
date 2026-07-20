'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cookieClient } from '@/lib/cookies';
import { queryKeys } from '@/lib/queryKeys';
import { loginApi, logoutApi, getMeApi } from '@/features/auth/auth.api';
import type { User, TenantInfo } from '@/features/auth/auth.types';

interface AuthContextValue {
  user: User | null;
  tenant: TenantInfo | null;
  enabledModules: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tenant: string, email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  hasModule: (slug: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const hasToken = typeof window !== 'undefined' && !!cookieClient.getToken();

  const meQuery = useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      try {
        return await getMeApi();
      } catch (error) {
        cookieClient.clear();
        throw error;
      }
    },
    enabled: hasToken,
    retry: false,
    staleTime: Infinity,
  });

  const me = meQuery.data ?? null;

  async function login(tenantSlug: string, email: string, password: string, rememberMe: boolean): Promise<void> {
    cookieClient.setTenant(tenantSlug);

    const { token, expires_at } = await loginApi(tenantSlug, email, password, rememberMe);

    const daysToExpire = Math.ceil(
      (new Date(expires_at).getTime() - Date.now()) / 86_400_000
    );
    cookieClient.setToken(token, daysToExpire);

    queryClient.setQueryData(queryKeys.me, await getMeApi());
  }

  async function logout(): Promise<void> {
    try {
      await logoutApi();
    } finally {
      cookieClient.clear();
      queryClient.removeQueries();
      router.push('/login');
    }
  }

  function hasModule(slug: string): boolean {
    return (me?.modules ?? []).includes(slug);
  }

  return (
    <AuthContext.Provider
      value={{
        user: me?.user ?? null,
        tenant: me?.tenant ?? null,
        enabledModules: me?.modules ?? [],
        isAuthenticated: Boolean(me?.user),
        isLoading: meQuery.isLoading,
        login,
        logout,
        hasModule,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
