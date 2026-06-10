import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { assertStudioWriteAccess, jsonError, requireBusinessWriteAccess, requireRole } from '@/lib/api-auth';
import { instructorToDto } from '@/lib/public-studio-dto';
import { invalidateAfterCatalogChange } from '@/lib/app-revalidate';
import { syncOnlineStudioFromInstructor } from '@/lib/online-instructor-studio';
import { isValidZoomMeetingUrl } from '@/lib/teaching-mode';

export const runtime = 'nodejs';

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const writeGate = await requireBusinessWriteAccess(gate.user);
  if (!writeGate.ok) return writeGate.response;

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
    experienceLevel: string[];
    rating: number;
    studioId: string;
    zoomMeetingUrl?: string | null;
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
  if (Array.isArray(body.experienceLevel)) {
    data.experienceLevel = body.experienceLevel.map((x) => x.trim()).filter(Boolean);
  }
  if (typeof body.rating === 'number' && Number.isFinite(body.rating)) data.rating = body.rating;
  if (typeof body.studioId === 'string') {
    const next = body.studioId.trim();
    if (!next) {
      return jsonError('Invalid studioId', 400);
    }
    if (next !== existing.studioId) {
      const accessNew = await assertStudioWriteAccess(gate.user, next);
      if (!accessNew.ok) return accessNew.response;
    }
    data.studioId = next;
  }

  if (body.zoomMeetingUrl !== undefined) {
    const zoom = body.zoomMeetingUrl?.trim() || null;
    if (zoom && !isValidZoomMeetingUrl(zoom)) {
      return jsonError('Invalid zoomMeetingUrl', 400);
    }
  }

  if (Object.keys(data).length === 0 && body.zoomMeetingUrl === undefined) {
    return jsonError('No valid fields', 400);
  }

  const updated =
    Object.keys(data).length > 0
      ? await prisma.instructor.update({ where: { id }, data })
      : existing;

  const yogaStyles = Array.isArray(body.yogaStyle)
    ? body.yogaStyle.filter((x) => typeof x === 'string')
    : updated.yogaStyle;

  await syncOnlineStudioFromInstructor({
    studioId: updated.studioId,
    instructorName: typeof body.name === 'string' ? body.name.trim() : updated.name,
    bio: typeof body.bio === 'string' ? body.bio.trim() : updated.bio,
    zoomMeetingUrl: body.zoomMeetingUrl,
    yogaStyles,
    photoUrl: typeof body.photo === 'string' ? body.photo : undefined,
  });

  invalidateAfterCatalogChange();
  return NextResponse.json({ instructor: instructorToDto(updated) });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const writeGate = await requireBusinessWriteAccess(gate.user);
  if (!writeGate.ok) return writeGate.response;

  const { id } = await ctx.params;
  const existing = await prisma.instructor.findUnique({ where: { id } });
  if (!existing) return jsonError('Not found', 404);

  const access = await assertStudioWriteAccess(gate.user, existing.studioId);
  if (!access.ok) return access.response;

  await prisma.instructor.delete({ where: { id } });
  invalidateAfterCatalogChange();
  return NextResponse.json({ ok: true });
}
