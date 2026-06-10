import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonError, listStudioIdsForActor, requireBusinessWriteAccess, requireRole, requireStripeConnectReady } from '@/lib/api-auth';
import { includesOnlinePayment, parsePaymentModeFromBody } from '@/lib/booking-payment-mode';
import { scheduleEntryToDto } from '@/lib/public-studio-dto';
import { ensureStripeCatalogEntry } from '@/lib/stripe-catalog';
import { trackServerEvent } from '@/lib/server-analytics';
import { invalidateAfterCatalogChange } from '@/lib/app-revalidate';
import { assertStudioReadyForClassPublish } from '@/lib/studio-online-gate';
import { teachingModeFromPrisma } from '@/lib/teaching-mode';
import { validateYogaClassMaxCapacity, validateYogaClassPrice, resolveAcceptsMultisport } from '@/lib/validate-yoga-class-fields';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const allowed = new Set(await listStudioIdsForActor(gate.user));
  const studioId = new URL(request.url).searchParams.get('studioId');
  const filterIds = studioId ? (allowed.has(studioId) ? [studioId] : null) : [...allowed];
  if (studioId && !allowed.has(studioId)) {
    return jsonError('Forbidden', 403);
  }
  if (!filterIds || filterIds.length === 0) {
    return NextResponse.json({ schedule: [] });
  }

  const schedule = await prisma.scheduleEntry.findMany({
    where: { studioId: { in: filterIds } },
    orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
  });

  return NextResponse.json({ schedule: schedule.map(scheduleEntryToDto) });
}

export async function POST(request: Request) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const writeGate = await requireBusinessWriteAccess(gate.user);
  if (!writeGate.ok) return writeGate.response;

  const allowed = new Set(await listStudioIdsForActor(gate.user));

  let body: {
    studioId?: string;
    instructorId?: string;
    className?: string;
    yogaType?: string;
    difficulty?: string;
    day?: string;
    startTime?: string;
    endTime?: string;
    maxCapacity?: number;
    price?: number;
    isRecurring?: boolean;
    acceptsMultisport?: boolean;
    paymentMode?: string;
  };
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  if (!body.studioId || !allowed.has(body.studioId)) {
    return jsonError('Invalid or forbidden studioId', 400);
  }

  const studio = await prisma.studio.findUnique({
    where: { id: body.studioId },
    select: { teachingMode: true },
  });
  if (!studio) return jsonError('Studio not found', 404);

  const teachingMode = teachingModeFromPrisma(studio.teachingMode);

  const studioGate = await assertStudioReadyForClassPublish(body.studioId);
  if (!studioGate.ok) {
    return jsonError(studioGate.message, 400);
  }

  if (!body.instructorId) return jsonError('Missing instructorId', 400);

  const instructor = await prisma.instructor.findFirst({
    where: { id: body.instructorId, studioId: body.studioId },
  });
  if (!instructor) return jsonError('Instructor not found for this studio', 400);

  if (!body.className?.trim() || !body.day?.trim() || !body.startTime || !body.endTime) {
    return jsonError('Missing className, day, startTime, or endTime', 400);
  }

  const maxCapacity = typeof body.maxCapacity === 'number' ? body.maxCapacity : 0;
  const capacityError = validateYogaClassMaxCapacity(maxCapacity, teachingMode);
  if (capacityError) return jsonError(capacityError, 400);

  const price = typeof body.price === 'number' ? body.price : 0;
  const priceError = validateYogaClassPrice(price, teachingMode);
  if (priceError) return jsonError(priceError, 400);

  const paymentModeResult = parsePaymentModeFromBody(body.paymentMode, price, 'onsite');
  if (!paymentModeResult.ok) return jsonError(paymentModeResult.error, 400);
  const paymentMode = paymentModeResult.mode;

  if (includesOnlinePayment(paymentMode)) {
    const stripeGate = await requireStripeConnectReady(
      gate.user,
      'Свържете Stripe акаунта си, за да приемате онлайн плащания.',
    );
    if (!stripeGate.ok) return stripeGate.response;
  }

  const created = await prisma.scheduleEntry.create({
    data: {
      studioId: body.studioId,
      instructorId: body.instructorId,
      className: body.className.trim(),
      yogaType: typeof body.yogaType === 'string' ? body.yogaType : '',
      difficulty: typeof body.difficulty === 'string' ? body.difficulty : 'начинаещ',
      day: body.day.trim(),
      startTime: body.startTime,
      endTime: body.endTime,
      maxCapacity,
      price,
      paymentMode,
      isRecurring: typeof body.isRecurring === 'boolean' ? body.isRecurring : true,
      acceptsMultisport: resolveAcceptsMultisport(body.acceptsMultisport, teachingMode),
    },
  });

  if (includesOnlinePayment(paymentMode)) {
    try {
      await ensureStripeCatalogEntry({
        name: `Schedule: ${created.className} (${created.day} ${created.startTime})`,
        baseAmount: created.price,
        metadata: {
          type: 'schedule',
          scheduleId: created.id,
          studioId: created.studioId,
        },
      });
    } catch (error) {
      console.error('Stripe catalog sync failed for schedule', created.id, error);
    }
  }

  const studioScheduleCount = await prisma.scheduleEntry.count({
    where: { studioId: created.studioId },
  });
  if (studioScheduleCount === 1) {
    await trackServerEvent({
      eventName: 'studio_first_event_published',
      userId: gate.user.id,
      studioId: created.studioId,
      metadata: {
        scheduleEntryId: created.id,
      },
    });
  }

  invalidateAfterCatalogChange();
  return NextResponse.json({ entry: scheduleEntryToDto(created) }, { status: 201 });
}
