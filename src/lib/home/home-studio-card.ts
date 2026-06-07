import type { Studio, YogaClass } from '@/data/mock-data';
import { getStudioCoverSrc } from '@/lib/studio-cover-src';
import { computeTopStudios } from '@/lib/home/home-data';

export type HomeStudioCard = {
  id: string;
  name: string;
  address: string;
  descriptionPreview: string;
  image: string;
  rating: number;
  reviewCount: number;
  lat: number;
  lng: number;
  classCount: number;
  amenities: Studio['amenities'];
};

function truncateDescription(description: string, max = 140): string {
  const plain = description.replace(/\s+/g, ' ').trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1)}…`;
}

function classCountByStudio(classes: YogaClass[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const yogaClass of classes) {
    counts.set(yogaClass.studioId, (counts.get(yogaClass.studioId) ?? 0) + 1);
  }
  return counts;
}

export function buildHomeStudioCards(studios: Studio[], classes: YogaClass[]): HomeStudioCard[] {
  const counts = classCountByStudio(classes);

  return studios.map((studio) => ({
    id: studio.id,
    name: studio.name,
    address: studio.address,
    descriptionPreview: truncateDescription(studio.description),
    image: getStudioCoverSrc(studio),
    rating: studio.rating,
    reviewCount: studio.reviewCount,
    lat: studio.lat,
    lng: studio.lng,
    classCount: counts.get(studio.id) ?? 0,
    amenities: studio.amenities,
  }));
}

export function pickTopHomeStudioCards(
  studios: Studio[],
  classes: YogaClass[],
  limit: number,
): HomeStudioCard[] {
  const cardsById = new Map(buildHomeStudioCards(studios, classes).map((card) => [card.id, card]));
  return computeTopStudios(studios, limit)
    .map((studio) => cardsById.get(studio.id))
    .filter((card): card is HomeStudioCard => card != null);
}
