import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonError, listStudioIdsForActor, requireBusinessWriteAccess, requireRole } from '@/lib/api-auth';
import { subscriptionVideoToDto } from '@/lib/subscription-video-dto';
import { normalizeYoutubeUrl } from '@/lib/youtube';

export const runtime = 'nodejs';

const videoInclude = {
  subscriptions: { select: { studioSubscriptionId: true } },
} as const;

export async function GET(request: Request) {
  const gate = await requireRole(['business', 'admin']);
  if (gate.ok === false) return gate.response;

  const allowed = new Set(await listStudioIdsForActor(gate.user));
  const studioId = new URL(request.url).searchParams.get('studioId');
  const filterIds = studioId ? (allowed.has(studioId) ? [studioId] : null) : [...allowed];

  if (studioId && !allowed.has(studioId)) return jsonError('Forbidden', 403);
  if (!filterIds || filterIds.length === 0) return NextResponse.json({ videos: [] });

  const videos = await prisma.subscriptionVideo.findMany({
    where: { studioId: { in: filterIds } },
    include: videoInclude,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ videos: videos.map(subscriptionVideoToDto) });
}

export async function POST(request: Request) {
  const gate = await requireRole(['business', 'admin']);
  if (gate.ok === false) return gate.response;

  const writeGate = await requireBusinessWriteAccess(gate.user);
  if (!writeGate.ok) return writeGate.response;

  const body = (await request.json().catch(() => null)) as {
    studioId?: string;
    title?: string;
    youtubeUrl?: string;
    subscriptionIds?: string[];
  } | null;

  const studioId = String(body?.studioId ?? '').trim();
  const title = String(body?.title ?? '').trim() || null;
  const youtubeUrlRaw = String(body?.youtubeUrl ?? '').trim();
  const subscriptionIds = Array.isArray(body?.subscriptionIds)
    ? [...new Set(body.subscriptionIds.filter((id): id is string => typeof id === 'string' && id.trim().length > 0))]
    : [];

  const allowed = new Set(await listStudioIdsForActor(gate.user));
  if (!studioId || !allowed.has(studioId)) return jsonError('Invalid or forbidden studioId', 400);
  if (!youtubeUrlRaw) return jsonError('YouTube URL is required', 400);
  if (subscriptionIds.length === 0) return jsonError('At least one subscription is required', 400);

  const normalized = normalizeYoutubeUrl(youtubeUrlRaw);
  if (!normalized) return jsonError('Invalid YouTube URL', 400);

  const validSubscriptions = await prisma.studioSubscription.findMany({
    where: {
      id: { in: subscriptionIds },
      studioId,
      hasMonthlySubscription: true,
    },
    select: { id: true },
  });
  if (validSubscriptions.length !== subscriptionIds.length) {
    return jsonError('One or more subscriptions are invalid for this studio', 400);
  }

  const maxSort = await prisma.subscriptionVideo.aggregate({
    where: { studioId },
    _max: { sortOrder: true },
  });

  const created = await prisma.subscriptionVideo.create({
    data: {
      studioId,
      title,
      youtubeUrl: normalized.youtubeUrl,
      youtubeVideoId: normalized.youtubeVideoId,
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
      subscriptions: {
        create: subscriptionIds.map(studioSubscriptionId => ({ studioSubscriptionId })),
      },
    },
    include: videoInclude,
  });

  return NextResponse.json({ video: subscriptionVideoToDto(created) }, { status: 201 });
}
