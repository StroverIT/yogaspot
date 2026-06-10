'use client';

import { deriveDashboardMetrics } from '@/views/Dashboard/dashboardMockData';
import { SubscriptionsSection } from '@/views/Dashboard/components/SubscriptionsSection';
import { useDashboardWorkspaceContext } from '@/contexts/DashboardWorkspaceContext';

export default function DashboardSubscriptionsPage() {
  const ws = useDashboardWorkspaceContext();
  const { myStudios } = deriveDashboardMetrics(ws.studios, ws.classes, ws.instructors);

  if (ws.loading) return <div className="text-muted-foreground">Зареждане…</div>;
  if (ws.error) return <div className="text-destructive">{ws.error}</div>;

  return (
    <SubscriptionsSection
      studios={myStudios}
      subscriptions={ws.subscriptions}
      onlinePayments={ws.onlinePayments}
      platformBilling={ws.platformBilling}
      onWorkspaceReload={() => void ws.reload()}
    />
  );
}
