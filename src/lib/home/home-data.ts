import { cache } from "react";
import { unstable_noStore as noStore } from 'next/cache';
import type { Studio, YogaClass } from "@/data/mock-data";
import { getPublicCatalogCached } from "@/lib/get-public-catalog";
import { prisma } from '@/lib/prisma';

/**
 * Per-request dedupe; all home sections share one `getPublicCatalogCached()` read
 * (same pattern as discover).
 */
export const getHomeStudios = cache(async (): Promise<Studio[]> => {
  const { studios } = await getPublicCatalogCached();
  return studios;
});

export const getHomeClasses = cache(async (): Promise<YogaClass[]> => {
  const { classes } = await getPublicCatalogCached();
  return classes;
});

export type HomeRetreat = {
  id: string;
  title: string;
  description: string;
  images: string[];
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
  createdAt: string;
  studioName: string;
  contactPhone: string;
  contactEmail: string;
};

type RetreatRow = {
  id: string;
  title: string;
  description: string;
  images: string[];
  address: string;
  lat: number | null;
  lng: number | null;
  activities: string[];
  duration: string;
  maxCapacity: number;
  enrolled: number;
  price: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  studio: { name: string; isHidden: boolean; phone: string; email: string };
};

function mapRetreatRow(retreat: RetreatRow): HomeRetreat {
  return {
    id: retreat.id,
    title: retreat.title,
    description: retreat.description,
    images: retreat.images ?? [],
    address: retreat.address,
    lat: retreat.lat ?? 0,
    lng: retreat.lng ?? 0,
    activities: retreat.activities ?? [],
    duration: retreat.duration,
    maxCapacity: retreat.maxCapacity,
    enrolled: retreat.enrolled,
    price: retreat.price,
    startDate: retreat.startDate.toISOString().slice(0, 10),
    endDate: retreat.endDate.toISOString().slice(0, 10),
    createdAt: retreat.createdAt.toISOString(),
    studioName: retreat.studio.name,
    contactPhone: retreat.studio.phone,
    contactEmail: retreat.studio.email,
  };
}

export async function getHomeRetreats(limit = 30): Promise<HomeRetreat[]> {
  noStore();
  const retreatDelegate = (prisma as unknown as {
    retreat: {
      findMany: (args: {
        where: {
          isPublished: boolean;
          isHidden: boolean;
        };
        include: {
          studio: { select: { name: true; isHidden: true; phone: true; email: true } };
        };
        orderBy: Array<{ createdAt: 'desc' }>;
        take: number;
      }) => Promise<RetreatRow[]>;
    };
  }).retreat;
  const retreats = await retreatDelegate.findMany({
    where: {
      isPublished: true,
      isHidden: false,
    },
    include: {
      studio: { select: { name: true, isHidden: true, phone: true, email: true } },
    },
    orderBy: [{ createdAt: 'desc' }],
    take: limit,
  });

  return retreats.map(mapRetreatRow);
}

export async function getHomeRetreatById(id: string): Promise<HomeRetreat | null> {
  noStore();
  const retreatDelegate = (prisma as unknown as {
    retreat: {
      findFirst: (args: {
        where: {
          id: string;
          isPublished: boolean;
          isHidden: boolean;
        };
        include: {
          studio: { select: { name: true; isHidden: true; phone: true; email: true } };
        };
      }) => Promise<RetreatRow | null>;
    };
  }).retreat;
  const retreat = await retreatDelegate.findFirst({
    where: {
      id,
      isPublished: true,
      isHidden: false,
    },
    include: {
      studio: { select: { name: true, isHidden: true, phone: true, email: true } },
    },
  });

  if (!retreat) return null;
  return mapRetreatRow(retreat);
}

export function computeTopStudios(studios: Studio[], limit = 6): Studio[] {
  return [...studios]
    .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
    .slice(0, limit);
}
