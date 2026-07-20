'use client';

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

const navItemsAdmin = [
  { href: '/dashboard', label: 'Home', icon: HouseLine },
  { href: '/overview', label: 'Dashboard', icon: ChartBar },
  { href: '/expense-reports', label: 'Expense Reports', icon: Receipt, modulo: 'rdc' },
  { href: '/funds', label: 'Fund Management', icon: Wallet, modulo: 'expense-reports' },
  { href: '/reimbursements', label: 'Reimbursement', icon: ArrowUUpLeft, modulo: 'reimbursement' },
  { href: '/export', label: 'ERP Export', icon: DownloadSimple, modulo: 'export' },
  { href: '/cost-centers', label: 'Cost Centers', icon: Buildings, modulo: 'cost-center' },
  { href: '/expense-categories', label: 'Categories', icon: Tag, modulo: 'expense-category' },
  { href: '/bank-accounts', label: 'Bank Accounts', icon: Bank, modulo: 'bank-account' },
  { href: '/suppliers', label: 'Suppliers', icon: Storefront, modulo: 'supplier' },
];

const navItemsProvider = [
  { href: '/dashboard', label: 'Home', icon: HouseLine },
  { href: '/my-submissions', label: 'My entries', icon: Receipt },
];

export default function Sidebar({ userCount = 0 }: { userCount?: number }) {
  const { open, setOpen, collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();
  const { logout, tenant, user, enabledModules } = useAuth();

  const baseNavItems = user?.role === 3 ? navItemsProvider : navItemsAdmin;
  const navItems = baseNavItems.filter(
    (item) => !('modulo' in item) || enabledModules.includes(item.modulo as string)
  );
  const isProvider = user?.role === 3;

  const maxUsers = tenant?.max_users ?? null;
  const pct = maxUsers ? Math.min((userCount / maxUsers) * 100, 100) : 0;
  const barColor = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#0052ff';

  const close = () => setOpen(false);
  const toggleCollapsed = () => setCollapsed(!collapsed);

  return (
    <>
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={close}
        />
      )}

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

          <button
            className="hidden md:flex items-center justify-center text-app-text-muted hover:text-app-text transition-colors rounded-lg p-0.5 cursor-pointer"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
          >
            {collapsed ? <ArrowLineRight size={18} /> : <ArrowLineLeft size={18} />}
          </button>

          <button
            className="md:hidden text-app-text-muted hover:text-app-text transition-colors"
            onClick={close}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

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

        {isProvider && (
          <div className="px-3 pb-3">
            <Link
              href="/new-reimbursement"
              onClick={close}
              className={[
                'flex items-center gap-2.5 rounded-xl bg-brand text-white px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-[#578bfa]',
                collapsed ? 'md:justify-center md:px-2' : '',
              ].join(' ')}
            >
              <Plus size={17} weight="bold" />
              <span className={collapsed ? 'md:hidden' : ''}>New Request</span>
            </Link>
          </div>
        )}

        <div className="px-3 pb-4 border-t border-app-border-subtle pt-3 space-y-0.5">
          {!isProvider && !collapsed && (
            <div className="px-3 py-2.5 mb-1">
              {maxUsers ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-caption font-semibold text-app-text-muted">Users</span>
                    <span className="text-caption font-semibold" style={{ color: barColor }}>
                      {userCount}/{maxUsers}
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
                    {Math.round(pct)}% of limit used
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Users size={13} className="text-app-text-subtle shrink-0" />
                  <p className="text-small text-app-text-muted leading-snug">No user limit</p>
                </div>
              )}
            </div>
          )}

          {!isProvider && collapsed && maxUsers && (
            <div
              className="md:flex hidden justify-center py-2"
              title={`${userCount}/${maxUsers} users`}
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
            <span className={collapsed ? 'md:hidden' : ''}>Sign out</span>
          </button>
        </div>
      </aside>

      {isProvider && pathname !== '/new-reimbursement' && !pathname.startsWith('/my-expense-reports') && !pathname.match(/^\/my-reimbursements\/.+/) && (
        <Link
          href="/new-reimbursement"
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
