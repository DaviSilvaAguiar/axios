'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Tema = 'light' | 'dark';

interface ThemeContextValue {
  tema: Tema;
  toggleTema: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem('tema') as Tema | null) ?? 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'dark');
  }, [tema]);

  const toggleTema = () => {
    setTema(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('tema', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ tema, toggleTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  return ctx;
}
