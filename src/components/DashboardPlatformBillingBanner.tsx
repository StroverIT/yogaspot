import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sessionToNavUser } from '@/lib/nav-user';
import { getSubscriptionSummaryForOwnerUserId } from '@/lib/business-platform-billing';
import { PlatformBillingBanner } from '@/views/Dashboard/components/PlatformBillingBanner';

export default async function DashboardPlatformBillingBanner() {
  const session = await getServerSession(authOptions);
  const u = sessionToNavUser(session);
  if (u?.role !== 'business' || !u.id) return null;

  const billing = await getSubscriptionSummaryForOwnerUserId(u.id);
  if (!billing) return null;
  if (!billing.hasSubscription && billing.status !== 'trial') return null;

  return <PlatformBillingBanner billing={billing} />;
}
