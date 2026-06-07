'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  Instructor,
  Retreat,
  ScheduleEntry,
  Studio,
  StudioSubscription,
  SubscriptionRequestDto,
  YogaClass,
} from '@/data/mock-data';
import type { DashboardBookingRevenue } from '@/lib/dashboard-booking-revenue';
import { emptyDashboardBookingRevenue } from '@/lib/dashboard-booking-revenue';
import type { DashboardRecentSignup } from '@/lib/dashboard-recent-signups';
import type { PlatformBillingSummary } from '@/lib/business-platform-billing';
import { parseOnlinePaymentsFlag } from '@/lib/payment-settings';

type WorkspacePayload = {
  studios: Studio[];
  instructors: Instructor[];
  classes: YogaClass[];
  retreats: Retreat[];
  schedule: ScheduleEntry[];
  subscriptions: StudioSubscription[];
  subscriptionRequests: SubscriptionRequestDto[];
  recentSignups: DashboardRecentSignup[];
  bookingRevenue: DashboardBookingRevenue;
  onlinePayments?: boolean;
  platformBilling?: PlatformBillingSummary | null;
};

export function useDashboardWorkspace() {
  const [data, setData] = useState<WorkspacePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef<WorkspacePayload | null>(null);
  dataRef.current = data;

  const reload = useCallback(async () => {
    const isFirstLoad = dataRef.current === null;
    if (isFirstLoad) setLoading(true);
    setError(null);
    try {
      const [workspaceRes, settingsRes] = await Promise.all([
        fetch('/api/dashboard/workspace', { cache: 'no-store' }),
        fetch('/api/public/payment-settings', { cache: 'no-store' }),
      ]);
      if (!workspaceRes.ok) {
        const j = await workspaceRes.json().catch(() => ({}));
        setError((j as { error?: string }).error ?? `HTTP ${workspaceRes.status}`);
        setData(null);
        return;
      }
      const json = (await workspaceRes.json()) as WorkspacePayload;
      const bookingRevenue = json.bookingRevenue ?? emptyDashboardBookingRevenue;
      let onlinePayments = parseOnlinePaymentsFlag(json.onlinePayments);
      if (settingsRes.ok) {
        const s = (await settingsRes.json().catch(() => ({}))) as { onlinePayments?: unknown };
        onlinePayments = parseOnlinePaymentsFlag(s.onlinePayments);
      }
      setData({ ...json, bookingRevenue, onlinePayments });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

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
