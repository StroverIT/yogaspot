import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { assertStudioWriteAccess, jsonError, requireRole } from '@/lib/api-auth';
import { scheduleEntryToDto } from '@/lib/public-studio-dto';

export const runtime = 'nodejs';

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;
  const existing = await prisma.scheduleEntry.findUnique({ where: { id } });
  if (!existing) return jsonError('Not found', 404);

  const access = await assertStudioWriteAccess(gate.user, existing.studioId);
  if (!access.ok) return access.response;

  let body: Partial<{
    className: string;
    yogaType: string;
    difficulty: string;
    day: string;
    startTime: string;
    endTime: string;
    maxCapacity: number;
    price: number;
    isRecurring: boolean;
    instructorId: string;
  }>;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const data: Record<string, unknown> = {};
  if (typeof body.className === 'string') data.className = body.className.trim();
  if (typeof body.yogaType === 'string') data.yogaType = body.yogaType;
  if (typeof body.difficulty === 'string') data.difficulty = body.difficulty;
  if (typeof body.day === 'string') data.day = body.day.trim();
  if (typeof body.startTime === 'string') data.startTime = body.startTime;
  if (typeof body.endTime === 'string') data.endTime = body.endTime;
  if (typeof body.maxCapacity === 'number') data.maxCapacity = body.maxCapacity;
  if (typeof body.price === 'number') data.price = body.price;
  if (typeof body.isRecurring === 'boolean') data.isRecurring = body.isRecurring;

  if (typeof body.instructorId === 'string') {
    const ins = await prisma.instructor.findFirst({
      where: { id: body.instructorId, studioId: existing.studioId },
    });
    if (!ins) return jsonError('Instructor not in this studio', 400);
    data.instructorId = body.instructorId;
  }

  if (Object.keys(data).length === 0) return jsonError('No valid fields', 400);

  const updated = await prisma.scheduleEntry.update({ where: { id }, data });
  return NextResponse.json({ entry: scheduleEntryToDto(updated) });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;
  const existing = await prisma.scheduleEntry.findUnique({ where: { id } });
  if (!existing) return jsonError('Not found', 404);

  const access = await assertStudioWriteAccess(gate.user, existing.studioId);
  if (!access.ok) return access.response;

  await prisma.scheduleEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
