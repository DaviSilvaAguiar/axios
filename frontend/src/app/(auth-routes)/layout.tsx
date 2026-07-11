import AppChrome from '@/ui/AppChrome';
import { SidebarProvider } from '@/contexts/SidebarContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppChrome>{children}</AppChrome>
    </SidebarProvider>
  );
}
