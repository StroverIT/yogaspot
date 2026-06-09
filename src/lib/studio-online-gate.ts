import { prisma } from '@/lib/prisma';
import {
  isOnlineTeachingMode,
  onlineStudioMissingZoom,
  teachingModeFromPrisma,
} from '@/lib/teaching-mode';

export const ONLINE_STUDIO_ZOOM_REQUIRED_MSG =
  'Добавете валиден Zoom линк в настройките на студиото, преди да публикувате онлайн график или събитие.';

export async function assertStudioReadyForClassPublish(studioId: string): Promise<
  | { ok: true; teachingMode: 'physical' | 'online' }
  | { ok: false; message: string }
> {
  const studio = await prisma.studio.findUnique({
    where: { id: studioId },
    select: { teachingMode: true, zoomMeetingUrl: true },
  });
  if (!studio) {
    return { ok: false, message: 'Studio not found' };
  }

  const teachingMode = teachingModeFromPrisma(studio.teachingMode);
  if (
    onlineStudioMissingZoom({
      teachingMode,
      zoomMeetingUrl: studio.zoomMeetingUrl,
    })
  ) {
    return { ok: false, message: ONLINE_STUDIO_ZOOM_REQUIRED_MSG };
  }

  return { ok: true, teachingMode };
}

export function isStudioOnlineTeachingMode(mode: string): boolean {
  return isOnlineTeachingMode(teachingModeFromPrisma(mode));
}
