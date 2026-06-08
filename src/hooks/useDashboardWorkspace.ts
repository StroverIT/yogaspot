'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DashboardWorkspaceData } from '@/lib/dashboard-workspace-data';
import { emptyDashboardBookingRevenue } from '@/lib/dashboard-booking-revenue';
import { parseOnlinePaymentsFlag } from '@/lib/payment-settings';

export function useDashboardWorkspace(initialWorkspace?: DashboardWorkspaceData | null) {
  const hasInitialData = initialWorkspace !== undefined;
  const [data, setData] = useState<DashboardWorkspaceData | null>(initialWorkspace ?? null);
  const [loading, setLoading] = useState(!hasInitialData);
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef<DashboardWorkspaceData | null>(null);
  dataRef.current = data;

  const reload = useCallback(async () => {
    const isFirstLoad = dataRef.current === null;
    if (isFirstLoad) setLoading(true);
    setError(null);
    try {
      const workspaceRes = await fetch('/api/dashboard/workspace', { cache: 'no-store' });
      if (!workspaceRes.ok) {
        const j = await workspaceRes.json().catch(() => ({}));
        setError((j as { error?: string }).error ?? `HTTP ${workspaceRes.status}`);
        setData(null);
        return;
      }
      const json = (await workspaceRes.json()) as DashboardWorkspaceData;
      setData({
        ...json,
        bookingRevenue: json.bookingRevenue ?? emptyDashboardBookingRevenue,
        onlinePayments: parseOnlinePaymentsFlag(json.onlinePayments),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasInitialData) return;
    void reload();
  }, [hasInitialData, reload]);

  return {
    studios: data?.studios ?? [],
    instructors: data?.instructors ?? [],
    classes: data?.classes ?? [],
    retreats: data?.retreats ?? [],
    schedule: data?.schedule ?? [],
    subscriptions: data?.subscriptions ?? [],
    subscriptionRequests: data?.subscriptionRequests ?? [],
    recentSignups: data?.recentSignups ?? [],
    bookingRevenue: data?.bookingRevenue ?? emptyDashboardBookingRevenue,
    onlinePayments: data?.onlinePayments ?? true,
    platformBilling: data?.platformBilling ?? null,
    loading,
    error,
    reload,
  };
}
