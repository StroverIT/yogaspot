import { prisma } from '@/lib/prisma';

export type DashboardRecentSignup = {
  id: string;
  source: 'class' | 'schedule';
  paymentOrigin: 'online' | 'offline';
  title: string;
  customerName: string;
  studioName: string;
  studioId: string;
  paidAt: string;
};

export async function getDashboardRecentSignups(studioIds: string[], take = 20): Promise<DashboardRecentSignup[]> {
  if (studioIds.length === 0) return [];

  const [classPaid, classOffline, schedulePaid, scheduleOffline] = await Promise.all([
    prisma.booking.findMany({
      where: {
        yogaClass: { studioId: { in: studioIds } },
        payment: { status: 'paid' },
      },
      orderBy: { createdAt: 'desc' },
      take: take * 2,
      include: {
        user: { select: { name: true, email: true } },
        yogaClass: { select: { id: true, name: true, studioId: true, studio: { select: { name: true } } } },
        payment: { select: { createdAt: true } },
      },
    }),
    prisma.booking.findMany({
      where: {
        yogaClass: { studioId: { in: studioIds } },
        payment: { is: null },
      },
      orderBy: { createdAt: 'desc' },
      take: take * 2,
      include: {
        user: { select: { name: true, email: true } },
        yogaClass: { select: { id: true, name: true, studioId: true, studio: { select: { name: true } } } },
      },
    }),
    prisma.scheduleEntryBooking.findMany({
      where: {
        scheduleEntry: { studioId: { in: studioIds } },
        payment: { status: 'paid' },
      },
      orderBy: { createdAt: 'desc' },
      take: take * 2,
      include: {
        user: { select: { name: true, email: true } },
        scheduleEntry: {
          select: {
            id: true,
            className: true,
            studioId: true,
            day: true,
            studio: { select: { name: true } },
          },
        },
        payment: { select: { createdAt: true } },
      },
    }),
    prisma.scheduleEntryBooking.findMany({
      where: {
        scheduleEntry: { studioId: { in: studioIds } },
        payment: { is: null },
      },
      orderBy: { createdAt: 'desc' },
      take: take * 2,
      include: {
        user: { select: { name: true, email: true } },
        scheduleEntry: {
          select: {
            id: true,
            className: true,
            studioId: true,
            day: true,
            studio: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  const fromClass: DashboardRecentSignup[] = [
    ...classPaid.map((b) => ({
      id: `c-${b.id}`,
      source: 'class' as const,
      paymentOrigin: 'online' as const,
      title: b.yogaClass.name,
      customerName: b.user.name?.trim() || b.user.email?.trim() || 'Клиент',
      studioName: b.yogaClass.studio.name,
      studioId: b.yogaClass.studioId,
      paidAt: (b.payment?.createdAt ?? b.createdAt).toISOString(),
    })),
    ...classOffline.map((b) => ({
      id: `c-${b.id}`,
      source: 'class' as const,
      paymentOrigin: 'offline' as const,
      title: b.yogaClass.name,
      customerName: b.user.name?.trim() || b.user.email?.trim() || 'Клиент',
      studioName: b.yogaClass.studio.name,
      studioId: b.yogaClass.studioId,
      paidAt: b.createdAt.toISOString(),
    })),
  ];

  const fromSchedule: DashboardRecentSignup[] = [
    ...schedulePaid.map((b) => ({
      id: `s-${b.id}`,
      source: 'schedule' as const,
      paymentOrigin: 'online' as const,
      title: `${b.scheduleEntry.className} (${b.scheduleEntry.day})`,
      customerName: b.user.name?.trim() || b.user.email?.trim() || 'Клиент',
      studioName: b.scheduleEntry.studio.name,
      studioId: b.scheduleEntry.studioId,
      paidAt: (b.payment?.createdAt ?? b.createdAt).toISOString(),
    })),
    ...scheduleOffline.map((b) => ({
      id: `s-${b.id}`,
      source: 'schedule' as const,
      paymentOrigin: 'offline' as const,
      title: `${b.scheduleEntry.className} (${b.scheduleEntry.day})`,
      customerName: b.user.name?.trim() || b.user.email?.trim() || 'Клиент',
      studioName: b.scheduleEntry.studio.name,
      studioId: b.scheduleEntry.studioId,
      paidAt: b.createdAt.toISOString(),
    })),
  ];

  return [...fromClass, ...fromSchedule]
    .sort((a, b) => (a.paidAt < b.paidAt ? 1 : -1))
    .slice(0, take);
}
