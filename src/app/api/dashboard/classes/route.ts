import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonError, listStudioIdsForActor, requireBusinessWriteAccess, requireRole, requireStripeConnectReady } from '@/lib/api-auth';
import { includesOnlinePayment, parsePaymentModeFromBody } from '@/lib/booking-payment-mode';
import { yogaClassToDto } from '@/lib/public-studio-dto';
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
    return NextResponse.json({ classes: [] });
  }

  const classes = await prisma.yogaClass.findMany({
    where: { studioId: { in: filterIds } },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });

  return NextResponse.json({ classes: classes.map(yogaClassToDto) });
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
    name?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    maxCapacity?: number;
    enrolled?: number;
    price?: number;
    yogaType?: string;
    difficulty?: string;
    cancellationPolicy?: string;
    waitingList?: string[];
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

  if (!body.name?.trim() || !body.date || !body.startTime || !body.endTime) {
    return jsonError('Missing name, date, startTime, or endTime', 400);
  }
  const d = new Date(body.date);
  if (Number.isNaN(d.getTime())) return jsonError('Invalid date', 400);

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

  const created = await prisma.yogaClass.create({
    data: {
      studioId: body.studioId,
      instructorId: body.instructorId,
      name: body.name.trim(),
      date: d,
      startTime: body.startTime,
      endTime: body.endTime,
      maxCapacity,
      enrolled: typeof body.enrolled === 'number' ? body.enrolled : 0,
      price,
      paymentMode,
      yogaType: typeof body.yogaType === 'string' ? body.yogaType : '',
      difficulty: typeof body.difficulty === 'string' ? body.difficulty : 'начинаещ',
      cancellationPolicy: typeof body.cancellationPolicy === 'string' ? body.cancellationPolicy : '',
      waitingList: Array.isArray(body.waitingList) ? body.waitingList.filter((x) => typeof x === 'string') : [],
      acceptsMultisport: resolveAcceptsMultisport(body.acceptsMultisport, teachingMode),
    },
  });

  if (includesOnlinePayment(paymentMode)) {
    try {
      await ensureStripeCatalogEntry({
        name: `Class: ${created.name}`,
        baseAmount: created.price,
        metadata: {
          type: 'class',
          classId: created.id,
          studioId: created.studioId,
        },
      });
    } catch (error) {
      console.error('Stripe catalog sync failed for class', created.id, error);
    }
  }

  const studioClassCount = await prisma.yogaClass.count({
    where: { studioId: created.studioId },
  });
  if (studioClassCount === 1) {
    await trackServerEvent({
      eventName: 'studio_first_class_created',
      userId: gate.user.id,
      studioId: created.studioId,
      metadata: {
        classId: created.id,
      },
    });
  }

  invalidateAfterCatalogChange();
  return NextResponse.json({ class: yogaClassToDto(created) }, { status: 201 });
}
