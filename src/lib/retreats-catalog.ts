import type { HomeRetreat } from '@/lib/home/home-data';

export type RetreatCatalogItem = {
  id: string;
  title: string;
  descriptionPreview: string;
  image: string | null;
  address: string;
  lat: number;
  lng: number;
  activities: string[];
  duration: string;
  maxCapacity: number;
  enrolled: number;
  price: number;
  startDate: string;
  endDate: string;
  isEnrolled: boolean;
};

export type RetreatCatalogRow = RetreatCatalogItem & {
  distanceKm?: number;
};

type Coordinates = { lat: number; lng: number };

function haversineDistanceKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function truncateDescription(description: string, max = 160): string {
  const plain = description.replace(/\s+/g, ' ').trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1)}…`;
}

export function toRetreatCatalogItem(retreat: HomeRetreat): RetreatCatalogItem {
  return {
    id: retreat.id,
    title: retreat.title,
    descriptionPreview: truncateDescription(retreat.description),
    image: retreat.images.find((url) => url.trim().length > 0) ?? null,
    address: retreat.address,
    lat: retreat.lat,
    lng: retreat.lng,
    activities: retreat.activities,
    duration: retreat.duration,
    maxCapacity: retreat.maxCapacity,
    enrolled: retreat.enrolled,
    price: retreat.price,
    startDate: retreat.startDate,
    endDate: retreat.endDate,
    isEnrolled: retreat.isEnrolled,
  };
}

export function sortRetreatCatalog(
  retreats: RetreatCatalogItem[],
  options: {
    sortSoon: boolean;
    sortNear: boolean;
    userLocation: Coordinates | null;
  },
): RetreatCatalogRow[] {
  const now = new Date();
  const withDistance = retreats.map((retreat) => ({
    ...retreat,
    distanceKm:
      options.userLocation && retreat.lat && retreat.lng
        ? haversineDistanceKm({ lat: retreat.lat, lng: retreat.lng }, options.userLocation)
        : undefined,
  }));

  return withDistance.sort((a, b) => {
    const aDate = new Date(a.startDate);
    const bDate = new Date(b.startDate);
    const aUpcoming = aDate >= now;
    const bUpcoming = bDate >= now;

    if (options.sortSoon) {
      if (aUpcoming && !bUpcoming) return -1;
      if (!aUpcoming && bUpcoming) return 1;
      const dateDiff = aDate.getTime() - bDate.getTime();
      if (dateDiff !== 0) return dateDiff;
    }

    if (options.sortNear && options.userLocation) {
      const aDistance = a.distanceKm ?? Number.POSITIVE_INFINITY;
      const bDistance = b.distanceKm ?? Number.POSITIVE_INFINITY;
      const distanceDiff = aDistance - bDistance;
      if (distanceDiff !== 0) return distanceDiff;
    }

    if (!options.sortSoon && !options.sortNear) {
      if (aUpcoming && !bUpcoming) return -1;
      if (!aUpcoming && bUpcoming) return 1;
      return aDate.getTime() - bDate.getTime();
    }

    return 0;
  });
}
