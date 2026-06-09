'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { TeachingModeDto } from '@/lib/teaching-mode';

export type DashboardSetupGuidePrefs = {
  docked: boolean;
  minimized: boolean;
  onboardingTeachingMode: TeachingModeDto | null;
};

const defaultPrefs: DashboardSetupGuidePrefs = {
  docked: false,
  minimized: false,
  onboardingTeachingMode: null,
};

const legacyStorageKey = (userId: string) => `zenno.dashboardSetupGuide.${userId}`;

async function patchPrefs(
  body: Partial<DashboardSetupGuidePrefs>,
): Promise<DashboardSetupGuidePrefs | null> {
  const res = await fetch('/api/user/dashboard-setup-guide', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    toast.error(j.error ?? 'Неуспешно записване на настройките.');
    return null;
  }
  return (await res.json()) as DashboardSetupGuidePrefs;
}

/** Loads and persists dashboard setup guide UI prefs on the server (Postgres / Supabase DB via Prisma). */
export function useDashboardSetupGuidePrefs(userId: string | undefined) {
  const [prefs, setPrefsState] = useState<DashboardSetupGuidePrefs>(defaultPrefs);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!userId) {
      setPrefsState(defaultPrefs);
      setHydrated(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/user/dashboard-setup-guide');
        if (!res.ok) {
          if (!cancelled) {
            setPrefsState(defaultPrefs);
            setHydrated(true);
          }
          return;
        }
        let data = (await res.json()) as Partial<DashboardSetupGuidePrefs>;
        let docked = Boolean(data.docked);
        let minimized = Boolean(data.minimized);
        const onboardingTeachingMode =
          data.onboardingTeachingMode === 'physical' || data.onboardingTeachingMode === 'online'
            ? data.onboardingTeachingMode
            : null;

        if (!docked && !minimized && typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem(legacyStorageKey(userId));
            if (raw) {
              const p = JSON.parse(raw) as Partial<DashboardSetupGuidePrefs>;
              const ld = Boolean(p.docked);
              const lm = Boolean(p.minimized);
              if (ld || lm) {
                const migrated = await patchPrefs({ docked: ld, minimized: lm });
                if (migrated) {
                  docked = migrated.docked;
                  minimized = migrated.minimized;
                  localStorage.removeItem(legacyStorageKey(userId));
                }
              }
            }
          } catch {
            /* ignore legacy parse */
          }
        }

        if (!cancelled) {
          setPrefsState({ docked, minimized, onboardingTeachingMode });
        }
      } catch {
        if (!cancelled) {
          setPrefsState(defaultPrefs);
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const setPrefs = useCallback(
    (next: DashboardSetupGuidePrefs | ((prev: DashboardSetupGuidePrefs) => DashboardSetupGuidePrefs)) => {
      setPrefsState(prev => {
        const resolved =
          typeof next === 'function'
            ? (next as (p: DashboardSetupGuidePrefs) => DashboardSetupGuidePrefs)(prev)
            : next;
        const previous = prev;

        if (!userId) {
          return resolved;
        }

        void (async () => {
          const saved = await patchPrefs(resolved);
          if (saved === null) {
            setPrefsState(previous);
            return;
          }
          setPrefsState(saved);
        })();

        return resolved;
      });
    },
    [userId],
  );

  const setOnboardingTeachingMode = useCallback(
    async (mode: TeachingModeDto): Promise<boolean> => {
      const saved = await patchPrefs({
        onboardingTeachingMode: mode,
        docked: false,
        minimized: false,
      });
      if (saved === null) return false;
      setPrefsState(saved);
      return true;
    },
    [],
  );

  return { prefs, setPrefs, setOnboardingTeachingMode, hydrated };
}
