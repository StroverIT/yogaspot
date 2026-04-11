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

      <main className="flex-1 p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto">{children}</main>
    </div>
  );
}
