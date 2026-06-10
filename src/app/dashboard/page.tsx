import type { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';
import { getSubscriptionSummaryForOwnerUserId } from '@/lib/business-platform-billing';
import { sessionToNavUser } from '@/lib/nav-user';
import DashboardOverviewPageClient from './dashboard-overview-page-client';

export const metadata: Metadata = {
  title: 'Преглед',
};

export default async function DashboardOverviewPage() {
  const session = await getServerSession(authOptions);
  const u = sessionToNavUser(session);

  if (u?.role === 'business' && u.id) {
    const billing = await getSubscriptionSummaryForOwnerUserId(u.id);
    if (billing?.isBlocked) {
      return null;
    }
  }

  return <DashboardOverviewPageClient />;
}
