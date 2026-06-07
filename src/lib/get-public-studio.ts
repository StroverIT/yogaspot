import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import type { Instructor, Review, ScheduleEntry, Studio, StudioSubscription, YogaClass } from '@/data/mock-data';
import { getSessionUser } from '@/lib/api-auth';
import { CACHE_TAGS, getPublicStudioTag } from '@/lib/app-revalidate';
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

type PublicStudioContent = Omit<PublicStudioPayload, 'myBookings'>;

type LoadedStudio = {
  payload: PublicStudioPayload;
  userId?: string;
};

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function fetchPublicStudioContent(id: string): Promise<PublicStudioContent | null> {
  const today = startOfToday();

  const [studio, studioReviews] = await Promise.all([
    prisma.studio.findUnique({
      where: { id },
      include: {
        business: { select: { ownerUserId: true } },
        instructors: { orderBy: { name: 'asc' } },
        classes: {
          where: { date: { gte: today } },
          orderBy: { date: 'asc' },
          take: 80,
        },
        schedule: { orderBy: [{ day: 'asc' }, { startTime: 'asc' }] },
        subscription: true,
      },
    }),
    prisma.review.findMany({
      where: { targetType: 'studio', targetId: id },
      orderBy: { date: 'desc' },
      take: 50,
      include: { author: { select: { image: true, name: true } } },
    }),
  ]);

  if (!studio) {
    return null;
  }

  return {
    studio: studioToDto(studio),
    instructors: studio.instructors.map(instructorToDto),
    classes: studio.classes.map(yogaClassToDto),
    schedule: studio.schedule.map(scheduleEntryToDto),
    subscription: studio.subscription ? subscriptionToDto(studio.subscription) : null,
    reviews: studioReviews.map(reviewToDto),
  };
}

function getCachedPublicStudioContent(id: string) {
  return unstable_cache(
    async () => fetchPublicStudioContent(id),
    ['public-studio-content', id],
    {
      tags: [CACHE_TAGS.publicStudio, getPublicStudioTag(id)],
      revalidate: 120,
    },
  )();
}

async function loadMyBookings(
  userId: string,
  studioId: string,
): Promise<PublicStudioPayload['myBookings']> {
  const [classRows, scheduleRows] = await Promise.all([
    prisma.booking.findMany({
      where: { userId, yogaClass: { studioId } },
      select: { yogaClassId: true },
    }),
    prisma.scheduleEntryBooking.findMany({
      where: { userId, scheduleEntry: { studioId } },
      select: { scheduleEntryId: true },
    }),
  ]);

  return {
    classIds: classRows.map((r) => r.yogaClassId),
    scheduleEntryIds: scheduleRows.map((r) => r.scheduleEntryId),
  };
}

const loadPublicStudioPayload = cache(async (id: string): Promise<LoadedStudio | null> => {
  const [content, sessionUser] = await Promise.all([
    getCachedPublicStudioContent(id),
    getSessionUser(),
  ]);

  if (!content) {
    return null;
  }

  const myBookings =
    sessionUser?.id != null
      ? await loadMyBookings(sessionUser.id, content.studio.id)
      : { classIds: [], scheduleEntryIds: [] };

  return {
    payload: { ...content, myBookings },
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
