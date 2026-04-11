import { prisma } from '@/lib/prisma';
import { instructorToDto, studioToDto, yogaClassToDto } from '@/lib/public-studio-dto';
import type { Instructor, Studio, YogaClass } from '@/data/mock-data';

export type ProfileHistoryActiveSubscription = {
  studioId: string;
  studioName: string;
  monthlyPrice: number;
  note: string;
};

export type ProfileHistoryPayload = {
  attendedClasses: { classId: string; attendedDate: string }[];
  classes: YogaClass[];
  instructors: Instructor[];
  studios: Studio[];
  activeSubscriptions: ProfileHistoryActiveSubscription[];
};

export async function getProfileHistoryPayload(userId: string): Promise<ProfileHistoryPayload> {
  const attendances = await prisma.userClassAttendance.findMany({
    where: { userId },
    orderBy: { attendedAt: 'desc' },
    include: {
      yogaClass: {
        include: { studio: true, instructor: true },
      },
    },
  });

  const attendedClasses = attendances.map((a) => ({
    classId: a.yogaClass.id,
    attendedDate: a.attendedAt.toISOString().slice(0, 10),
  }));

  const classMap = new Map<string, YogaClass>();
  const instructorMap = new Map<string, Instructor>();
  const studioMap = new Map<string, Studio>();

  for (const row of attendances) {
    const c = row.yogaClass;
    classMap.set(c.id, yogaClassToDto(c));
    instructorMap.set(c.instructor.id, instructorToDto(c.instructor));
    studioMap.set(c.studio.id, studioToDto(c.studio));
  }

  const favoriteStudioIds = (
    await prisma.favorite.findMany({
      where: { userId },
      select: { studioId: true },
    })
  ).map((f) => f.studioId);

  const subscriptionRows =
    favoriteStudioIds.length === 0
      ? []
      : await prisma.studioSubscription.findMany({
          where: {
            studioId: { in: favoriteStudioIds },
            hasMonthlySubscription: true,
          },
          include: { studio: { select: { id: true, name: true } } },
        });

  const activeSubscriptions: ProfileHistoryActiveSubscription[] = subscriptionRows.map((sub) => ({
    studioId: sub.studioId,
    studioName: sub.studio.name,
    monthlyPrice: sub.monthlyPrice ?? 0,
    note: sub.subscriptionNote ?? '',
  }));

  return {
    attendedClasses,
    classes: [...classMap.values()],
    instructors: [...instructorMap.values()],
    studios: [...studioMap.values()],
    activeSubscriptions,
  };
}
