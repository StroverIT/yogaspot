import { after } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBookingConfirmationEmails, type ClassEmailDetail, type ScheduleEmailDetail } from '@/lib/booking-email';

export type BookingNotificationPayload = {
  kind: 'class' | 'schedule';
  userId: string;
  studioId: string;
  amountMinor: number;
  currency: string;
  paymentMode: 'online' | 'offline';
  classDetail?: ClassEmailDetail;
  scheduleDetail?: ScheduleEmailDetail;
};

export async function runBookingNotifications(payload: BookingNotificationPayload): Promise<void> {
  const [studio, buyer] = await Promise.all([
    prisma.studio.findUnique({
      where: { id: payload.studioId },
      include: { business: { include: { owner: { select: { email: true, name: true } } } } },
    }),
    prisma.user.findUnique({
      where: { id: payload.userId },
      select: { email: true, name: true },
    }),
  ]);
  if (!studio) return;

  const displayName = buyer?.name?.trim() || buyer?.email?.trim() || 'Клиент';
  const title =
    payload.kind === 'class' && payload.classDetail
      ? payload.classDetail.name
      : payload.scheduleDetail?.className ?? 'Резервация';

  await prisma.recentEnrollment.create({
    data: {
      userDisplayName: displayName,
      className: title,
      studioName: studio.name,
      enrolledAt: new Date(),
    },
  });

  await sendBookingConfirmationEmails({
    kind: payload.kind,
    paymentMode: payload.paymentMode,
    buyerEmail: buyer?.email,
    buyerName: buyer?.name,
    ownerEmail: studio.business.owner?.email,
    studioName: studio.name,
    studioAddress: studio.address,
    amountMinor: payload.amountMinor,
    currency: payload.currency,
    classDetail: payload.classDetail,
    scheduleDetail: payload.scheduleDetail,
  });
}

export function queueBookingNotifications(payload: BookingNotificationPayload): void {
  after(async () => {
    try {
      await runBookingNotifications(payload);
    } catch (err) {
      console.error('[booking-notifications] failed', err);
    }
  });
}
