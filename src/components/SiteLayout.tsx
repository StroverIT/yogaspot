import type { ReactNode } from 'react';
import SiteTopBanner from '@/components/SiteTopBanner';
import type { NavUser } from '@/lib/nav-user';
import { SiteLayoutClient } from './SiteLayoutClient';

export default async function SiteLayout({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: NavUser | null;
}) {
  return (
    <SiteLayoutClient initialUser={initialUser} topBanner={<SiteTopBanner />}>
      {children}
    </SiteLayoutClient>
  );
}
