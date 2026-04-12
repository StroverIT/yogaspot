'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { Calendar, Heart, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useProfileHistory } from '@/hooks/useProfileHistory';
import { ProfileHero } from '@/components/profile/profile-hero';
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
  const { data: historyData, isPending: historyPending, isError: historyError } = useProfileHistory();

  const displayName = user?.name?.trim() || serverUser.name || 'Гост потребител';
  const displayEmail = user?.email?.trim() || serverUser.email || 'guest@Zenno.bg';
  const avatarUrl =
    (typeof user?.image === 'string' && user.image.trim()) ||
    (typeof serverUser.image === 'string' && serverUser.image.trim()) ||
    null;
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  const totalClasses = useMemo(() => {
    if (historyPending || historyError) return undefined;
    return historyData?.attendedClasses.length ?? 0;
  }, [historyData?.attendedClasses.length, historyError, historyPending]);

  const uniqueStudios = useMemo(() => {
    if (historyPending || historyError || !historyData) return undefined;
    const classById = new Map(historyData.classes.map((c) => [c.id, c]));
    const studioIds = historyData.attendedClasses
      .map((a) => classById.get(a.classId)?.studioId)
      .filter(Boolean) as string[];
    return new Set(studioIds).size;
  }, [historyData, historyError, historyPending]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ProfileHero
        displayName={displayName}
        displayEmail={displayEmail}
        initials={initials}
        avatarUrl={avatarUrl}
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
