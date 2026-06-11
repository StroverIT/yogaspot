'use client';

import { useMemo } from 'react';
import { useDashboardWorkspaceContext } from '@/contexts/DashboardWorkspaceContext';
import { deriveDashboardMetrics } from '@/views/Dashboard/dashboardMockData';
import { FitsysSyncSection } from '@/views/Dashboard/components/FitsysSyncSection';

export default function DashboardFitsysPage() {
  const ws = useDashboardWorkspaceContext();
  const { myStudios } = deriveDashboardMetrics(ws.studios, ws.classes, ws.instructors);

  const studios = useMemo(() => myStudios, [myStudios]);

  if (ws.loading) return <div className="text-muted-foreground">Зареждане…</div>;
  if (ws.error) return <div className="text-destructive">{ws.error}</div>;

  return <FitsysSyncSection studios={studios} />;
}
