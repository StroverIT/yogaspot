import type { SubscriptionVideo as PrismaSubscriptionVideo } from '@prisma/client';
import type { SubscriptionVideo } from '@/data/mock-data';

type VideoWithSubscriptions = PrismaSubscriptionVideo & {
  subscriptions: { studioSubscriptionId: string }[];
};

export function subscriptionVideoToDto(video: VideoWithSubscriptions): SubscriptionVideo {
  return {
    id: video.id,
    studioId: video.studioId,
    title: video.title ?? undefined,
    youtubeUrl: video.youtubeUrl,
    youtubeVideoId: video.youtubeVideoId,
    sortOrder: video.sortOrder,
    subscriptionIds: video.subscriptions.map(s => s.studioSubscriptionId),
    createdAt: video.createdAt.toISOString(),
  };
}
