'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

import { getActiveSection } from './dashboardTypes';
import { DashboardSidebar } from './components/DashboardSidebar';
import { DashboardMobileNav } from './components/DashboardMobileNav';
import { getDashboardMockData } from './dashboardMockData';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { revenue } = getDashboardMockData();
  const activeSection = getActiveSection(pathname);
  const displayName = user?.name || 'Бизнес потребител';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      <DashboardSidebar displayName={displayName} activeSection={activeSection} revenue={revenue} />

      <DashboardMobileNav activeSection={activeSection} />

      <main className="flex-1 overflow-y-auto bg-linear-to-br from-background via-card/40 to-muted/15 p-6 pb-24 lg:p-8 lg:pb-8">
        {children}
      </main>
    </div>
  );
}
