import { buildDiscoverStudiosFromPayload } from "@/lib/discover-studios";
import type { Studio, YogaClass } from "@/data/mock-data";
import type { DiscoverFiltersState } from "@/types/discover-filters";
import type { DiscoverStudio, YogaLevel } from "@/types/studio-discovery";

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

type Coordinates = { lat: number; lng: number };

export function filterDiscoverStudios(
  catalogStudios: Studio[],
  catalogClasses: YogaClass[],
  filters: DiscoverFiltersState,
  userLocation: Coordinates | null,
): DiscoverStudio[] {
  const allDiscoverStudios =
    catalogStudios.length > 0
      ? buildDiscoverStudiosFromPayload(catalogStudios, catalogClasses)
      : [];

  let result = allDiscoverStudios.filter((s) => !s.isHidden);

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(searchLower) ||
        s.location.toLowerCase().includes(searchLower) ||
        s.address.toLowerCase().includes(searchLower),
    );
  }

  if (filters.level !== "all") {
    result = result.filter((s) => s.level === filters.level || s.level === "all");
  }

  if (filters.yogaTypes.length > 0) {
    result = result.filter((s) => filters.yogaTypes.some((type) => s.styles.includes(type)));
  }

  type WithDistance = DiscoverStudio & { calculatedDistance?: number };

  if (userLocation) {
    result = result.map((s) => ({
      ...s,
      calculatedDistance: calculateDistance(userLocation.lat, userLocation.lng, s.lat, s.lng),
    }));
  }

  if (filters.nearMe && userLocation) {
    result.sort(
      (a, b) => (a as WithDistance).calculatedDistance! - (b as WithDistance).calculatedDistance!,
    );
  } else if (filters.levelSort) {
    result.sort((a, b) => {
      const diff = levelOrder[a.level] - levelOrder[b.level];
      return filters.levelSort === "asc" ? diff : -diff;
    });
  } else if (filters.ratingSort) {
    result.sort((a, b) =>
      filters.ratingSort === "desc" ? b.rating - a.rating : a.rating - b.rating,
    );
  }

  if (userLocation) {
    result = result.map((s) => ({
      ...s,
      distance: `${(s as WithDistance).calculatedDistance?.toFixed(1) || "?"} км`,
    }));
  }

  return result;
}
