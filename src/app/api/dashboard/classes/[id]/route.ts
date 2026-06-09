import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { assertStudioWriteAccess, jsonError, requireBusinessWriteAccess, requireRole } from '@/lib/api-auth';
import { yogaClassToDto } from '@/lib/public-studio-dto';
import { invalidateAfterCatalogChange } from '@/lib/app-revalidate';
import { teachingModeFromPrisma } from '@/lib/teaching-mode';
import { validateYogaClassMaxCapacity, validateYogaClassPrice, resolveAcceptsMultisport } from '@/lib/validate-yoga-class-fields';

export const runtime = 'nodejs';

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const writeGate = await requireBusinessWriteAccess(gate.user);
  if (!writeGate.ok) return writeGate.response;

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
    studioId: string;
    acceptsMultisport: boolean;
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
  if (typeof body.acceptsMultisport === 'boolean') data.acceptsMultisport = body.acceptsMultisport;

  let nextStudioId = existing.studioId;
  if (typeof body.studioId === 'string') {
    const t = body.studioId.trim();
    if (!t) return jsonError('Invalid studioId', 400);
    if (t !== existing.studioId) {
      const accessNew = await assertStudioWriteAccess(gate.user, t);
      if (!accessNew.ok) return accessNew.response;
      data.studioId = t;
    }
    nextStudioId = t;
  }

  if (typeof body.instructorId === 'string') {
    const ins = await prisma.instructor.findFirst({
      where: { id: body.instructorId, studioId: nextStudioId },
    });
    if (!ins) return jsonError('Instructor not in this studio', 400);
    data.instructorId = body.instructorId;
  } else if (typeof body.studioId === 'string' && body.studioId.trim() && body.studioId.trim() !== existing.studioId) {
    const ins = await prisma.instructor.findFirst({
      where: { id: existing.instructorId, studioId: body.studioId.trim() },
    });
    if (!ins) {
      return jsonError('Текущият инструктор не принадлежи към избраното студио.', 400);
    }
  }

  if (Object.keys(data).length === 0) return jsonError('No valid fields', 400);

  if (typeof data.maxCapacity === 'number' || typeof data.price === 'number' || typeof data.acceptsMultisport === 'boolean') {
    const studio = await prisma.studio.findUnique({
      where: { id: nextStudioId },
      select: { teachingMode: true },
    });
    if (!studio) return jsonError('Studio not found', 404);
    const teachingMode = teachingModeFromPrisma(studio.teachingMode);

    if (typeof data.maxCapacity === 'number') {
      const capacityError = validateYogaClassMaxCapacity(data.maxCapacity, teachingMode);
      if (capacityError) return jsonError(capacityError, 400);
    }
    if (typeof data.price === 'number') {
      const priceError = validateYogaClassPrice(data.price, teachingMode);
      if (priceError) return jsonError(priceError, 400);
    }
    if (typeof data.acceptsMultisport === 'boolean') {
      data.acceptsMultisport = resolveAcceptsMultisport(data.acceptsMultisport, teachingMode);
    }
  }

  const updated = await prisma.yogaClass.update({ where: { id }, data });
  invalidateAfterCatalogChange();
  return NextResponse.json({ class: yogaClassToDto(updated) });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const writeGate = await requireBusinessWriteAccess(gate.user);
  if (!writeGate.ok) return writeGate.response;

  const { id } = await ctx.params;
  const existing = await prisma.yogaClass.findUnique({ where: { id } });
  if (!existing) return jsonError('Not found', 404);

  const access = await assertStudioWriteAccess(gate.user, existing.studioId);
  if (!access.ok) return access.response;

  await prisma.yogaClass.delete({ where: { id } });
  invalidateAfterCatalogChange();
  return NextResponse.json({ ok: true });
}
