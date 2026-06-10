import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import type { Role } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sessionToNavUser } from '@/lib/nav-user';
import { getSubscriptionSummaryForOwnerUserId } from '@/lib/business-platform-billing';
import { getDashboardWorkspaceData } from '@/lib/dashboard-workspace-data';
import { DashboardShell } from '@/views/Dashboard/DashboardShell';
import { privateAreaRobots } from '@/lib/site';

export const metadata: Metadata = {
  title: {
    default: 'Табло',
    template: '%s | Табло',
  },
  description: 'Управление на студиа, класове, инструктори и разписание.',
  robots: privateAreaRobots,
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const u = sessionToNavUser(session);
  const serverDisplayName = u?.name?.trim() ? u.name : undefined;

  const isDashboardActor =
    u?.id && (u.role === 'business' || u.role === 'admin');

  const initialPlatformBilling =
    u?.role === 'business' && u.id ? await getSubscriptionSummaryForOwnerUserId(u.id) : null;

  const initialWorkspace =
    isDashboardActor && !initialPlatformBilling?.isBlocked
      ? await getDashboardWorkspaceData({ id: u.id, role: u.role as Role })
      : null;

  return (
    <DashboardShell
      serverDisplayName={serverDisplayName}
      initialPlatformBilling={initialPlatformBilling}
      initialWorkspace={initialWorkspace}
    >
      {children}
    </DashboardShell>
  );
}
