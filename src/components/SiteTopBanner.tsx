import { headers } from 'next/headers';
import BusinessOfferBanner from '@/components/BusinessOfferBanner';
import DashboardPlatformBillingBanner from '@/components/DashboardPlatformBillingBanner';

export default async function SiteTopBanner() {
  const pathname = (await headers()).get('x-pathname') ?? '';

  if (pathname.startsWith('/dashboard')) {
    return <DashboardPlatformBillingBanner />;
  }

  return <BusinessOfferBanner />;
}
