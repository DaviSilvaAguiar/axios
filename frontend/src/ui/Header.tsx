'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, List } from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSidebar } from '@/contexts/SidebarContext';
import OffCanvasMenu from '@/ui/OffCanvasMenu';

function getInitials(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return (parts[0][0] ?? '?').toUpperCase();
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase() || '?';
}

function montarSaudacao(nome: string, hora: number): string {
  const prefixo = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const primeiroNome = nome.trim().split(' ')[0] || 'você';
  return `${prefixo}, ${primeiroNome}!`;
}

const PERFIL_LABEL: Record<number, string> = {
  1: 'Administrador',
  2: 'Gestor',
  3: 'Prestador',
};

export default function Header() {
  const { usuario, tenant } = useAuth();
  const { tema, toggleTema } = useTheme();
  const { setOpen } = useSidebar();

  const [menuOpen, setMenuOpen] = useState(false);
  const [horaLocal, setHoraLocal] = useState<number | null>(null);

  useEffect(() => {
    setHoraLocal(new Date().getHours());
  }, []);

  const initials = usuario ? getInitials(usuario.nome) : '?';
  const empresa = tenant?.fantasia ?? tenant?.razao_social ?? '';
  const perfilLabel = usuario ? (PERFIL_LABEL[usuario.perfil] ?? null) : null;
  const saudacaoTexto = usuario && horaLocal !== null ? montarSaudacao(usuario.nome, horaLocal) : '';

  return (
    <>
      <header className="mx-3 mt-3 flex items-center justify-between px-5 py-3.5 rounded-2xl bg-app-surface border border-app-border shadow-[0_4px_32px_rgba(0,0,0,0.10)]">
        <div className="flex items-center gap-3">
          {/* Mobile: hamburguer */}
          <button
            type="button"
            className="md:hidden text-app-text-muted hover:text-app-text transition-colors"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
          >
            <List size={22} />
          </button>

          {/* Saudação — desktop: empilhada com empresa + badge; mobile: só texto */}
          {usuario && (
            <motion.div
              className="flex flex-col gap-0.5"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <span className="text-sm font-semibold text-app-text leading-none">
                {saudacaoTexto}
              </span>
              {/* Empresa + badge só no desktop */}
              <motion.div
                className="hidden md:flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.22, delay: 0.12, ease: 'easeOut' }}
              >
                {empresa && (
                  <span className="text-[11px] text-app-text-subtle leading-none">
                    {empresa}
                  </span>
                )}
                {perfilLabel && (
                  <span className="text-[10px] font-medium text-brand bg-brand/[0.08] px-2 py-0.5 rounded-full leading-none">
                    {perfilLabel}
                  </span>
                )}
              </motion.div>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTema}
            aria-label={tema === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-app-border bg-app-surface-raised text-app-text-muted hover:bg-app-surface-raised-hover transition-colors cursor-pointer"
          >
            {tema === 'light' ? <Moon size={15} weight="bold" /> : <Sun size={15} weight="bold" />}
          </button>

          {usuario && (
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex items-center gap-3 rounded-full hover:bg-app-hover px-1 py-1 transition-colors cursor-pointer"
              aria-label="Abrir menu do usuário"
            >
              {/* Nome completo — só desktop, sem empresa */}
              <span className="hidden sm:block text-sm font-medium text-app-text leading-none">
                {usuario.nome}
              </span>
              <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-semibold tracking-wide">
                  {initials}
                </span>
              </div>
            </button>
          )}
        </div>
      </header>

      <OffCanvasMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
