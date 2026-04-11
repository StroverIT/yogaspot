'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Heart, User } from 'lucide-react';
import { mockClasses } from '@/data/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { ProfileHero } from '@/components/profile/profile-hero';
import { mockAttendedClasses } from '@/components/profile/profile-mock-data';
import type { NavUser } from '@/lib/nav-user';
import { cn } from '@/lib/utils';

function profileNavLinkClass(active: boolean) {
  return cn(
    'inline-flex flex-1 sm:flex-none items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
  );
}

export default function ProfileShell({
  children,
  serverUser,
}: {
  children: React.ReactNode;
  serverUser: NavUser;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { favoriteIds } = useFavorites();

  const displayName = user?.name?.trim() || serverUser.name || 'Гост потребител';
  const displayEmail = user?.email?.trim() || serverUser.email || 'guest@Zenno.bg';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  const attendedClasses = mockAttendedClasses;
  const totalClasses = attendedClasses.length;
  const uniqueStudios = new Set(
    attendedClasses
      .map((a) => {
        const cls = mockClasses.find((c) => c.id === a.classId);
        return cls?.studioId;
      })
      .filter(Boolean),
  ).size;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ProfileHero
        displayName={displayName}
        displayEmail={displayEmail}
        initials={initials}
        totalClasses={totalClasses}
        uniqueStudios={uniqueStudios}
        favoriteCount={favoriteIds.length}
      />

      <div className="space-y-6">
        <nav
          className="inline-flex h-auto min-h-10 w-full flex-wrap items-center justify-center gap-1 rounded-md bg-muted p-1 text-muted-foreground sm:h-10 sm:w-auto sm:flex-nowrap"
          aria-label="Профил"
        >
          <Link
            href="/profile/history"
            className={cn(profileNavLinkClass(pathname === '/profile/history'))}
          >
            <Calendar className="h-4 w-4" />
            Посетени класове
          </Link>
          <Link
            href="/profile/favorites"
            className={cn(profileNavLinkClass(pathname === '/profile/favorites'))}
          >
            <Heart className="h-4 w-4" />
            Любими ({favoriteIds.length})
          </Link>
          <Link
            href="/profile/settings"
            className={cn(profileNavLinkClass(pathname === '/profile/settings'))}
          >
            <User className="h-4 w-4" />
            Настройки
          </Link>
        </nav>

        {children}
      </div>
    </div>
  );
}
