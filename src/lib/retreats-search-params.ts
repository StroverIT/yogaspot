export type RetreatsSortState = {
  sortSoon: boolean;
  sortNear: boolean;
};

export function parseRetreatsSortFromSearchParams(
  searchParams: URLSearchParams,
): RetreatsSortState {
  const sortNear = searchParams.get('sortNear') === 'true';
  const sortSoonParam = searchParams.get('sortSoon');
  return {
    sortSoon: sortSoonParam === null ? true : sortSoonParam === 'true',
    sortNear,
  };
}

export function parseRetreatsUserLocationFromSearchParams(
  searchParams: URLSearchParams,
): { lat: number; lng: number } | null {
  if (searchParams.get('sortNear') !== 'true') return null;
  const lat = Number(searchParams.get('userLat'));
  const lng = Number(searchParams.get('userLng'));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

export function stringifyRetreatsQuery(
  sort: RetreatsSortState,
  userLocation: { lat: number; lng: number } | null,
): string {
  const params = new URLSearchParams();
  if (sort.sortSoon) params.set('sortSoon', 'true');
  else params.set('sortSoon', 'false');
  if (sort.sortNear) params.set('sortNear', 'true');
  if (sort.sortNear && userLocation) {
    params.set('userLat', String(userLocation.lat));
    params.set('userLng', String(userLocation.lng));
  }
  return params.toString();
}

export function retreatsPathWithQuery(pathname: string, query: string): string {
  return query ? `${pathname}?${query}` : pathname;
}

export function retreatsSearchParamsFromPage(
  searchParams: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string') {
      sp.set(key, value);
    } else if (Array.isArray(value)) {
      for (const entry of value) {
        sp.append(key, entry);
      }
    }
  }
  return sp;
}
