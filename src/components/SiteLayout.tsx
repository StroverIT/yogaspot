import type { ReactNode } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import type { NavUser } from '@/lib/nav-user';

export default function SiteLayout({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: NavUser | null;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation initialUser={initialUser} />

      <main className="flex-1 min-h-0 overflow-x-clip">{children}</main>

      <Footer />
    </div>
  );
}
