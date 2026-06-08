'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import type { NavUser } from '@/lib/nav-user';

export function SiteLayoutClient({
  children,
  initialUser,
  topBanner,
}: {
  children: ReactNode;
  initialUser: NavUser | null;
  topBanner: ReactNode;
}) {
  const pathname = usePathname() ?? '';
  const isAdLanding = pathname.startsWith('/studio-offer');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isAdLanding ? <Navigation initialUser={initialUser} /> : null}
      {!isAdLanding ? topBanner : null}

      <main className="flex-1 min-h-0 overflow-x-clip">{children}</main>

      {!isAdLanding ? <Footer /> : null}
    </div>
  );
}
