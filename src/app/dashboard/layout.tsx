import type { ReactNode } from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sessionToNavUser } from '@/lib/nav-user';
import { DashboardShell } from '@/views/Dashboard/DashboardShell';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const u = sessionToNavUser(session);
  const serverDisplayName = u?.name?.trim() ? u.name : undefined;

  return <DashboardShell serverDisplayName={serverDisplayName}>{children}</DashboardShell>;
}
