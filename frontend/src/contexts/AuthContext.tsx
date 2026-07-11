'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { cookieClient } from '@/lib/cookies';
import { loginApi, logoutApi, getMeApi } from '@/features/auth/auth.api';
import type { Usuario, TenantInfo } from '@/features/auth/auth.types';

interface AuthState {
  usuario: Usuario | null;
  tenant: TenantInfo | null;
  modulosHabilitados: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (tenant: string, email: string, senha: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  temModulo: (slug: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    usuario: null,
    tenant: null,
    modulosHabilitados: [],
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
      .then(({ usuario, tenant, modulos }) => {
        setState({ usuario, tenant, modulosHabilitados: modulos, isAuthenticated: true, isLoading: false });
      })
      .catch(() => {
        cookieClient.clear();
        setState({ usuario: null, tenant: null, modulosHabilitados: [], isAuthenticated: false, isLoading: false });
      });
  }, []);

  async function login(tenantSlug: string, email: string, senha: string, rememberMe: boolean): Promise<void> {
    cookieClient.setTenant(tenantSlug);

    const { token, expires_at, usuario, tenant } = await loginApi(tenantSlug, email, senha, rememberMe);

    const diasParaExpirar = Math.ceil(
      (new Date(expires_at).getTime() - Date.now()) / 86_400_000
    );
    cookieClient.setToken(token, diasParaExpirar);

    const { modulos } = await getMeApi();

    setState({ usuario, tenant, modulosHabilitados: modulos, isAuthenticated: true, isLoading: false });
  }

  async function logout(): Promise<void> {
    try {
      await logoutApi();
    } finally {
      cookieClient.clear();
      setState({ usuario: null, tenant: null, modulosHabilitados: [], isAuthenticated: false, isLoading: false });
      router.push('/login');
    }
  }

  function temModulo(slug: string): boolean {
    return state.modulosHabilitados.includes(slug);
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, temModulo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}
