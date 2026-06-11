import { prisma } from '@/lib/prisma';
import { sendBookingConfirmationEmails, type ClassEmailDetail, type ScheduleEmailDetail } from '@/lib/booking-email';
import { teachingModeFromPrisma } from '@/lib/teaching-mode';

export type BookingNotificationPayload = {
  kind: 'class' | 'schedule';
  userId: string;
  studioId: string;
  bookingId: string;
  amountMinor: number;
  currency: string;
  paymentMode: 'online' | 'offline';
  classDetail?: ClassEmailDetail;
  scheduleDetail?: ScheduleEmailDetail;
};

/** Sends confirmation emails, then records RecentEnrollment. Swallows errors so Stripe/booking APIs are not failed by mail issues. */
export async function runBookingNotifications(payload: BookingNotificationPayload): Promise<void> {
  try {
    const [studio, buyer] = await Promise.all([
      prisma.studio.findUnique({
        where: { id: payload.studioId },
        select: {
          name: true,
          address: true,
          email: true,
          teachingMode: true,
          zoomMeetingUrl: true,
          business: { select: { owner: { select: { email: true, name: true } } } },
        },
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

    const teachingMode = teachingModeFromPrisma(studio.teachingMode);
    await sendBookingConfirmationEmails({
      kind: payload.kind,
      paymentMode: payload.paymentMode,
      bookingId: payload.bookingId,
      buyerEmail: buyer?.email,
      buyerName: buyer?.name,
      studioEmail: studio.email,
      ownerEmail: studio.business.owner?.email,
      studioName: studio.name,
      studioAddress: studio.address,
      studioTeachingMode: teachingMode,
      zoomMeetingUrl: studio.zoomMeetingUrl,
      amountMinor: payload.amountMinor,
      currency: payload.currency,
      classDetail: payload.classDetail,
      scheduleDetail: payload.scheduleDetail,
    });

    try {
      await prisma.recentEnrollment.create({
        data: {
          userDisplayName: displayName,
          className: title,
          studioName: studio.name,
          enrolledAt: new Date(),
        },
      });
    } catch (enrollErr) {
      console.error('[booking-notifications] RecentEnrollment create failed', enrollErr);
    }
  } catch (err) {
    console.error('[booking-notifications] failed (e.g. email)', err);
  }
}
