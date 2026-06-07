'use client';

import { useCallback, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CalendarDays, LocateFixed } from 'lucide-react';
import {
  parseRetreatsSortFromSearchParams,
  parseRetreatsUserLocationFromSearchParams,
  retreatsPathWithQuery,
  stringifyRetreatsQuery,
} from '@/lib/retreats-search-params';

export function RetreatsCatalogToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLocating, setIsLocating] = useState(false);

  const sort = useMemo(
    () => parseRetreatsSortFromSearchParams(searchParams),
    [searchParams],
  );
  const userLocation = useMemo(
    () => parseRetreatsUserLocationFromSearchParams(searchParams),
    [searchParams],
  );

  const replaceSort = useCallback(
    (nextSort: { sortSoon: boolean; sortNear: boolean }, location: { lat: number; lng: number } | null) => {
      const qs = stringifyRetreatsQuery(nextSort, location);
      router.replace(retreatsPathWithQuery(pathname, qs), { scroll: false });
    },
    [pathname, router],
  );

  const toggleSoon = useCallback(() => {
    replaceSort({ ...sort, sortSoon: !sort.sortSoon }, userLocation);
  }, [replaceSort, sort, userLocation]);

  const toggleNear = useCallback(() => {
    if (sort.sortNear) {
      replaceSort({ ...sort, sortNear: false }, null);
      return;
    }

    setIsLocating(true);
    if (!navigator.geolocation) {
      replaceSort(
        { ...sort, sortNear: true },
        { lat: 42.6977, lng: 23.3219 },
      );
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        replaceSort(
          { ...sort, sortNear: true },
          { lat: position.coords.latitude, lng: position.coords.longitude },
        );
        setIsLocating(false);
      },
      () => {
        replaceSort(
          { ...sort, sortNear: true },
          { lat: 42.6977, lng: 23.3219 },
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  }, [replaceSort, sort]);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-full border border-border bg-background p-1">
      <Button
        type="button"
        size="sm"
        variant={sort.sortNear ? 'default' : 'ghost'}
        className="rounded-full"
        onClick={toggleNear}
        disabled={isLocating}
      >
        <LocateFixed className="mr-1 h-4 w-4" />
        {isLocating ? 'Локация…' : 'Най-близко'}
      </Button>
      <Button
        type="button"
        size="sm"
        variant={sort.sortSoon ? 'default' : 'ghost'}
        className="rounded-full"
        onClick={toggleSoon}
      >
        <CalendarDays className="mr-1 h-4 w-4" /> Най-скорошни
      </Button>
    </div>
  );
}
