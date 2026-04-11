import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  instructorToDto,
  reviewToDto,
  scheduleEntryToDto,
  studioToDto,
  subscriptionToDto,
  yogaClassToDto,
} from '@/lib/public-studio-dto';
import { jsonError } from '@/lib/api-auth';
import type { Studio as PrismaStudioRow } from '@prisma/client';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const studio = await prisma.studio.findUnique({
    where: { id },
    include: {
      instructors: { orderBy: { name: 'asc' } },
      classes: { orderBy: { date: 'asc' } },
      schedule: { orderBy: [{ day: 'asc' }, { startTime: 'asc' }] },
      subscription: true,
    },
  });

  if (!studio) {
    return jsonError('Not found', 404);
  }

  const studioReviews = await prisma.review.findMany({
    where: { targetType: 'studio', targetId: studio.id },
    orderBy: { date: 'desc' },
  });

  return NextResponse.json({
    studio: studioToDto(studio as PrismaStudioRow),
    instructors: studio.instructors.map(instructorToDto),
    classes: studio.classes.map(yogaClassToDto),
    schedule: studio.schedule.map(scheduleEntryToDto),
    subscription: studio.subscription ? subscriptionToDto(studio.subscription) : null,
    reviews: studioReviews.map(reviewToDto),
  });
}
