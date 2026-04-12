import { NextResponse } from 'next/server';
import { jsonError, requireSession } from '@/lib/api-auth';
import { queueBookingNotifications } from '@/lib/booking-notifications';
import { enrollUserInYogaClassOffline } from '@/lib/offline-booking';
import { isOnlinePaymentsEnabled } from '@/lib/payment-settings';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  if (isOnlinePaymentsEnabled()) {
    return jsonError('Офлайн записване е налично само когато онлайн плащанията са изключени.', 403);
  }

  let body: { classId?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const classId = typeof body.classId === 'string' ? body.classId.trim() : '';
  if (!classId) return jsonError('Missing classId', 400);

  try {
    const { studioId, classDetail } = await enrollUserInYogaClassOffline(gate.user.id, classId);
    queueBookingNotifications({
      kind: 'class',
      paymentMode: 'offline',
      userId: gate.user.id,
      studioId,
      amountMinor: 0,
      currency: 'eur',
      classDetail: {
        name: classDetail.name,
        date: classDetail.date,
        startTime: classDetail.startTime,
        endTime: classDetail.endTime,
      },
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'BookingConflict' || err.message === 'ALREADY_BOOKED') {
        return jsonError('Вече сте записани за този клас.', 409);
      }
      if (err.message === 'CLASS_FULL') {
        return jsonError('Класът е пълен.', 409);
      }
      if (err.message === 'CLASS_NOT_FOUND') {
        return jsonError('Класът не е намерен.', 404);
      }
      if (err.message === 'ENROLL_FAILED') {
        return jsonError('Записването не бе успешно.', 500);
      }
    }
    console.error('[bookings/class]', err);
    return jsonError('Записването не бе успешно.', 500);
  }

  return NextResponse.json({ ok: true });
}
