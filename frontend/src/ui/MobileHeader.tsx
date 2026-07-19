"use client";

import { Moon, Sun, SignOut } from "@phosphor-icons/react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function MobileHeader() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="md:hidden sticky top-0 z-30 bg-app-surface border-b border-app-border-subtle h-14 px-4 flex items-center justify-between">
      <span className="text-feature-title font-semibold text-app-text tracking-tight">
        Axios
      </span>
      <div className="flex items-center gap-1 -mr-3">
        <button
          onClick={toggleTheme}
          aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          className="flex items-center justify-center h-11 w-11 text-app-text-muted hover:text-app-text"
        >
          {theme === "light" ? <Moon size={20} weight="bold" /> : <Sun size={20} weight="bold" />}
        </button>
        <button
          onClick={() => { void logout(); }}
          aria-label="Sign out"
          className="flex items-center justify-center h-11 w-11 text-app-text-muted hover:text-app-text"
        >
          <SignOut size={20} />
        </button>
      </div>
    </header>
  );
}
