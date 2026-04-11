'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

import { getActiveSection } from './dashboardTypes';
import { DashboardSidebar } from './components/DashboardSidebar';
import { DashboardMobileNav } from './components/DashboardMobileNav';
import { deriveDashboardMetrics } from './dashboardMockData';
import { useDashboardWorkspace } from '@/hooks/useDashboardWorkspace';

export function DashboardShell({
  children,
  serverDisplayName,
}: {
  children: React.ReactNode;
  /** From server layout; avoids empty label before client session hydrates. */
  serverDisplayName?: string;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const ws = useDashboardWorkspace();
  const { revenue } = deriveDashboardMetrics(ws.studios, ws.classes, ws.instructors);
  const activeSection = getActiveSection(pathname);
  const displayName = user?.name?.trim() || serverDisplayName || 'Бизнес потребител';

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
