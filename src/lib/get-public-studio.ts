import { cache } from 'react';
import type { Instructor, Review, ScheduleEntry, Studio, StudioSubscription, YogaClass } from '@/data/mock-data';
import { getSessionUser } from '@/lib/api-auth';
import {
  instructorToDto,
  reviewToDto,
  scheduleEntryToDto,
  studioToDto,
  subscriptionToDto,
  yogaClassToDto,
} from '@/lib/public-studio-dto';
import { prisma } from '@/lib/prisma';
import { trackServerEvent } from '@/lib/server-analytics';

export type PublicStudioPayload = {
  studio: Studio;
  instructors: Instructor[];
  classes: YogaClass[];
  schedule: ScheduleEntry[];
  subscription: StudioSubscription | null;
  reviews: Review[];
  myBookings: { classIds: string[]; scheduleEntryIds: string[] };
};

type LoadedStudio = {
  payload: PublicStudioPayload;
  userId?: string;
};

const loadPublicStudioPayload = cache(async (id: string): Promise<LoadedStudio | null> => {
  const [studio, sessionUser] = await Promise.all([
    prisma.studio.findUnique({
      where: { id },
      include: {
        business: { select: { ownerUserId: true } },
        instructors: { orderBy: { name: 'asc' } },
        classes: { orderBy: { date: 'asc' } },
        schedule: { orderBy: [{ day: 'asc' }, { startTime: 'asc' }] },
        subscription: true,
      },
    }),
    getSessionUser(),
  ]);

  if (!studio) {
    return null;
  }

  const studioReviews = await prisma.review.findMany({
    where: { targetType: 'studio', targetId: studio.id },
    orderBy: { date: 'desc' },
    include: { author: { select: { image: true, name: true } } },
  });

  let myBookings: PublicStudioPayload['myBookings'] = { classIds: [], scheduleEntryIds: [] };
  if (sessionUser?.id) {
    const [classRows, scheduleRows] = await Promise.all([
      prisma.booking.findMany({
        where: { userId: sessionUser.id, yogaClass: { studioId: studio.id } },
        select: { yogaClassId: true },
      }),
      prisma.scheduleEntryBooking.findMany({
        where: { userId: sessionUser.id, scheduleEntry: { studioId: studio.id } },
        select: { scheduleEntryId: true },
      }),
    ]);
    myBookings = {
      classIds: classRows.map((r) => r.yogaClassId),
      scheduleEntryIds: scheduleRows.map((r) => r.scheduleEntryId),
    };
  }

  return {
    payload: {
      studio: studioToDto(studio),
      instructors: studio.instructors.map(instructorToDto),
      classes: studio.classes.map(yogaClassToDto),
      schedule: studio.schedule.map(scheduleEntryToDto),
      subscription: studio.subscription ? subscriptionToDto(studio.subscription) : null,
      reviews: studioReviews.map(reviewToDto),
      myBookings,
    },
    userId: sessionUser?.id,
  };
});

export async function getPublicStudioPayload(
  id: string,
  options?: { trackView?: boolean },
): Promise<PublicStudioPayload | null> {
  const loaded = await loadPublicStudioPayload(id);
  if (!loaded) {
    return null;
  }

  if (options?.trackView) {
    void Promise.all([
      trackServerEvent({
        eventName: 'studio_view',
        userId: loaded.userId,
        studioId: loaded.payload.studio.id,
      }),
      trackServerEvent({
        eventName: 'schedule_view',
        userId: loaded.userId,
        studioId: loaded.payload.studio.id,
        metadata: {
          scheduleEntries: loaded.payload.schedule.length,
        },
      }),
    ]);
  }

  return loaded.payload;
}
