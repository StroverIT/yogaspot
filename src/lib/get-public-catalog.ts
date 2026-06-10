import { unstable_cache } from 'next/cache';
import { prisma } from "@/lib/prisma";
import { studioToDto, yogaClassToDto } from "@/lib/public-studio-dto";
import type { Studio, YogaClass } from "@/data/mock-data";
import { CACHE_TAGS } from '@/lib/app-revalidate';
import { filterPublicBusinessIds } from '@/lib/business-platform-billing';

export type PublicCatalog = {
  studios: Studio[];
  classes: YogaClass[];
};

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** DB-backed public catalog for SSR and `/api/public/studios`. */
async function getPublicCatalogImpl(): Promise<PublicCatalog> {
  const today = startOfToday();

  const [studios, classes] = await Promise.all([
    prisma.studio.findMany({
      where: { isHidden: false },
      orderBy: { createdAt: 'desc' },
      include: { business: { select: { ownerUserId: true } } },
    }),
    prisma.yogaClass.findMany({
      where: {
        date: { gte: today },
        studio: { isHidden: false },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      take: 500,
    }),
  ]);

  const listedBusinessIds = await filterPublicBusinessIds(studios.map((s) => s.businessId));
  const visibleStudios = studios.filter((s) => listedBusinessIds.has(s.businessId));
  const visibleStudioIds = new Set(visibleStudios.map((s) => s.id));

  return {
    studios: visibleStudios.map(studioToDto),
    classes: classes.filter((c) => visibleStudioIds.has(c.studioId)).map(yogaClassToDto),
  };
}

const getPublicCatalogCachedImpl = unstable_cache(getPublicCatalogImpl, ['public-catalog'], {
  tags: [CACHE_TAGS.publicCatalog],
  revalidate: 300,
});

/** Cross-request cached catalog for SSR and API consumers. */
export async function getPublicCatalogCached(): Promise<PublicCatalog> {
  return getPublicCatalogCachedImpl();
}

/** Unified catalog read path with tag-based invalidation. */
export async function getPublicCatalog(): Promise<PublicCatalog> {
  return getPublicCatalogCachedImpl();
}
