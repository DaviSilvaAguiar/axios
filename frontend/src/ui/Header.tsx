'use client';

import { useState, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, List } from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSidebar } from '@/contexts/SidebarContext';
import OffCanvasMenu from '@/ui/OffCanvasMenu';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return (parts[0][0] ?? '?').toUpperCase();
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase() || '?';
}

function buildGreeting(name: string, hour: number): string {
  const prefix = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = name.trim().split(' ')[0] || 'there';
  return `${prefix}, ${firstName}!`;
}

const ROLE_LABEL: Record<number, string> = {
  1: 'Administrator',
  2: 'Manager',
  3: 'Provider',
};

export default function Header() {
  const { user, tenant } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { setOpen } = useSidebar();

  const [menuOpen, setMenuOpen] = useState(false);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const localHour = mounted ? new Date().getHours() : null;

  const initials = user ? getInitials(user.name) : '?';
  const company = tenant?.trade_name ?? tenant?.legal_name ?? '';
  const roleLabel = user ? (ROLE_LABEL[user.role] ?? null) : null;
  const greetingText = user && localHour !== null ? buildGreeting(user.name, localHour) : '';

  return (
    <>
      <header className="mx-3 mt-3 flex items-center justify-between px-5 py-3.5 rounded-2xl bg-app-surface border border-app-border shadow-[0_4px_32px_rgba(0,0,0,0.10)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="md:hidden text-app-text-muted hover:text-app-text transition-colors"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <List size={22} />
          </button>

          {user && (
            <motion.div
              className="flex flex-col gap-0.5"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <span className="text-sm font-semibold text-app-text leading-none">
                {greetingText}
              </span>
              <motion.div
                className="hidden md:flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.22, delay: 0.12, ease: 'easeOut' }}
              >
                {company && (
                  <span className="text-[11px] text-app-text-subtle leading-none">
                    {company}
                  </span>
                )}
                {roleLabel && (
                  <span className="text-[10px] font-medium text-brand bg-brand/[0.08] px-2 py-0.5 rounded-full leading-none">
                    {roleLabel}
                  </span>
                )}
              </motion.div>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-app-border bg-app-surface-raised text-app-text-muted hover:bg-app-surface-raised-hover transition-colors cursor-pointer"
          >
            {theme === 'light' ? <Moon size={15} weight="bold" /> : <Sun size={15} weight="bold" />}
          </button>

          {user && (
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex items-center gap-3 rounded-full hover:bg-app-hover px-1 py-1 transition-colors cursor-pointer"
              aria-label="Open user menu"
            >
              <span className="hidden sm:block text-sm font-medium text-app-text leading-none">
                {user.name}
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
