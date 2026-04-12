'use client';

import { OverviewSection } from '@/views/Dashboard/components/OverviewSection';
import { deriveDashboardMetrics } from '@/views/Dashboard/dashboardMockData';
import { useDashboardWorkspaceContext } from '@/contexts/DashboardWorkspaceContext';

export default function DashboardOverviewPage() {
  const ws = useDashboardWorkspaceContext();
  const {
    avgRating,
    totalEnrolled,
    totalCapacity,
    occupancyRate,
    myStudios,
    myClasses,
    myInstructors,
    revenue,
  } = deriveDashboardMetrics(ws.studios, ws.classes, ws.instructors);

  if (ws.loading) {
    return <div className="text-muted-foreground">Зареждане…</div>;
  }
  if (ws.error) {
    return <div className="text-destructive">{ws.error}</div>;
  }

    return (
    <OverviewSection
      avgRating={avgRating}
      totalEnrolled={totalEnrolled}
      totalCapacity={totalCapacity}
      occupancyRate={occupancyRate}
      myStudios={myStudios}
      myClasses={myClasses}
      myInstructors={myInstructors}
      revenue={revenue}
      subscriptions={ws.subscriptions}
      subscriptionRequests={ws.subscriptionRequests}
      recentSignups={ws.recentSignups}
    />
  );
}
