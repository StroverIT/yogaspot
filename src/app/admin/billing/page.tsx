import type { Metadata } from 'next';

import { getAdminPlatformBillingForList } from '@/lib/admin-queries';
import { AdminPlatformBillingSectionClient } from '@/views/Admin/sections/AdminPlatformBillingSection';

export const metadata: Metadata = {
  title: 'Платформен абонамент',
  description: 'B2B абонаменти и фактури на студиата.',
};

export default async function AdminPlatformBillingPage() {
  const rows = await getAdminPlatformBillingForList();
  return <AdminPlatformBillingSectionClient rows={rows} />;
}
