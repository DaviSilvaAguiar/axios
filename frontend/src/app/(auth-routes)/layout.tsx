"use client";

import AppChrome from '@/ui/AppChrome';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { SettingsModalProvider } from '@/contexts/SettingsModalContext';
import { useUserCount } from '@/features/user/user.hooks';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: userCount = 0 } = useUserCount();

  return (
    <SidebarProvider>
      <SettingsModalProvider>
        <AppChrome userCount={userCount}>{children}</AppChrome>
      </SettingsModalProvider>
    </SidebarProvider>
  );
}
