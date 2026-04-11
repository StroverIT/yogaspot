import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStudioBusinessOwnerUserId, jsonError, requireSession } from '@/lib/api-auth';
import { reviewToDto } from '@/lib/public-studio-dto';

export const runtime = 'nodejs';

const MAX_TEXT = 2000;

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: studioId } = await ctx.params;

  const gate = await requireSession();
  if (!gate.ok) return gate.response;

  const ownerId = await getStudioBusinessOwnerUserId(studioId);
  if (!ownerId) return jsonError('Not found', 404);
  if (ownerId === gate.user.id) {
    return jsonError('Собственикът на студиото не може да публикува ревю за него.', 403);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const ratingRaw =
    typeof body === 'object' && body !== null && 'rating' in body
      ? Number((body as { rating: unknown }).rating)
      : NaN;
  const textRaw =
    typeof body === 'object' && body !== null && 'text' in body
      ? String((body as { text: unknown }).text)
      : '';
  const text = textRaw.trim();

  if (!Number.isInteger(ratingRaw) || ratingRaw < 1 || ratingRaw > 5) {
    return jsonError('Оценката трябва да е между 1 и 5 звезди.', 400);
  }
  if (text.length < 1) {
    return jsonError('Моля, напишете текст на отзива.', 400);
  }
  if (text.length > MAX_TEXT) {
    return jsonError(`Текстът е твърде дълъг (макс. ${MAX_TEXT} знака).`, 400);
  }

  const existing = await prisma.review.findFirst({
    where: {
      authorUserId: gate.user.id,
      targetType: 'studio',
      targetId: studioId,
    },
  });
  if (existing) {
    return jsonError('Вече сте публикували ревю за това студио.', 409);
  }

  const user = await prisma.user.findUnique({
    where: { id: gate.user.id },
    select: { name: true, email: true },
  });
  if (!user) return jsonError('Unauthorized', 401);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const created = await prisma.$transaction(async (tx) => {
    const rev = await tx.review.create({
      data: {
        targetType: 'studio',
        targetId: studioId,
        rating: ratingRaw,
        text,
        date: today,
        authorUserId: gate.user.id,
        authorDisplayName:
          user.name?.trim() || (user.email ? user.email.split('@')[0] : '') || 'Потребител',
        authorEmail: user.email ?? undefined,
      },
      include: { author: { select: { image: true, name: true } } },
    });

    const [avgRow, count] = await Promise.all([
      tx.review.aggregate({
        where: { targetType: 'studio', targetId: studioId },
        _avg: { rating: true },
      }),
      tx.review.count({ where: { targetType: 'studio', targetId: studioId } }),
    ]);

    await tx.studio.update({
      where: { id: studioId },
      data: {
        rating: avgRow._avg.rating ?? 0,
        reviewCount: count,
      },
    });

    return rev;
  });

  return NextResponse.json({ review: reviewToDto(created) });
}
