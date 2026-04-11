import { redirect } from 'next/navigation';

import { requireRole } from '@/lib/api-auth';
import { getDashboardStudiosListForUser } from '@/lib/dashboard-studios-data';

import DashboardStudiosPageClient from './studios-page-client';

export default async function DashboardStudiosSection() {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) {
    redirect('/auth');
  }

  const studios = await getDashboardStudiosListForUser(gate.user);

  return <DashboardStudiosPageClient studios={studios} />;
}
