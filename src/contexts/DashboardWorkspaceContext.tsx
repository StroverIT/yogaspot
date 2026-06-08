'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { DashboardWorkspaceData } from '@/lib/dashboard-workspace-data';
import { useDashboardWorkspace } from '@/hooks/useDashboardWorkspace';

type DashboardWorkspaceValue = ReturnType<typeof useDashboardWorkspace>;

const DashboardWorkspaceContext = createContext<DashboardWorkspaceValue | null>(null);

/** Single workspace fetch for the whole dashboard (shell + pages share the same data). */
export function DashboardWorkspaceProvider({
  children,
  initialWorkspace,
}: {
  children: ReactNode;
  initialWorkspace?: DashboardWorkspaceData | null;
}) {
  const value = useDashboardWorkspace(initialWorkspace);
  return <DashboardWorkspaceContext.Provider value={value}>{children}</DashboardWorkspaceContext.Provider>;
}

export function useDashboardWorkspaceContext(): DashboardWorkspaceValue {
  const ctx = useContext(DashboardWorkspaceContext);
  if (!ctx) {
    throw new Error('useDashboardWorkspaceContext must be used within DashboardWorkspaceProvider');
  }
  return ctx;
}
