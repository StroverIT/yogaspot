"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { DiscoverFilters, type DiscoverFiltersState } from "@/components/discover/discover-filters";
import { DiscoverGrid } from "@/components/discover/discover-grid";
import { buildDiscoverStudiosFromPayload } from "@/lib/discover-studios";
import type { Studio, YogaClass } from "@/data/mock-data";
import type { DiscoverStudio, YogaLevel } from "@/types/studio-discovery";

const ITEMS_PER_PAGE = 6;

const levelOrder: Record<YogaLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  all: 4,
};

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function DiscoverPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [filters, setFilters] = useState<DiscoverFiltersState>({
    search: searchParams.get("search") || "",
    level: (searchParams.get("level") as YogaLevel | "all") || "all",
    levelSort: (searchParams.get("levelSort") as "asc" | "desc") || null,
    yogaTypes: (searchParams.get("yogaTypes")?.split(",").filter(Boolean) ??
      []) as DiscoverFiltersState["yogaTypes"],
    ratingSort: (searchParams.get("ratingSort") as "asc" | "desc") || null,
    nearMe: searchParams.get("nearMe") === "true",
  });

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [displayedStudios, setDisplayedStudios] = useState<DiscoverStudio[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const skipNextFilterReset = useRef(true);

  const [catalogStudios, setCatalogStudios] = useState<Studio[]>([]);
  const [catalogClasses, setCatalogClasses] = useState<YogaClass[]>([]);

  useEffect(() => {
    fetch("/api/public/studios")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("catalog"))))
      .then((j: { studios: Studio[]; classes: YogaClass[] }) => {
        setCatalogStudios(j.studios ?? []);
        setCatalogClasses(j.classes ?? []);
      })
      .catch(() => {
        setCatalogStudios([]);
        setCatalogClasses([]);
      });
  }, []);

  const allDiscoverStudios = useMemo(
    () =>
      catalogStudios.length
        ? buildDiscoverStudiosFromPayload(catalogStudios, catalogClasses)
        : [],
    [catalogStudios, catalogClasses],
  );

  const filteredStudios = useMemo(() => {
    let result = allDiscoverStudios.filter((s) => !s.isHidden);

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.location.toLowerCase().includes(searchLower) ||
          s.address.toLowerCase().includes(searchLower)
      );
    }

    if (filters.level !== "all") {
      result = result.filter((s) => s.level === filters.level || s.level === "all");
    }

    if (filters.yogaTypes.length > 0) {
      result = result.filter((s) =>
        filters.yogaTypes.some((type) => s.styles.includes(type))
      );
    }

    type WithDistance = DiscoverStudio & { calculatedDistance?: number };

    if (userLocation) {
      result = result.map((s) => ({
        ...s,
        calculatedDistance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          s.lat,
          s.lng
        ),
      }));
    }

    if (filters.nearMe && userLocation) {
      result.sort(
        (a, b) => (a as WithDistance).calculatedDistance! - (b as WithDistance).calculatedDistance!
      );
    } else if (filters.levelSort) {
      result.sort((a, b) => {
        const diff = levelOrder[a.level] - levelOrder[b.level];
        return filters.levelSort === "asc" ? diff : -diff;
      });
    } else if (filters.ratingSort) {
      result.sort((a, b) =>
        filters.ratingSort === "desc" ? b.rating - a.rating : a.rating - b.rating
      );
    }

    if (userLocation) {
      result = result.map((s) => ({
        ...s,
        distance: `${(s as WithDistance).calculatedDistance?.toFixed(1) || "?"} км`,
      }));
    }

    return result;
  }, [filters, userLocation, allDiscoverStudios]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (currentPage > 1) params.set("page", currentPage.toString());
    if (filters.search) params.set("search", filters.search);
    if (filters.level !== "all") params.set("level", filters.level);
    if (filters.levelSort) params.set("levelSort", filters.levelSort);
    if (filters.yogaTypes.length > 0) params.set("yogaTypes", filters.yogaTypes.join(","));
    if (filters.ratingSort) params.set("ratingSort", filters.ratingSort);
    if (filters.nearMe) params.set("nearMe", "true");

    const queryString = params.toString();
    router.push(`/discover${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [currentPage, filters, router]);

  useEffect(() => {
    if (isInitialLoad) {
      const endIndex = currentPage * ITEMS_PER_PAGE;
      setDisplayedStudios(filteredStudios.slice(0, endIndex));
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, currentPage, filteredStudios]);

  useEffect(() => {
    if (isInitialLoad) return;
    if (skipNextFilterReset.current) {
      skipNextFilterReset.current = false;
      return;
    }
    setCurrentPage(1);
    setDisplayedStudios(filteredStudios.slice(0, ITEMS_PER_PAGE));
  }, [filters, filteredStudios, isInitialLoad]);

  const hasMore = displayedStudios.length < filteredStudios.length;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = currentPage * ITEMS_PER_PAGE;
      const endIndex = nextPage * ITEMS_PER_PAGE;
      const newStudios = filteredStudios.slice(startIndex, endIndex);

      setDisplayedStudios((prev) => [...prev, ...newStudios]);
      setCurrentPage(nextPage);
      setIsLoading(false);
    }, 500);
  }, [currentPage, filteredStudios, hasMore, isLoading]);

  const handleNearMeClick = () => {
    if (filters.nearMe) {
      setFilters((prev) => ({ ...prev, nearMe: false }));
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setFilters((prev) => ({ ...prev, nearMe: true, ratingSort: null, levelSort: null }));
        setIsLocating(false);
      },
      () => {
        setUserLocation({ lat: 42.6977, lng: 23.3219 });
        setFilters((prev) => ({ ...prev, nearMe: true, ratingSort: null, levelSort: null }));
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="flex gap-8">
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-24 bg-yoga-surface rounded-xl p-6 border border-yoga-accent-soft">
          <h2 className="font-serif text-lg font-semibold text-yoga-text mb-4">Филтри</h2>
          <DiscoverFilters
            filters={filters}
            onFiltersChange={setFilters}
            onNearMeClick={handleNearMeClick}
            isLocating={isLocating}
          />
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="lg:hidden mb-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="w-full gap-2 border-yoga-accent-soft text-yoga-text"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Филтри
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-yoga-bg">
              <SheetHeader>
                <SheetTitle className="font-serif text-yoga-text">Филтри</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <DiscoverFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  onNearMeClick={handleNearMeClick}
                  isLocating={isLocating}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-yoga-text-soft">
            Намерени <span className="font-semibold text-yoga-text">{filteredStudios.length}</span>{" "}
            студиа
          </p>
          {currentPage > 1 && (
            <p className="text-sm text-yoga-text-soft">Страница {currentPage}</p>
          )}
        </div>

        <DiscoverGrid
          studios={displayedStudios}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </div>
    </div>
  );
}
