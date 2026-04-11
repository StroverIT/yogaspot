import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonError, requireSession } from '@/lib/api-auth';

export const runtime = 'nodejs';

/** Authenticated users only — own favorites. */
export async function GET() {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  const rows = await prisma.favorite.findMany({
    where: { userId: gate.user.id },
    select: { studioId: true },
  });

  return NextResponse.json({ studioIds: rows.map((r) => r.studioId) });
}

/** Replace the user's favorites with the given studio IDs (must exist). */
export async function PUT(request: Request) {
  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const studioIds = (body as { studioIds?: unknown })?.studioIds;
  if (!Array.isArray(studioIds) || !studioIds.every((id) => typeof id === 'string')) {
    return jsonError('Expected { studioIds: string[] }', 400);
  }

  const unique = Array.from(new Set(studioIds as string[]));
  if (unique.length) {
    const found = await prisma.studio.findMany({
      where: { id: { in: unique } },
      select: { id: true },
    });
    if (found.length !== unique.length) {
      return jsonError('One or more studio IDs are invalid', 400);
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.favorite.deleteMany({ where: { userId: gate.user.id } });
    if (unique.length) {
      await tx.favorite.createMany({
        data: unique.map((studioId) => ({ userId: gate.user.id, studioId })),
      });
    }
  });

  return NextResponse.json({ studioIds: unique });
}
