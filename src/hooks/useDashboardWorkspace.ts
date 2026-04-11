'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Instructor, ScheduleEntry, Studio, StudioSubscription, YogaClass } from '@/data/mock-data';

type WorkspacePayload = {
  studios: Studio[];
  instructors: Instructor[];
  classes: YogaClass[];
  schedule: ScheduleEntry[];
  subscriptions: StudioSubscription[];
};

export function useDashboardWorkspace() {
  const [data, setData] = useState<WorkspacePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
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
    loading,
    error,
    reload,
  };
}
