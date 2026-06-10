import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { jsonError, requireSession } from '@/lib/api-auth';
import { effectivePaymentMode, includesOnsitePayment } from '@/lib/booking-payment-mode';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  let body: { retreatId?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const retreatId = typeof body.retreatId === 'string' ? body.retreatId.trim() : '';
  if (!retreatId) return jsonError('Missing retreatId', 400);

  const retreatMeta = await prisma.retreat.findUnique({
    where: { id: retreatId },
    select: { price: true, paymentMode: true, isPublished: true, isHidden: true },
  });
  if (!retreatMeta || retreatMeta.isHidden || !retreatMeta.isPublished) {
    return jsonError('Рийтрийтът не е намерен.', 404);
  }
  const mode = effectivePaymentMode(retreatMeta.price, retreatMeta.paymentMode);
  if (!includesOnsitePayment(mode)) {
    return jsonError('Този рийтрийт приема само онлайн плащане.', 403);
  }

  try {
    await prisma.$transaction(async (tx) => {
      const retreat = await tx.retreat.findUnique({
        where: { id: retreatId },
        select: { id: true, isPublished: true, isHidden: true, enrolled: true, maxCapacity: true },
      });
      if (!retreat || retreat.isHidden || !retreat.isPublished) {
        throw new Error('RETREAT_NOT_FOUND');
      }

      const existing = await tx.retreatBooking.findUnique({
        where: { retreatId_userId: { retreatId, userId: gate.user.id } },
      });
      if (existing) throw new Error('ALREADY_BOOKED');
      if (retreat.enrolled >= retreat.maxCapacity) throw new Error('RETREAT_FULL');

      await tx.retreatBooking.create({
        data: {
          retreatId,
          userId: gate.user.id,
        },
      });

      await tx.retreat.update({
        where: { id: retreatId },
        data: { enrolled: { increment: 1 } },
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return jsonError('Вече сте записани за този рийтрийт.', 409);
    }
    if (error instanceof Error) {
      if (error.message === 'ALREADY_BOOKED') return jsonError('Вече сте записани за този рийтрийт.', 409);
      if (error.message === 'RETREAT_FULL') return jsonError('Няма свободни места.', 409);
      if (error.message === 'RETREAT_NOT_FOUND') return jsonError('Рийтрийтът не е намерен.', 404);
    }
    console.error('[bookings/retreat]', error);
    return jsonError('Записването не беше успешно.', 500);
  }

  return NextResponse.json({ ok: true });
}
