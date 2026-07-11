'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HouseLine,
  ChartBar,
  Receipt,
  Wallet,
  ArrowUUpLeft,
  DownloadSimple,
  Buildings,
  Tag,
  Bank,
  Storefront,
  Users,
  X,
  SignOut,
  ArrowLineLeft,
  ArrowLineRight,
  Plus,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { listarUsuariosApi } from '@/features/usuario/usuario.api';

const navItemsAdmin = [
  { href: '/dashboard', label: 'Início', icon: HouseLine },
  { href: '/painel', label: 'Dashboard', icon: ChartBar },
  { href: '/rdc', label: 'Caixa de Obra', icon: Receipt, modulo: 'rdc' },
  { href: '/caixas', label: 'Gestão de Caixas', icon: Wallet, modulo: 'caixas' },
  { href: '/rcm', label: 'Reembolso', icon: ArrowUUpLeft, modulo: 'rcm' },
  { href: '/exportacao', label: 'Exportação ERP', icon: DownloadSimple, modulo: 'exportacao' },
  { href: '/centro-de-custo', label: 'Centros de Custo', icon: Buildings, modulo: 'centro-custo' },
  { href: '/categoria-despesa', label: 'Categorias', icon: Tag, modulo: 'categoria' },
  { href: '/conta-bancaria', label: 'Contas Bancárias', icon: Bank, modulo: 'conta-bancaria' },
  { href: '/fornecedor', label: 'Fornecedores', icon: Storefront, modulo: 'fornecedor' },
];

const navItemsPrestador = [
  { href: '/dashboard', label: 'Início', icon: HouseLine },
  { href: '/meus-lancamentos', label: 'Meus lançamentos', icon: Receipt },
];

export default function Sidebar() {
  const { open, setOpen, collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();
  const { logout, tenant, usuario, modulosHabilitados } = useAuth();

  const baseNavItems = usuario?.perfil === 3 ? navItemsPrestador : navItemsAdmin;
  const navItems = baseNavItems.filter(
    (item) => !('modulo' in item) || modulosHabilitados.includes(item.modulo as string)
  );
  const isPrestador = usuario?.perfil === 3;
  const [totalUsuarios, setTotalUsuarios] = useState<number>(0);

  useEffect(() => {
    if (isPrestador) return;
    listarUsuariosApi(1, 1).then((res) => setTotalUsuarios(res.meta.total)).catch(() => { });
  }, [isPrestador]);

  const maxUsuarios = tenant?.max_usuarios ?? null;
  const pct = maxUsuarios ? Math.min((totalUsuarios / maxUsuarios) * 100, 100) : 0;
  const barColor = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#0052ff';

  const close = () => setOpen(false);
  const toggleCollapsed = () => setCollapsed(!collapsed);

  return (
    <>
      {/* Overlay — apenas mobile */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={close}
        />
      )}

      {/* Painel lateral flutuante */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-app-surface',
          'transition-all duration-300 ease-in-out',
          'md:relative md:z-auto md:translate-x-0 md:flex',
          'md:my-3 md:ml-3 md:rounded-2xl md:h-[calc(100vh-1.5rem)]',
          'border border-app-border',
          'shadow-[0_4px_32px_rgba(0,0,0,0.10)]',
          'w-60',
          collapsed ? 'md:w-[72px]' : 'md:w-60',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Cabeçalho */}
        <div
          className={[
            'flex items-center py-5 border-b border-app-border-subtle',
            collapsed ? 'md:justify-center md:px-3 px-5 justify-between' : 'px-5 justify-between',
          ].join(' ')}
        >
          <span
            className={[
              'text-app-text font-semibold text-base tracking-tight',
              collapsed ? 'md:hidden' : '',
            ].join(' ')}
          >
            Axios
          </span>

          {/* Toggle colapsar — apenas desktop */}
          <button
            className="hidden md:flex items-center justify-center text-app-text-muted hover:text-app-text transition-colors rounded-lg p-0.5 cursor-pointer"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expandir menu' : 'Retrair menu'}
          >
            {collapsed ? <ArrowLineRight size={18} /> : <ArrowLineLeft size={18} />}
          </button>

          {/* Fechar — apenas mobile */}
          <button
            className="md:hidden text-app-text-muted hover:text-app-text transition-colors"
            onClick={close}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto py-3">
          <ul className="space-y-0.5 px-3">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={close}
                    className={[
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      collapsed ? 'md:justify-center md:px-2' : '',
                      active
                        ? 'bg-app-nav-active text-brand'
                        : 'text-app-text-muted hover:text-app-text hover:bg-app-hover',
                    ].join(' ')}
                  >
                    <Icon size={19} weight={active ? 'fill' : 'regular'} />
                    <span className={collapsed ? 'md:hidden' : ''}>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Botão CTA — Prestador */}
        {isPrestador && (
          <div className="px-3 pb-3">
            <Link
              href="/novo-reembolso"
              onClick={close}
              className={[
                'flex items-center gap-2.5 rounded-xl bg-brand text-white px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-[#578bfa]',
                collapsed ? 'md:justify-center md:px-2' : '',
              ].join(' ')}
            >
              <Plus size={17} weight="bold" />
              <span className={collapsed ? 'md:hidden' : ''}>Nova Solicitação</span>
            </Link>
          </div>
        )}

        {/* Rodapé */}
        <div className="px-3 pb-4 border-t border-app-border-subtle pt-3 space-y-0.5">
          {/* Widget de limite de usuários — apenas para Admin/Gestor */}
          {!isPrestador && !collapsed && (
            <div className="px-3 py-2.5 mb-1">
              {maxUsuarios ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-caption font-semibold text-app-text-muted">Usuários</span>
                    <span className="text-caption font-semibold" style={{ color: barColor }}>
                      {totalUsuarios}/{maxUsuarios}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-app-hover overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      style={{ backgroundColor: barColor }}
                    />
                  </div>
                  <span className="text-small text-app-text-subtle">
                    {Math.round(pct)}% do limite utilizado
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Users size={13} className="text-app-text-subtle shrink-0" />
                  <p className="text-small text-app-text-muted leading-snug">Sem limite de usuários</p>
                </div>
              )}
            </div>
          )}

          {!isPrestador && collapsed && maxUsuarios && (
            <div
              className="md:flex hidden justify-center py-2"
              title={`${totalUsuarios}/${maxUsuarios} usuários`}
            >
              <Users size={19} style={{ color: barColor }} />
            </div>
          )}

          <button
            onClick={logout}
            className={[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-app-text-muted hover:text-app-text hover:bg-app-hover transition-colors',
              collapsed ? 'md:justify-center md:px-2' : '',
            ].join(' ')}
          >
            <SignOut size={19} />
            <span className={collapsed ? 'md:hidden' : ''}>Sair</span>
          </button>
        </div>
      </aside>

      {/* FAB global — oculto em telas de detalhe (cada tela renderiza o seu próprio) */}
      {isPrestador && pathname !== '/novo-reembolso' && !pathname.startsWith('/minha-caixa-de-obra') && !pathname.match(/^\/meus-reembolsos\/.+/) && (
        <Link
          href="/novo-reembolso"
          className="md:hidden fixed bottom-6 right-4 z-30"
        >
          <motion.div
            whileTap={{ scale: 0.92 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/30"
          >
            <Plus size={24} weight="bold" />
          </motion.div>
        </Link>
      )}
    </>
  );
}
