import { prisma } from '@/lib/prisma';
import { bgnFromStripeEurTotalMinor } from '@/lib/eur-bgn';

export type DashboardBookingRevenue = {
  totalBgn: number;
  fromClassBookingsBgn: number;
  fromScheduleBookingsBgn: number;
  /** studioId → realized booking revenue (BGN) */
  perStudio: Record<string, { classBookingsBgn: number; scheduleBookingsBgn: number }>;
  /** Per dated event (YogaClass), from actual bookings - newest first */
  classEventsSales: Array<{ id: string; name: string; date: string; gross: number; bookingCount: number }>;
};

export const emptyDashboardBookingRevenue: DashboardBookingRevenue = {
  totalBgn: 0,
  fromClassBookingsBgn: 0,
  fromScheduleBookingsBgn: 0,
  perStudio: {},
  classEventsSales: [],
};

function revenueBgnFromPayment(
  payment: { status: string; amount: number; currency: string } | null | undefined,
  listPriceBgn: number,
): number {
  if (payment?.status === 'paid') {
    const cur = (payment.currency ?? 'eur').toLowerCase();
    if (cur === 'eur') return bgnFromStripeEurTotalMinor(payment.amount);
    return listPriceBgn;
  }
  if (payment == null) return listPriceBgn;
  return 0;
}

export async function getDashboardBookingRevenueSummary(studioIds: string[]): Promise<DashboardBookingRevenue> {
  if (studioIds.length === 0) return emptyDashboardBookingRevenue;

  const [classBookings, scheduleBookings] = await Promise.all([
    prisma.booking.findMany({
      where: { yogaClass: { studioId: { in: studioIds } } },
      select: {
        yogaClass: {
          select: { id: true, studioId: true, name: true, date: true, price: true },
        },
        payment: { select: { status: true, amount: true, currency: true } },
      },
    }),
    prisma.scheduleEntryBooking.findMany({
      where: { scheduleEntry: { studioId: { in: studioIds } } },
      select: {
        scheduleEntry: {
          select: { id: true, studioId: true, className: true, day: true, price: true },
        },
        payment: { select: { status: true, amount: true, currency: true } },
      },
    }),
  ]);

  const perStudio: Record<string, { classBookingsBgn: number; scheduleBookingsBgn: number }> = {};
  const bump = (studioId: string, field: 'classBookingsBgn' | 'scheduleBookingsBgn', delta: number) => {
    if (!perStudio[studioId]) perStudio[studioId] = { classBookingsBgn: 0, scheduleBookingsBgn: 0 };
    perStudio[studioId][field] += delta;
  };

  let fromClassBookingsBgn = 0;
  for (const b of classBookings) {
    const list = Number(b.yogaClass.price) || 0;
    const amount = revenueBgnFromPayment(b.payment, list);
    fromClassBookingsBgn += amount;
    bump(b.yogaClass.studioId, 'classBookingsBgn', amount);
  }

  let fromScheduleBookingsBgn = 0;
  for (const b of scheduleBookings) {
    const list = Number(b.scheduleEntry.price) || 0;
    const amount = revenueBgnFromPayment(b.payment, list);
    fromScheduleBookingsBgn += amount;
    bump(b.scheduleEntry.studioId, 'scheduleBookingsBgn', amount);
  }

  const byClassId = new Map<string, { id: string; name: string; date: Date; gross: number; bookingCount: number }>();
  for (const b of classBookings) {
    const id = b.yogaClass.id;
    const list = Number(b.yogaClass.price) || 0;
    const gross = revenueBgnFromPayment(b.payment, list);
    const prev = byClassId.get(id);
    if (prev) {
      prev.gross += gross;
      prev.bookingCount += 1;
    } else {
      byClassId.set(id, {
        id,
        name: b.yogaClass.name,
        date: b.yogaClass.date,
        gross,
        bookingCount: 1,
      });
    }
  }

  const classEventsSales = [...byClassId.values()]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 20)
    .map((row) => ({
      id: row.id,
      name: row.name,
      date: row.date.toISOString().slice(0, 10),
      gross: row.gross,
      bookingCount: row.bookingCount,
    }));

  return {
    totalBgn: fromClassBookingsBgn + fromScheduleBookingsBgn,
    fromClassBookingsBgn,
    fromScheduleBookingsBgn,
    perStudio,
    classEventsSales,
  };
}
