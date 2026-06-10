import { prisma } from '@/lib/prisma';
import { ACTIVE_STUDIO_MEMBERSHIP_STATUSES } from '@/lib/studio-membership';

export type AccessibleSubscriptionVideo = {
  id: string;
  studioId: string;
  studioName: string;
  title?: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  sortOrder: number;
};

export async function countStudioSubscriptionVideos(studioId: string): Promise<number> {
  return prisma.subscriptionVideo.count({ where: { studioId } });
}

export async function getStudioSubscriptionVideosForUser(
  userId: string,
  studioId: string,
): Promise<{ videos: AccessibleSubscriptionVideo[]; hasActiveMembership: boolean }> {
  const membership = await prisma.studioMembership.findFirst({
    where: {
      userId,
      studioId,
      status: { in: [...ACTIVE_STUDIO_MEMBERSHIP_STATUSES] },
    },
    select: {
      studioSubscriptionId: true,
      studio: { select: { name: true } },
    },
  });

  if (!membership?.studioSubscriptionId) {
    return { videos: [], hasActiveMembership: false };
  }

  const videos = await prisma.subscriptionVideo.findMany({
    where: {
      studioId,
      subscriptions: {
        some: { studioSubscriptionId: membership.studioSubscriptionId },
      },
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      studioId: true,
      title: true,
      youtubeUrl: true,
      youtubeVideoId: true,
      sortOrder: true,
    },
  });

  const studioName = membership.studio.name;

  return {
    hasActiveMembership: true,
    videos: videos.map((video) => ({
      id: video.id,
      studioId: video.studioId,
      studioName,
      title: video.title ?? undefined,
      youtubeUrl: video.youtubeUrl,
      youtubeVideoId: video.youtubeVideoId,
      sortOrder: video.sortOrder,
    })),
  };
}

export async function getProfileSubscriptionVideos(userId: string): Promise<AccessibleSubscriptionVideo[]> {
  const memberships = await prisma.studioMembership.findMany({
    where: {
      userId,
      status: { in: [...ACTIVE_STUDIO_MEMBERSHIP_STATUSES] },
      studioSubscriptionId: { not: null },
    },
    select: {
      studioSubscriptionId: true,
      studio: { select: { id: true, name: true } },
    },
  });

  const subscriptionIds = [
    ...new Set(
      memberships
        .map((m) => m.studioSubscriptionId)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    ),
  ];

  if (subscriptionIds.length === 0) return [];

  const studioNameById = new Map(memberships.map((m) => [m.studio.id, m.studio.name]));

  const videos = await prisma.subscriptionVideo.findMany({
    where: {
      subscriptions: {
        some: { studioSubscriptionId: { in: subscriptionIds } },
      },
    },
    include: {
      studio: { select: { id: true, name: true } },
    },
    orderBy: [{ studio: { name: 'asc' } }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
  });

  const seen = new Set<string>();
  const result: AccessibleSubscriptionVideo[] = [];

  for (const video of videos) {
    if (seen.has(video.id)) continue;
    seen.add(video.id);
    result.push({
      id: video.id,
      studioId: video.studioId,
      studioName: video.studio.name || studioNameById.get(video.studioId) || 'Студио',
      title: video.title ?? undefined,
      youtubeUrl: video.youtubeUrl,
      youtubeVideoId: video.youtubeVideoId,
      sortOrder: video.sortOrder,
    });
  }

  return result;
}
