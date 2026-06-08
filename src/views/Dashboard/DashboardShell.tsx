'use client';

import { useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardWorkspaceProvider, useDashboardWorkspaceContext } from '@/contexts/DashboardWorkspaceContext';
import { usePathname } from 'next/navigation';

import { useDashboardSetupGuidePrefs } from '@/hooks/useDashboardSetupGuidePrefs';
import { getActiveSection, type Section } from './dashboardTypes';
import { DashboardSidebar } from './components/DashboardSidebar';
import { DashboardMobileNav } from './components/DashboardMobileNav';
import {
  DashboardSetupGuide,
  DashboardSetupGuideMobileDock,
  DashboardSetupGuideSidebarNav,
} from './components/DashboardSetupGuide';
import type { PlatformBillingSummary } from '@/lib/business-platform-billing';
import type { DashboardWorkspaceData } from '@/lib/dashboard-workspace-data';
import { PlatformBlockedOverlay } from './components/PlatformBillingBanner';

function DashboardShellInner({
  children,
  serverDisplayName,
  initialPlatformBilling,
}: {
  children: React.ReactNode;
  serverDisplayName?: string;
  initialPlatformBilling?: PlatformBillingSummary | null;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const ws = useDashboardWorkspaceContext();
  const eventsAndScheduleIncomeBgn = ws.bookingRevenue.totalBgn;
  const activeSection = getActiveSection(pathname);
  const displayName = user?.name?.trim() || serverDisplayName || 'Бизнес потребител';

  const isBusiness = user?.role === 'business';
  const userId = user?.id;

  const studiosCount = ws.studios.length;
  const instructorsCount = ws.instructors.length;
  const classesCount = ws.classes.length;
  const scheduleCount = ws.schedule.length;

  const setupComplete = useMemo(
    () => studiosCount >= 1 && instructorsCount >= 1 && classesCount >= 1 && scheduleCount >= 1,
    [studiosCount, instructorsCount, classesCount, scheduleCount],
  );

  const doneCount = useMemo(() => {
    let n = 0;
    if (studiosCount >= 1) n += 1;
    if (instructorsCount >= 1) n += 1;
    if (scheduleCount >= 1) n += 1;
    if (classesCount >= 1) n += 1;
    return n;
  }, [studiosCount, instructorsCount, scheduleCount, classesCount]);

  const { prefs, setPrefs, hydrated } = useDashboardSetupGuidePrefs(isBusiness ? userId : undefined);

  const showSetupFlow = isBusiness && !setupComplete;

  const setupSectionHints = useMemo((): Partial<Record<Section, boolean>> | undefined => {
    if (!showSetupFlow) return undefined;
    return {
      studios: studiosCount < 1,
      instructors: instructorsCount < 1,
      classes: classesCount < 1,
      schedule: scheduleCount < 1,
    };
  }, [showSetupFlow, studiosCount, instructorsCount, classesCount, scheduleCount]);

  const openGuideFromMenu = useCallback(() => {
    setPrefs({ docked: false, minimized: false });
  }, [setPrefs]);

  const setupGuideSidebar =
    showSetupFlow && prefs.docked && hydrated ? (
      <DashboardSetupGuideSidebarNav doneCount={doneCount} onOpen={openGuideFromMenu} />
    ) : null;

  const platformBilling = ws.platformBilling ?? initialPlatformBilling ?? null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="relative flex flex-1 min-h-0">
        <DashboardSidebar
          displayName={displayName}
          activeSection={activeSection}
          revenue={eventsAndScheduleIncomeBgn}
          setupGuide={setupGuideSidebar}
          setupSectionHints={setupSectionHints}
        />

        <DashboardMobileNav activeSection={activeSection} setupSectionHints={setupSectionHints} />

        <main className="flex-1 overflow-y-auto bg-linear-to-br from-background via-card/40 to-muted/15 p-6 pb-24 lg:p-8 lg:pb-8">
          {children}
        </main>

        <DashboardSetupGuideMobileDock
          show={showSetupFlow && prefs.docked && hydrated}
          doneCount={doneCount}
          onOpen={openGuideFromMenu}
        />

        <DashboardSetupGuide
          visible={showSetupFlow}
          loading={ws.loading}
          studiosCount={studiosCount}
          instructorsCount={instructorsCount}
          classesCount={classesCount}
          scheduleCount={scheduleCount}
          prefs={prefs}
          setPrefs={setPrefs}
          hydrated={hydrated}
        />

        {isBusiness && platformBilling?.isBlocked ? (
          <PlatformBlockedOverlay billing={platformBilling} />
        ) : null}
      </div>
    </div>
  );
}

export function DashboardShell({
  children,
  serverDisplayName,
  initialPlatformBilling,
  initialWorkspace,
}: {
  children: React.ReactNode;
  /** From server layout; avoids empty label before client session hydrates. */
  serverDisplayName?: string;
  /** From server layout; shows trial/billing banner before workspace fetch completes. */
  initialPlatformBilling?: PlatformBillingSummary | null;
  /** From server layout; avoids client-side workspace waterfall on first paint. */
  initialWorkspace?: DashboardWorkspaceData | null;
}) {
  return (
    <DashboardWorkspaceProvider initialWorkspace={initialWorkspace}>
      <DashboardShellInner
        serverDisplayName={serverDisplayName}
        initialPlatformBilling={initialPlatformBilling}
      >
        {children}
      </DashboardShellInner>
    </DashboardWorkspaceProvider>
  );
}
