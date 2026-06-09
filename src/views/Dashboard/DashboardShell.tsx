'use client';

import { useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardWorkspaceProvider, useDashboardWorkspaceContext } from '@/contexts/DashboardWorkspaceContext';
import { DashboardOnboardingProvider, useDashboardOnboarding } from '@/contexts/DashboardOnboardingContext';
import { usePathname } from 'next/navigation';

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
import {
  getOnboardingDoneCount,
  getOnboardingTaskTotal,
  getOnboardingSectionHints,
  isOnboardingComplete,
} from '@/lib/dashboard-onboarding';

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
  const { prefs, setPrefs, hydrated } = useDashboardOnboarding();
  const eventsAndScheduleIncomeBgn = ws.bookingRevenue.totalBgn;
  const activeSection = getActiveSection(pathname);
  const displayName = user?.name?.trim() || serverDisplayName || 'Бизнес потребител';

  const isBusiness = user?.role === 'business';

  const studiosCount = ws.studios.length;
  const instructorsCount = ws.instructors.length;
  const classesCount = ws.classes.length;
  const scheduleCount = ws.schedule.length;

  const counts = useMemo(
    () => ({ studiosCount, instructorsCount, classesCount, scheduleCount }),
    [studiosCount, instructorsCount, classesCount, scheduleCount],
  );

  const onboardingTeachingMode = prefs.onboardingTeachingMode;
  const hasChosenTeachingMode = onboardingTeachingMode !== null;

  const setupComplete = useMemo(() => {
    if (!hasChosenTeachingMode) return false;
    return isOnboardingComplete(onboardingTeachingMode, counts);
  }, [hasChosenTeachingMode, onboardingTeachingMode, counts]);

  const taskTotal = hasChosenTeachingMode ? getOnboardingTaskTotal(onboardingTeachingMode) : 4;

  const doneCount = useMemo(() => {
    if (!hasChosenTeachingMode) return 0;
    return getOnboardingDoneCount(onboardingTeachingMode, counts);
  }, [hasChosenTeachingMode, onboardingTeachingMode, counts]);

  const showSetupFlow = isBusiness && hasChosenTeachingMode && !setupComplete;

  const setupSectionHints = useMemo((): Partial<Record<Section, boolean>> | undefined => {
    if (!showSetupFlow || !onboardingTeachingMode) return undefined;
    return getOnboardingSectionHints(onboardingTeachingMode, counts);
  }, [showSetupFlow, onboardingTeachingMode, counts]);

  const openGuideFromMenu = useCallback(() => {
    setPrefs({ ...prefs, docked: false, minimized: false });
  }, [setPrefs, prefs]);

  const setupGuideSidebar =
    showSetupFlow && prefs.docked && hydrated ? (
      <DashboardSetupGuideSidebarNav doneCount={doneCount} taskTotal={taskTotal} onOpen={openGuideFromMenu} />
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
          taskTotal={taskTotal}
          onOpen={openGuideFromMenu}
        />

        {onboardingTeachingMode ? (
          <DashboardSetupGuide
            visible={showSetupFlow}
            loading={ws.loading}
            onboardingTeachingMode={onboardingTeachingMode}
            counts={counts}
            prefs={prefs}
            setPrefs={setPrefs}
            hydrated={hydrated}
          />
        ) : null}

        {isBusiness && platformBilling?.isBlocked ? (
          <PlatformBlockedOverlay billing={platformBilling} />
        ) : null}
      </div>
    </div>
  );
}

function DashboardShellWithOnboarding({
  children,
  serverDisplayName,
  initialPlatformBilling,
}: {
  children: React.ReactNode;
  serverDisplayName?: string;
  initialPlatformBilling?: PlatformBillingSummary | null;
}) {
  const { user } = useAuth();
  const userId = user?.role === 'business' ? user.id : undefined;

  return (
    <DashboardOnboardingProvider userId={userId}>
      <DashboardShellInner serverDisplayName={serverDisplayName} initialPlatformBilling={initialPlatformBilling}>
        {children}
      </DashboardShellInner>
    </DashboardOnboardingProvider>
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
      <DashboardShellWithOnboarding
        serverDisplayName={serverDisplayName}
        initialPlatformBilling={initialPlatformBilling}
      >
        {children}
      </DashboardShellWithOnboarding>
    </DashboardWorkspaceProvider>
  );
}
