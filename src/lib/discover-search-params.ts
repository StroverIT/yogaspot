import type { DiscoverFiltersState } from "@/types/discover-filters";
import type { YogaLevel, YogaType } from "@/types/studio-discovery";
import { YOGA_TYPES } from "@/types/studio-discovery";

const yogaTypeSet = new Set<string>(YOGA_TYPES);

const yogaLevels: YogaLevel[] = ["beginner", "intermediate", "advanced", "all"];

function parseLevel(raw: string | null): YogaLevel | "all" {
  if (raw && yogaLevels.includes(raw as YogaLevel)) return raw as YogaLevel;
  return "all";
}

export function parseDiscoverFiltersFromSearchParams(
  searchParams: URLSearchParams,
): DiscoverFiltersState {
  const levelRaw = searchParams.get("level");
  const yogaTypesRaw = searchParams.get("yogaTypes")?.split(",").filter(Boolean) ?? [];
  const yogaTypes = yogaTypesRaw.filter((t): t is YogaType => yogaTypeSet.has(t));

  return {
    search: searchParams.get("search") || "",
    level: parseLevel(levelRaw),
    levelSort: (searchParams.get("levelSort") as "asc" | "desc") || null,
    yogaTypes,
    ratingSort: (searchParams.get("ratingSort") as "asc" | "desc") || null,
    nearMe: searchParams.get("nearMe") === "true",
  };
}

/** Only when nearMe is set — avoids orphan lat/lng affecting the grid. */
export function parseUserLocationFromSearchParams(
  searchParams: URLSearchParams,
): { lat: number; lng: number } | null {
  if (searchParams.get("nearMe") !== "true") return null;
  const lat = Number(searchParams.get("userLat"));
  const lng = Number(searchParams.get("userLng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

export function stringifyDiscoverQuery(
  filters: DiscoverFiltersState,
  options: { page: number; userLocation: { lat: number; lng: number } | null },
): string {
  const params = new URLSearchParams();
  if (options.page > 1) params.set("page", String(options.page));
  if (filters.search) params.set("search", filters.search);
  if (filters.level !== "all") params.set("level", filters.level);
  if (filters.levelSort) params.set("levelSort", filters.levelSort);
  if (filters.yogaTypes.length > 0) params.set("yogaTypes", filters.yogaTypes.join(","));
  if (filters.ratingSort) params.set("ratingSort", filters.ratingSort);
  if (filters.nearMe) params.set("nearMe", "true");
  if (filters.nearMe && options.userLocation) {
    params.set("userLat", String(options.userLocation.lat));
    params.set("userLng", String(options.userLocation.lng));
  }
  return params.toString();
}

export function discoverPathWithQuery(pathname: string, query: string): string {
  return query ? `${pathname}?${query}` : pathname;
}
