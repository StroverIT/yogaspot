import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SiteTopBanner from '@/components/SiteTopBanner';
import type { NavUser } from '@/lib/nav-user';

export default async function SiteLayout({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: NavUser | null;
}) {
  const pathname = (await headers()).get('x-pathname') ?? '';
  const isAdLanding = pathname.startsWith('/studio-offer');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isAdLanding ? <Navigation initialUser={initialUser} /> : null}
      {!isAdLanding ? <SiteTopBanner /> : null}

      <main className="flex-1 min-h-0 overflow-x-clip">{children}</main>

      {!isAdLanding ? <Footer /> : null}
    </div>
  );
}
