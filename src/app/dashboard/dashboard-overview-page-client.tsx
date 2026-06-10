'use client';

import { Suspense, useState, type ReactNode } from 'react';
import { BusinessDashboardMetaPixelTracker } from '@/components/analytics/BusinessDashboardMetaPixelTracker';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardOnboarding } from '@/contexts/DashboardOnboardingContext';
import { OverviewSection } from '@/views/Dashboard/components/OverviewSection';
import { DashboardTeachingModeOnboardingModal } from '@/views/Dashboard/components/DashboardTeachingModeOnboardingModal';
import { deriveDashboardMetrics } from '@/views/Dashboard/dashboardMockData';
import { useDashboardWorkspaceContext } from '@/contexts/DashboardWorkspaceContext';

export default function DashboardOverviewPageClient() {
  const { user } = useAuth();
  const ws = useDashboardWorkspaceContext();
  const { prefs, setOnboardingTeachingMode, hydrated } = useDashboardOnboarding();
  const [savingMode, setSavingMode] = useState(false);

  const {
    avgRating,
    totalEnrolled,
    totalCapacity,
    occupancyRate,
    myStudios,
    myClasses,
    myInstructors,
  } = deriveDashboardMetrics(ws.studios, ws.classes, ws.instructors);

  const isBusiness = user?.role === 'business';
  const showTeachingModeModal =
    isBusiness && hydrated && !ws.loading && !ws.error && prefs.onboardingTeachingMode === null;

  let content: ReactNode;

  if (ws.loading) {
    content = <div className="text-muted-foreground">Зареждане…</div>;
  } else if (ws.error) {
    content = <div className="text-destructive">{ws.error}</div>;
  } else {
    content = (
      <OverviewSection
        avgRating={avgRating}
        totalEnrolled={totalEnrolled}
        totalCapacity={totalCapacity}
        occupancyRate={occupancyRate}
        myStudios={myStudios}
        myClasses={myClasses}
        myInstructors={myInstructors}
        bookingRevenue={ws.bookingRevenue}
        subscriptions={ws.subscriptions}
        recentSignups={ws.recentSignups}
      />
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <BusinessDashboardMetaPixelTracker />
      </Suspense>
      {content}
      <DashboardTeachingModeOnboardingModal
        open={showTeachingModeModal}
        saving={savingMode}
        onChoose={async mode => {
          setSavingMode(true);
          try {
            await setOnboardingTeachingMode(mode);
          } finally {
            setSavingMode(false);
          }
        }}
      />
    </>
  );
}
