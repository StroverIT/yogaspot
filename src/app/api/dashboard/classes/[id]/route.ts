import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { assertStudioWriteAccess, jsonError, requireRole } from '@/lib/api-auth';
import { yogaClassToDto } from '@/lib/public-studio-dto';

export const runtime = 'nodejs';

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;
  const existing = await prisma.yogaClass.findUnique({ where: { id } });
  if (!existing) return jsonError('Not found', 404);

  const access = await assertStudioWriteAccess(gate.user, existing.studioId);
  if (!access.ok) return access.response;

  let body: Partial<{
    name: string;
    date: string;
    startTime: string;
    endTime: string;
    maxCapacity: number;
    enrolled: number;
    price: number;
    yogaType: string;
    difficulty: string;
    cancellationPolicy: string;
    waitingList: string[];
    instructorId: string;
  }>;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const data: Record<string, unknown> = {};
  if (typeof body.name === 'string') data.name = body.name.trim();
  if (typeof body.date === 'string') {
    const d = new Date(body.date);
    if (Number.isNaN(d.getTime())) return jsonError('Invalid date', 400);
    data.date = d;
  }
  if (typeof body.startTime === 'string') data.startTime = body.startTime;
  if (typeof body.endTime === 'string') data.endTime = body.endTime;
  if (typeof body.maxCapacity === 'number') data.maxCapacity = body.maxCapacity;
  if (typeof body.enrolled === 'number') data.enrolled = body.enrolled;
  if (typeof body.price === 'number') data.price = body.price;
  if (typeof body.yogaType === 'string') data.yogaType = body.yogaType;
  if (typeof body.difficulty === 'string') data.difficulty = body.difficulty;
  if (typeof body.cancellationPolicy === 'string') data.cancellationPolicy = body.cancellationPolicy;
  if (Array.isArray(body.waitingList)) data.waitingList = body.waitingList.filter((x) => typeof x === 'string');

  if (typeof body.instructorId === 'string') {
    const ins = await prisma.instructor.findFirst({
      where: { id: body.instructorId, studioId: existing.studioId },
    });
    if (!ins) return jsonError('Instructor not in this studio', 400);
    data.instructorId = body.instructorId;
  }

  if (Object.keys(data).length === 0) return jsonError('No valid fields', 400);

  const updated = await prisma.yogaClass.update({ where: { id }, data });
  return NextResponse.json({ class: yogaClassToDto(updated) });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;
  const existing = await prisma.yogaClass.findUnique({ where: { id } });
  if (!existing) return jsonError('Not found', 404);

  const access = await assertStudioWriteAccess(gate.user, existing.studioId);
  if (!access.ok) return access.response;

  await prisma.yogaClass.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
