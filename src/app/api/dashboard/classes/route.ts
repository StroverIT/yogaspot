import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonError, listStudioIdsForActor, requireRole } from '@/lib/api-auth';
import { isOnlinePaymentsEnabled } from '@/lib/payment-settings';
import { yogaClassToDto } from '@/lib/public-studio-dto';
import { ensureStripeCatalogEntry } from '@/lib/stripe-catalog';

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
  };
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  if (!body.studioId || !allowed.has(body.studioId)) {
    return jsonError('Invalid or forbidden studioId', 400);
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
  if (maxCapacity <= 0) return jsonError('Invalid maxCapacity', 400);

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
      price: typeof body.price === 'number' ? body.price : 0,
      yogaType: typeof body.yogaType === 'string' ? body.yogaType : '',
      difficulty: typeof body.difficulty === 'string' ? body.difficulty : 'начинаещ',
      cancellationPolicy: typeof body.cancellationPolicy === 'string' ? body.cancellationPolicy : '',
      waitingList: Array.isArray(body.waitingList) ? body.waitingList.filter((x) => typeof x === 'string') : [],
    },
  });

  if (isOnlinePaymentsEnabled()) {
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

  return NextResponse.json({ class: yogaClassToDto(created) }, { status: 201 });
}
