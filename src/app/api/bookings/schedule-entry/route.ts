import { NextResponse } from 'next/server';
import { jsonError, requireSession } from '@/lib/api-auth';
import { queueBookingNotifications } from '@/lib/booking-notifications';
import { enrollUserInScheduleOffline } from '@/lib/offline-booking';
import { isOnlinePaymentsEnabled } from '@/lib/payment-settings';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  if (isOnlinePaymentsEnabled()) {
    return jsonError('Офлайн записване е налично само когато онлайн плащанията са изключени.', 403);
  }

  let body: { scheduleEntryId?: string; studioId?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const scheduleEntryId = typeof body.scheduleEntryId === 'string' ? body.scheduleEntryId.trim() : '';
  const studioId = typeof body.studioId === 'string' ? body.studioId.trim() : '';
  if (!scheduleEntryId) return jsonError('Missing scheduleEntryId', 400);
  if (!studioId) return jsonError('Missing studioId', 400);

  try {
    const { studioId: resolvedStudioId, scheduleDetail } = await enrollUserInScheduleOffline(
      gate.user.id,
      scheduleEntryId,
      studioId,
    );
    queueBookingNotifications({
      kind: 'schedule',
      paymentMode: 'offline',
      userId: gate.user.id,
      studioId: resolvedStudioId,
      amountMinor: 0,
      currency: 'eur',
      scheduleDetail: {
        className: scheduleDetail.className,
        day: scheduleDetail.day,
        startTime: scheduleDetail.startTime,
        endTime: scheduleDetail.endTime,
      },
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'BookingConflict' || err.message === 'ALREADY_BOOKED') {
        return jsonError('Вече сте записани за този час.', 409);
      }
      if (err.message === 'CLASS_FULL') {
        return jsonError('Този час е пълен.', 409);
      }
      if (err.message === 'ENTRY_NOT_FOUND') {
        return jsonError('Часът не е намерен.', 404);
      }
      if (err.message === 'ENROLL_FAILED') {
        return jsonError('Записването не бе успешно.', 500);
      }
    }
    console.error('[bookings/schedule-entry]', err);
    return jsonError('Записването не бе успешно.', 500);
  }

  return NextResponse.json({ ok: true });
}
