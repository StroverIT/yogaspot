import type { Metadata } from 'next';
import { getAdminAnalytics } from '@/lib/admin-analytics';
import { AdminAnalyticsDashboard } from '@/views/Admin/sections/AdminAnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'Marketplace analytics and growth metrics.',
};

export default async function AdminIndexPage() {
  const analytics = await getAdminAnalytics();
  return <AdminAnalyticsDashboard analytics={analytics} />;
}
