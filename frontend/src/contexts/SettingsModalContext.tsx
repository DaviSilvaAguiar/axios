"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import SettingsModal from "@/features/settings/components/SettingsModal";

interface SettingsModalContextValue {
  open: () => void;
}

const SettingsModalContext = createContext<SettingsModalContextValue | null>(null);

export function SettingsModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);

  return (
    <SettingsModalContext.Provider value={{ open }}>
      {children}
      <SettingsModal open={isOpen} onClose={() => setIsOpen(false)} />
    </SettingsModalContext.Provider>
  );
}

export function useSettingsModal(): SettingsModalContextValue {
  const ctx = useContext(SettingsModalContext);
  if (!ctx) throw new Error("useSettingsModal must be used within SettingsModalProvider");
  return ctx;
}
