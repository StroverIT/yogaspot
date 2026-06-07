import { revalidatePath, revalidateTag } from 'next/cache';

export const CACHE_TAGS = {
  publicCatalog: 'public-catalog',
  publicRetreats: 'public-retreats',
  publicRetreat: 'public-retreat',
  publicStudio: 'public-studio',
} as const;

export function getPublicStudioTag(studioId: string): string {
  return `${CACHE_TAGS.publicStudio}:${studioId}`;
}

export function getPublicRetreatTag(retreatId: string): string {
  return `${CACHE_TAGS.publicRetreat}:${retreatId}`;
}

export function revalidatePublicDataTags(retreatId?: string, studioId?: string): void {
  revalidateTag(CACHE_TAGS.publicCatalog);
  revalidateTag(CACHE_TAGS.publicStudio);
  if (studioId) {
    revalidateTag(getPublicStudioTag(studioId));
  }
  revalidateTag(CACHE_TAGS.publicRetreats);
  if (retreatId) {
    revalidateTag(getPublicRetreatTag(retreatId));
  } else {
    revalidateTag(CACHE_TAGS.publicRetreat);
  }
}

export function revalidateUserFacingRoutes(): void {
  revalidatePath('/', 'page');
  revalidatePath('/admin', 'layout');
  revalidatePath('/auth', 'layout');
  revalidatePath('/book', 'layout');
  revalidatePath('/dashboard', 'layout');
  revalidatePath('/discover', 'page');
  revalidatePath('/favorites', 'layout');
  revalidatePath('/profile', 'layout');
  revalidatePath('/retreats', 'page');
  revalidatePath('/retreats/[id]', 'page');
  revalidatePath('/studio/[id]', 'page');
  revalidatePath('/sitemap.xml');
}

export function invalidateAfterCatalogChange(retreatId?: string, studioId?: string): void {
  revalidatePublicDataTags(retreatId, studioId);
  revalidateUserFacingRoutes();
}
