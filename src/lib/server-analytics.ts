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
  await prisma.analyticsEvent.create({
    data: {
      event_name: eventName,
      user_id: userId ?? null,
      studio_id: studioId ?? null,
      metadata: metadata ?? undefined,
    },
  });
}
