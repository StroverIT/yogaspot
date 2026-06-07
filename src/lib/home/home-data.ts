import { cache } from "react";
import { unstable_cache } from 'next/cache';
import type { Studio, YogaClass } from "@/data/mock-data";
import { getPublicCatalogCached } from "@/lib/get-public-catalog";
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/api-auth';
import { CACHE_TAGS } from '@/lib/app-revalidate';

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
  isEnrolled: boolean;
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
  startDate: Date | string;
  endDate: Date | string;
  createdAt: Date | string;
  studio: { name: string; isHidden: boolean; phone: string; email: string };
};

function toIsoDate(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

function mapRetreatRow(retreat: RetreatRow, isEnrolled = false): HomeRetreat {
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
    startDate: toIsoDate(retreat.startDate).slice(0, 10),
    endDate: toIsoDate(retreat.endDate).slice(0, 10),
    createdAt: toIsoDate(retreat.createdAt),
    studioName: retreat.studio.name,
    contactPhone: retreat.studio.phone,
    contactEmail: retreat.studio.email,
    isEnrolled,
  };
}

async function getPublishedRetreatRows(limit: number): Promise<RetreatRow[]> {
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

  return retreatDelegate.findMany({
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
}

const getPublishedRetreatRowsCached = unstable_cache(getPublishedRetreatRows, ['published-retreats'], {
  tags: [CACHE_TAGS.publicRetreats, CACHE_TAGS.publicRetreat],
  revalidate: 300,
});

async function getPublishedRetreatRowById(id: string): Promise<RetreatRow | null> {
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

  return retreatDelegate.findFirst({
    where: {
      id,
      isPublished: true,
      isHidden: false,
    },
    include: {
      studio: { select: { name: true, isHidden: true, phone: true, email: true } },
    },
  });
}

const getPublishedRetreatRowByIdCached = unstable_cache(getPublishedRetreatRowById, ['published-retreat-by-id'], {
  tags: [CACHE_TAGS.publicRetreats, CACHE_TAGS.publicRetreat],
  revalidate: 300,
});

export async function getHomeRetreats(limit = 30): Promise<HomeRetreat[]> {
  const [retreats, user] = await Promise.all([
    getPublishedRetreatRowsCached(limit),
    getSessionUser(),
  ]);

  const enrolledIds = new Set<string>();
  if (user?.id && retreats.length > 0) {
    const retreatBookingDelegate = (prisma as unknown as {
      retreatBooking: {
        findMany: (args: {
          where: { userId: string; retreatId: { in: string[] } };
          select: { retreatId: true };
        }) => Promise<Array<{ retreatId: string }>>;
      };
    }).retreatBooking;
    const bookings = await retreatBookingDelegate.findMany({
      where: {
        userId: user.id,
        retreatId: { in: retreats.map((retreat) => retreat.id) },
      },
      select: { retreatId: true },
    });
    for (const booking of bookings) enrolledIds.add(booking.retreatId);
  }

  return retreats.map((retreat) => mapRetreatRow(retreat, enrolledIds.has(retreat.id)));
}

export async function getHomeRetreatById(id: string): Promise<HomeRetreat | null> {
  const [retreat, user] = await Promise.all([
    getPublishedRetreatRowByIdCached(id),
    getSessionUser(),
  ]);

  if (!retreat) return null;
  let isEnrolled = false;
  if (user?.id) {
    const retreatBookingDelegate = (prisma as unknown as {
      retreatBooking: {
        findUnique: (args: {
          where: { retreatId_userId: { retreatId: string; userId: string } };
          select: { retreatId: true };
        }) => Promise<{ retreatId: string } | null>;
      };
    }).retreatBooking;
    const booking = await retreatBookingDelegate.findUnique({
      where: { retreatId_userId: { retreatId: retreat.id, userId: user.id } },
      select: { retreatId: true },
    });
    isEnrolled = Boolean(booking);
  }
  return mapRetreatRow(retreat, isEnrolled);
}

export function computeTopStudios(studios: Studio[], limit = 6): Studio[] {
  return [...studios]
    .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
    .slice(0, limit);
}
