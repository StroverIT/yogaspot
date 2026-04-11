import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { assertStudioWriteAccess, jsonError, requireRole } from '@/lib/api-auth';
import { instructorToDto } from '@/lib/public-studio-dto';

export const runtime = 'nodejs';

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;
  const existing = await prisma.instructor.findUnique({ where: { id } });
  if (!existing) return jsonError('Not found', 404);

  const access = await assertStudioWriteAccess(gate.user, existing.studioId);
  if (!access.ok) return access.response;

  let body: Partial<{
    name: string;
    photo: string;
    bio: string;
    yogaStyle: string[];
    experienceLevel: string;
    rating: number;
  }>;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const data: Record<string, unknown> = {};
  if (typeof body.name === 'string') data.name = body.name.trim();
  if (typeof body.photo === 'string') data.photo = body.photo;
  if (typeof body.bio === 'string') data.bio = body.bio.trim();
  if (Array.isArray(body.yogaStyle)) data.yogaStyle = body.yogaStyle.filter((x) => typeof x === 'string');
  if (typeof body.experienceLevel === 'string') data.experienceLevel = body.experienceLevel.trim();
  if (typeof body.rating === 'number' && Number.isFinite(body.rating)) data.rating = body.rating;

  if (Object.keys(data).length === 0) return jsonError('No valid fields', 400);

  const updated = await prisma.instructor.update({ where: { id }, data });
  return NextResponse.json({ instructor: instructorToDto(updated) });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;
  const existing = await prisma.instructor.findUnique({ where: { id } });
  if (!existing) return jsonError('Not found', 404);

  const access = await assertStudioWriteAccess(gate.user, existing.studioId);
  if (!access.ok) return access.response;

  await prisma.instructor.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
