'use client';

import { Suspense, type ReactNode } from 'react';
import { BusinessDashboardMetaPixelTracker } from '@/components/analytics/BusinessDashboardMetaPixelTracker';
import { OverviewSection } from '@/views/Dashboard/components/OverviewSection';
import { deriveDashboardMetrics } from '@/views/Dashboard/dashboardMockData';
import { useDashboardWorkspaceContext } from '@/contexts/DashboardWorkspaceContext';

export default function DashboardOverviewPageClient() {
  const ws = useDashboardWorkspaceContext();
  const {
    avgRating,
    totalEnrolled,
    totalCapacity,
    occupancyRate,
    myStudios,
    myClasses,
    myInstructors,
  } = deriveDashboardMetrics(ws.studios, ws.classes, ws.instructors);

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
        subscriptionRequests={ws.subscriptionRequests}
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
    </>
  );
}
