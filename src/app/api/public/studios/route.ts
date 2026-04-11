import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { studioToDto, yogaClassToDto } from '@/lib/public-studio-dto';

export const runtime = 'nodejs';

/** Public catalog — guests and all roles. Includes flat `classes` for discover/home maps. */
export async function GET() {
  const studios = await prisma.studio.findMany({
    orderBy: { createdAt: 'desc' },
  });
  const studioIds = studios.map((s) => s.id);
  const classes =
    studioIds.length === 0
      ? []
      : await prisma.yogaClass.findMany({
          where: { studioId: { in: studioIds } },
          orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
          take: 500,
        });

  return NextResponse.json({
    studios: studios.map(studioToDto),
    classes: classes.map(yogaClassToDto),
  });
}
