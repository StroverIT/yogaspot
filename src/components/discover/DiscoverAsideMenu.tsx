"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { DiscoverFilters } from "@/components/discover/discover-filters";
import {
  discoverPathWithQuery,
  parseDiscoverFiltersFromSearchParams,
  parseUserLocationFromSearchParams,
  stringifyDiscoverQuery,
} from "@/lib/discover-search-params";
import type { DiscoverFiltersState } from "@/types/discover-filters";

export type DiscoverAsideVariant = "sidebar" | "mobile-toolbar";

type Props = {
  variant: DiscoverAsideVariant;
};

/** Filters + “near me” — URL is the source of truth (searchParams). */
export function DiscoverAsideMenu({ variant }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLocating, setIsLocating] = useState(false);

  const filters = useMemo(
    () => parseDiscoverFiltersFromSearchParams(searchParams),
    [searchParams],
  );
  const userLocationFromUrl = useMemo(
    () => parseUserLocationFromSearchParams(searchParams),
    [searchParams],
  );

  const replaceDiscover = useCallback(
    (nextFilters: DiscoverFiltersState, userLocation: { lat: number; lng: number } | null) => {
      const qs = stringifyDiscoverQuery(nextFilters, { page: 1, userLocation });
      router.replace(discoverPathWithQuery(pathname, qs), { scroll: false });
    },
    [pathname, router],
  );

  const setFilters = useCallback(
    (next: DiscoverFiltersState) => {
      const userLocation = next.nearMe ? userLocationFromUrl : null;
      replaceDiscover(next, userLocation);
    },
    [replaceDiscover, userLocationFromUrl],
  );

  const handleNearMeClick = useCallback(() => {
    if (filters.nearMe) {
      replaceDiscover(
        { ...filters, nearMe: false, ratingSort: null, levelSort: null },
        null,
      );
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        replaceDiscover(
          { ...filters, nearMe: true, ratingSort: null, levelSort: null },
          {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        );
        setIsLocating(false);
      },
      () => {
        replaceDiscover(
          { ...filters, nearMe: true, ratingSort: null, levelSort: null },
          { lat: 42.6977, lng: 23.3219 },
        );
        setIsLocating(false);
      },
    );
  }, [filters, replaceDiscover]);

  const filtersChrome = (
    <DiscoverFilters
      filters={filters}
      onFiltersChange={setFilters}
      onNearMeClick={handleNearMeClick}
      isLocating={isLocating}
    />
  );

  if (variant === "sidebar") {
    return (
      <aside className="hidden w-72 flex-shrink-0 lg:block">
        <div className="sticky top-24 rounded-xl border border-yoga-accent-soft bg-yoga-surface p-6">
          <h2 className="mb-4 font-serif text-lg font-semibold text-yoga-text">Филтри</h2>
          {filtersChrome}
        </div>
      </aside>
    );
  }

  return (
    <div className="mb-6 lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full gap-2 border-yoga-accent-soft text-yoga-text"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Филтри
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 bg-yoga-bg">
          <SheetHeader>
            <SheetTitle className="font-serif text-yoga-text">Филтри</SheetTitle>
          </SheetHeader>
          <div className="mt-6">{filtersChrome}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
