'use client';

import { createContext, useContext, type ReactNode } from 'react';

import {
  useDashboardSetupGuidePrefs,
  type DashboardSetupGuidePrefs,
} from '@/hooks/useDashboardSetupGuidePrefs';
import type { TeachingModeDto } from '@/lib/teaching-mode';

type DashboardOnboardingContextValue = {
  prefs: DashboardSetupGuidePrefs;
  setPrefs: ReturnType<typeof useDashboardSetupGuidePrefs>['setPrefs'];
  setOnboardingTeachingMode: (mode: TeachingModeDto) => Promise<boolean>;
  hydrated: boolean;
};

const DashboardOnboardingContext = createContext<DashboardOnboardingContextValue | null>(null);

export function DashboardOnboardingProvider({
  userId,
  children,
}: {
  userId: string | undefined;
  children: ReactNode;
}) {
  const { prefs, setPrefs, setOnboardingTeachingMode, hydrated } = useDashboardSetupGuidePrefs(userId);

  return (
    <DashboardOnboardingContext.Provider value={{ prefs, setPrefs, setOnboardingTeachingMode, hydrated }}>
      {children}
    </DashboardOnboardingContext.Provider>
  );
}

export function useDashboardOnboarding() {
  const ctx = useContext(DashboardOnboardingContext);
  if (!ctx) {
    throw new Error('useDashboardOnboarding must be used within DashboardOnboardingProvider');
  }
  return ctx;
}
