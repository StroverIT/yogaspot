import { prisma } from '@/lib/prisma';
import { bgnFromStripeEurTotalMinor } from '@/lib/eur-bgn';
import { ACTIVE_STUDIO_MEMBERSHIP_STATUSES } from '@/lib/studio-membership';

export type DashboardMonthlyRevenuePoint = {
  month: string;
  label: string;
  bookingsBgn: number;
  subscriptionsBgn: number;
  totalBgn: number;
};

export const emptyDashboardMonthlyRevenue: DashboardMonthlyRevenuePoint[] = [];

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

function monthKey(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

function monthLabel(year: number, monthIndex: number): string {
  return new Date(Date.UTC(year, monthIndex, 1)).toLocaleDateString('bg-BG', {
    month: 'short',
    year: '2-digit',
  });
}

function buildLast12MonthBuckets(): DashboardMonthlyRevenuePoint[] {
  const now = new Date();
  const buckets: DashboardMonthlyRevenuePoint[] = [];
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const year = d.getUTCFullYear();
    const monthIndex = d.getUTCMonth();
    buckets.push({
      month: monthKey(year, monthIndex),
      label: monthLabel(year, monthIndex),
      bookingsBgn: 0,
      subscriptionsBgn: 0,
      totalBgn: 0,
    });
  }
  return buckets;
}

function paymentMonthKey(date: Date): string {
  return monthKey(date.getUTCFullYear(), date.getUTCMonth());
}

function membershipActiveInMonth(
  createdAt: Date,
  status: string,
  updatedAt: Date,
  monthStart: Date,
  monthEnd: Date,
): boolean {
  if (createdAt > monthEnd) return false;
  if ((ACTIVE_STUDIO_MEMBERSHIP_STATUSES as readonly string[]).includes(status)) return true;
  if (status === 'canceled') return updatedAt > monthStart;
  return false;
}

function membershipBillingEndDate(status: string, updatedAt: Date): Date {
  if ((ACTIVE_STUDIO_MEMBERSHIP_STATUSES as readonly string[]).includes(status)) return new Date();
  if (status === 'canceled') return updatedAt;
  return updatedAt;
}

function countBillingMonthsInclusive(start: Date, end: Date): number {
  if (end < start) return 0;
  const months =
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth()) + 1;
  return Math.max(0, months);
}

function subscriptionRevenueFromMemberships(
  memberships: Array<{
    createdAt: Date;
    updatedAt: Date;
    status: string;
    studioSubscription: { monthlyPrice: number | null } | null;
  }>,
): number {
  let total = 0;
  for (const membership of memberships) {
    const monthlyPrice = membership.studioSubscription?.monthlyPrice ?? 0;
    if (monthlyPrice <= 0) continue;
    if (!['active', 'past_due', 'canceled'].includes(membership.status)) continue;
    const end = membershipBillingEndDate(membership.status, membership.updatedAt);
    const months = countBillingMonthsInclusive(membership.createdAt, end);
    total += months * monthlyPrice;
  }
  return Math.round(total * 100) / 100;
}

export async function getDashboardAllTimeSubscriptionRevenueBgn(studioIds: string[]): Promise<number> {
  if (studioIds.length === 0) return 0;

  const memberships = await prisma.studioMembership.findMany({
    where: { studioId: { in: studioIds } },
    select: {
      createdAt: true,
      updatedAt: true,
      status: true,
      studioSubscription: { select: { monthlyPrice: true } },
    },
  });

  return subscriptionRevenueFromMemberships(memberships);
}

export async function getDashboardMonthlyRevenue(studioIds: string[]): Promise<DashboardMonthlyRevenuePoint[]> {
  if (studioIds.length === 0) return emptyDashboardMonthlyRevenue;

  const buckets = buildLast12MonthBuckets();
  const bucketByMonth = new Map(buckets.map((b) => [b.month, b]));
  const oldestMonth = buckets[0]?.month;
  if (!oldestMonth) return buckets;

  const [classBookings, scheduleBookings, memberships] = await Promise.all([
    prisma.booking.findMany({
      where: { yogaClass: { studioId: { in: studioIds } } },
      select: {
        createdAt: true,
        yogaClass: { select: { price: true } },
        payment: { select: { status: true, amount: true, currency: true, createdAt: true } },
      },
    }),
    prisma.scheduleEntryBooking.findMany({
      where: { scheduleEntry: { studioId: { in: studioIds } } },
      select: {
        createdAt: true,
        scheduleEntry: { select: { price: true } },
        payment: { select: { status: true, amount: true, currency: true, createdAt: true } },
      },
    }),
    prisma.studioMembership.findMany({
      where: { studioId: { in: studioIds } },
      select: {
        createdAt: true,
        updatedAt: true,
        status: true,
        studioSubscription: { select: { monthlyPrice: true } },
      },
    }),
  ]);

  for (const booking of classBookings) {
    const list = Number(booking.yogaClass.price) || 0;
    const amount = revenueBgnFromPayment(booking.payment, list);
    if (amount <= 0) continue;
    const paidAt = booking.payment?.createdAt ?? booking.createdAt;
    const key = paymentMonthKey(paidAt);
    const bucket = bucketByMonth.get(key);
    if (!bucket) continue;
    bucket.bookingsBgn += amount;
  }

  for (const booking of scheduleBookings) {
    const list = Number(booking.scheduleEntry.price) || 0;
    const amount = revenueBgnFromPayment(booking.payment, list);
    if (amount <= 0) continue;
    const paidAt = booking.payment?.createdAt ?? booking.createdAt;
    const key = paymentMonthKey(paidAt);
    const bucket = bucketByMonth.get(key);
    if (!bucket) continue;
    bucket.bookingsBgn += amount;
  }

  for (const bucket of buckets) {
    const [yearStr, monthStr] = bucket.month.split('-');
    const year = Number(yearStr);
    const monthIndex = Number(monthStr) - 1;
    const monthStart = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
    const monthEnd = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));

    for (const membership of memberships) {
      const monthlyPrice = membership.studioSubscription?.monthlyPrice ?? 0;
      if (monthlyPrice <= 0) continue;
      if (!membershipActiveInMonth(membership.createdAt, membership.status, membership.updatedAt, monthStart, monthEnd)) {
        continue;
      }
      bucket.subscriptionsBgn += monthlyPrice;
    }
  }

  for (const bucket of buckets) {
    bucket.totalBgn = bucket.bookingsBgn + bucket.subscriptionsBgn;
    bucket.bookingsBgn = Math.round(bucket.bookingsBgn * 100) / 100;
    bucket.subscriptionsBgn = Math.round(bucket.subscriptionsBgn * 100) / 100;
    bucket.totalBgn = Math.round(bucket.totalBgn * 100) / 100;
  }

  return buckets;
}
