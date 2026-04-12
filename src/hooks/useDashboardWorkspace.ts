'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  Instructor,
  ScheduleEntry,
  Studio,
  StudioSubscription,
  SubscriptionRequestDto,
  YogaClass,
} from '@/data/mock-data';
import type { DashboardRecentSignup } from '@/lib/dashboard-recent-signups';

type WorkspacePayload = {
  studios: Studio[];
  instructors: Instructor[];
  classes: YogaClass[];
  schedule: ScheduleEntry[];
  subscriptions: StudioSubscription[];
  subscriptionRequests: SubscriptionRequestDto[];
  recentSignups: DashboardRecentSignup[];
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
      const res = await fetch('/api/dashboard/workspace');
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError((j as { error?: string }).error ?? `HTTP ${res.status}`);
        setData(null);
        return;
      }
      const json = (await res.json()) as WorkspacePayload;
      setData(json);
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
    schedule: data?.schedule ?? [],
    subscriptions: data?.subscriptions ?? [],
    subscriptionRequests: data?.subscriptionRequests ?? [],
    recentSignups: data?.recentSignups ?? [],
    loading,
    error,
    reload,
  };
}
