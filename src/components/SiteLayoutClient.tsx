'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { DashboardTrialTopBanner } from '@/components/DashboardTrialTopBanner';
import { SiteOfferBanner } from '@/components/SiteOfferBanner';
import type { PlatformBillingSummary } from '@/lib/business-platform-billing';
import type { NavUser } from '@/lib/nav-user';

export function SiteLayoutClient({
  children,
  initialUser,
  siteOfferMessage,
  initialPlatformBilling,
}: {
  children: ReactNode;
  initialUser: NavUser | null;
  siteOfferMessage: string;
  initialPlatformBilling: PlatformBillingSummary | null;
}) {
  const pathname = usePathname() ?? '';
  const isAdLanding = pathname.startsWith('/studio-offer');
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isAdLanding ? <Navigation initialUser={initialUser} /> : null}
      {!isAdLanding ? (
        isDashboard ? (
          <DashboardTrialTopBanner billing={initialPlatformBilling} />
        ) : (
          <SiteOfferBanner message={siteOfferMessage} />
        )
      ) : null}

      <main className="flex-1 min-h-0 overflow-x-clip">{children}</main>

      {!isAdLanding ? <Footer /> : null}
    </div>
  );
}
