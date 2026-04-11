import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { studioToDto, yogaClassToDto } from "@/lib/public-studio-dto";
import type { Studio, YogaClass } from "@/data/mock-data";

export type PublicCatalog = {
  studios: Studio[];
  classes: YogaClass[];
};

/** DB-backed public catalog for SSR and `/api/public/studios`. */
async function getPublicCatalogImpl(): Promise<PublicCatalog> {
  const studios = await prisma.studio.findMany({
    orderBy: { createdAt: "desc" },
    include: { business: { select: { ownerUserId: true } } },
  });
  const studioIds = studios.map((s) => s.id);
  const classes =
    studioIds.length === 0
      ? []
      : await prisma.yogaClass.findMany({
          where: { studioId: { in: studioIds } },
          orderBy: [{ date: "asc" }, { startTime: "asc" }],
          take: 500,
        });

  return {
    studios: studios.map(studioToDto),
    classes: classes.map(yogaClassToDto),
  };
}

/** Deduped per React render tree — use from RSC (e.g. discover grid slot). Do not use from Route Handlers. */
export const getPublicCatalogCached = cache(getPublicCatalogImpl);

/** Fresh read each call — safe for API routes and one-off RSC usage. */
export async function getPublicCatalog(): Promise<PublicCatalog> {
  return getPublicCatalogImpl();
}
