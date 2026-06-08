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

  const [initialPlatformBilling, initialWorkspace] = await Promise.all([
    u?.role === 'business' && u.id ? getSubscriptionSummaryForOwnerUserId(u.id) : Promise.resolve(null),
    isDashboardActor
      ? getDashboardWorkspaceData({ id: u.id, role: u.role as Role })
      : Promise.resolve(null),
  ]);

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
