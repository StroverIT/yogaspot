import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { AnalyticsEventName } from '@/lib/analytics-events';

export type TrackServerEventInput = {
  eventName: AnalyticsEventName;
  userId?: string | null;
  studioId?: string | null;
  metadata?: Prisma.InputJsonValue | null;
};

export async function trackServerEvent({
  eventName,
  userId,
  studioId,
  metadata,
}: TrackServerEventInput) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        event_name: eventName,
        user_id: userId ?? null,
        studio_id: studioId ?? null,
        metadata: metadata ?? undefined,
      },
    });
  } catch (error) {
    // Analytics must not break pages or API routes when the DB pool is busy.
    console.error('[analytics] failed to track event', eventName, error);
  }
}
