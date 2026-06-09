import { provisionPlatformSubscription } from '@/lib/business-platform-billing';
import { prisma } from '@/lib/prisma';
import { isValidZoomMeetingUrl } from '@/lib/teaching-mode';

export async function ensureBusinessForOwnerUserId(ownerUserId: string) {
  const existing = await prisma.business.findUnique({ where: { ownerUserId } });
  if (existing) return existing;

  const business = await prisma.business.create({ data: { ownerUserId } });
  await provisionPlatformSubscription(business.id);
  return business;
}

export async function createOnlineStudioForInstructor(params: {
  businessId: string;
  instructorName: string;
  bio: string;
  zoomMeetingUrl: string;
  yogaStyles: string[];
  contactEmail: string;
  photoUrl?: string;
}) {
  const zoom = params.zoomMeetingUrl.trim();
  if (!isValidZoomMeetingUrl(zoom)) {
    throw new Error('INVALID_ZOOM_URL');
  }

  const name = params.instructorName.trim();
  if (!name) {
    throw new Error('MISSING_INSTRUCTOR_NAME');
  }

  const images = params.photoUrl?.trim() ? [params.photoUrl.trim()] : [];

  return prisma.studio.create({
    data: {
      businessId: params.businessId,
      name,
      teachingMode: 'ONLINE',
      zoomMeetingUrl: zoom,
      address: 'Онлайн',
      lat: null,
      lng: null,
      description: params.bio.trim() || `Онлайн йога с ${name}.`,
      phone: '-',
      email: params.contactEmail.trim() || 'contact@zenno.app',
      images,
      yogaTypes: params.yogaStyles,
    },
  });
}

export async function syncOnlineStudioFromInstructor(params: {
  studioId: string;
  instructorName: string;
  bio: string;
  zoomMeetingUrl?: string | null;
  yogaStyles: string[];
  photoUrl?: string;
}) {
  const studio = await prisma.studio.findUnique({
    where: { id: params.studioId },
    select: { teachingMode: true, images: true },
  });
  if (!studio || studio.teachingMode !== 'ONLINE') return;

  const images =
    params.photoUrl?.trim()
      ? [params.photoUrl.trim(), ...(studio.images ?? []).filter((u) => u !== params.photoUrl?.trim())]
      : studio.images;

  await prisma.studio.update({
    where: { id: params.studioId },
    data: {
      name: params.instructorName.trim(),
      description: params.bio.trim(),
      yogaTypes: params.yogaStyles,
      ...(params.zoomMeetingUrl !== undefined
        ? { zoomMeetingUrl: params.zoomMeetingUrl?.trim() || null }
        : {}),
      ...(params.photoUrl?.trim() ? { images } : {}),
    },
  });
}
