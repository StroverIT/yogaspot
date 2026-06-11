import type { Metadata } from 'next';
import { getAdminAnalytics } from '@/lib/admin-analytics';
import { getAdminFitsysSyncRequestsForList } from '@/lib/admin-queries';
import { AdminAnalyticsDashboard } from '@/views/Admin/sections/AdminAnalyticsDashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'Marketplace analytics and growth metrics.',
};

export default async function AdminIndexPage() {
  const [analytics, fitsysSyncRequests] = await Promise.all([
    getAdminAnalytics(),
    getAdminFitsysSyncRequestsForList(),
  ]);
  return <AdminAnalyticsDashboard analytics={analytics} fitsysSyncRequests={fitsysSyncRequests} />;
}
