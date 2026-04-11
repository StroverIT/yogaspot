import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonError, listStudioIdsForActor, requireRole } from '@/lib/api-auth';
import { scheduleEntryToDto } from '@/lib/public-studio-dto';

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

  if (!body.className?.trim() || !body.day?.trim() || !body.startTime || !body.endTime) {
    return jsonError('Missing className, day, startTime, or endTime', 400);
  }

  const maxCapacity = typeof body.maxCapacity === 'number' ? body.maxCapacity : 0;
  if (maxCapacity <= 0) return jsonError('Invalid maxCapacity', 400);

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
      price: typeof body.price === 'number' ? body.price : 0,
      isRecurring: typeof body.isRecurring === 'boolean' ? body.isRecurring : true,
    },
  });

  return NextResponse.json({ entry: scheduleEntryToDto(created) }, { status: 201 });
}
