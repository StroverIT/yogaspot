import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonError, listStudioIdsForActor, requireBusinessWriteAccess, requireRole } from '@/lib/api-auth';
import { subscriptionVideoToDto } from '@/lib/subscription-video-dto';
import { normalizeYoutubeUrl } from '@/lib/youtube';

export const runtime = 'nodejs';

const videoInclude = {
  subscriptions: { select: { studioSubscriptionId: true } },
} as const;

async function getAuthorizedVideo(id: string, allowedStudioIds: Set<string>) {
  const video = await prisma.subscriptionVideo.findUnique({
    where: { id },
    include: videoInclude,
  });
  if (!video) return { error: jsonError('Video not found', 404) as NextResponse };
  if (!allowedStudioIds.has(video.studioId)) return { error: jsonError('Forbidden', 403) as NextResponse };
  return { video };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(['business', 'admin']);
  if (gate.ok === false) return gate.response;

  const writeGate = await requireBusinessWriteAccess(gate.user);
  if (!writeGate.ok) return writeGate.response;

  const { id } = await params;
  const allowed = new Set(await listStudioIdsForActor(gate.user));
  const auth = await getAuthorizedVideo(id, allowed);
  if ('error' in auth && auth.error) return auth.error;
  const existing = auth.video!;

  const body = (await request.json().catch(() => null)) as {
    title?: string | null;
    youtubeUrl?: string;
    subscriptionIds?: string[];
  } | null;

  const data: {
    title?: string | null;
    youtubeUrl?: string;
    youtubeVideoId?: string;
  } = {};

  if (body && 'title' in body) {
    data.title = String(body.title ?? '').trim() || null;
  }

  if (typeof body?.youtubeUrl === 'string' && body.youtubeUrl.trim()) {
    const normalized = normalizeYoutubeUrl(body.youtubeUrl);
    if (!normalized) return jsonError('Invalid YouTube URL', 400);
    data.youtubeUrl = normalized.youtubeUrl;
    data.youtubeVideoId = normalized.youtubeVideoId;
  }

  let subscriptionIds: string[] | undefined;
  if (Array.isArray(body?.subscriptionIds)) {
    subscriptionIds = [
      ...new Set(body.subscriptionIds.filter((sid): sid is string => typeof sid === 'string' && sid.trim().length > 0)),
    ];
    if (subscriptionIds.length === 0) return jsonError('At least one subscription is required', 400);

    const validSubscriptions = await prisma.studioSubscription.findMany({
      where: {
        id: { in: subscriptionIds },
        studioId: existing.studioId,
        hasMonthlySubscription: true,
      },
      select: { id: true },
    });
    if (validSubscriptions.length !== subscriptionIds.length) {
      return jsonError('One or more subscriptions are invalid for this studio', 400);
    }
  }

  const updated = await prisma.$transaction(async tx => {
    if (subscriptionIds) {
      await tx.subscriptionVideoOnSubscription.deleteMany({ where: { videoId: id } });
      await tx.subscriptionVideoOnSubscription.createMany({
        data: subscriptionIds.map(studioSubscriptionId => ({ videoId: id, studioSubscriptionId })),
      });
    }

    return tx.subscriptionVideo.update({
      where: { id },
      data,
      include: videoInclude,
    });
  });

  return NextResponse.json({ video: subscriptionVideoToDto(updated) });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(['business', 'admin']);
  if (gate.ok === false) return gate.response;

  const writeGate = await requireBusinessWriteAccess(gate.user);
  if (!writeGate.ok) return writeGate.response;

  const { id } = await params;
  const allowed = new Set(await listStudioIdsForActor(gate.user));
  const auth = await getAuthorizedVideo(id, allowed);
  if ('error' in auth && auth.error) return auth.error;

  await prisma.subscriptionVideo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
