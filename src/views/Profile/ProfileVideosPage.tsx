'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ExternalLink, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SubscriptionVideosGrid } from '@/components/subscription/subscription-videos-grid';
import { useProfileVideos } from '@/hooks/useProfileVideos';
import { youtubeWatchUrl } from '@/lib/youtube';

export default function ProfileVideosPage() {
  const { data, isPending, isError, error, refetch } = useProfileVideos();
  const videos = data?.videos ?? [];

  const videosByStudio = useMemo(() => {
    const groups = new Map<string, { studioName: string; videos: typeof videos }>();
    for (const video of videos) {
      const existing = groups.get(video.studioId);
      if (existing) {
        existing.videos.push(video);
      } else {
        groups.set(video.studioId, { studioName: video.studioName, videos: [video] });
      }
    }
    return [...groups.entries()];
  }, [videos]);

  if (isPending) {
    return (
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <Skeleton className="h-6 w-40" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <Skeleton className="aspect-video w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">Неуспешно зареждане на видеата.</p>
        <p className="mt-1 text-xs text-muted-foreground">{error?.message}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
          Опитай отново
        </Button>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Video className="h-6 w-6 text-primary" aria-hidden />
        </div>
        <h2 className="font-display text-lg font-semibold text-foreground">Няма налични видеа</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Когато се абонирате за студио с видео съдържание, то ще се появи тук.
        </p>
        <Button asChild className="mt-6 rounded-lg">
          <Link href="/discover">Разгледай студиа</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">Всички видеа</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {videos.length} {videos.length === 1 ? 'видео' : 'видеа'} от вашите активни абонаменти.
        </p>
        <ul className="mt-4 divide-y divide-border">
          {videos.map((video) => (
            <li key={video.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {video.title?.trim() || 'YouTube видео'}
                </p>
                <p className="text-xs text-muted-foreground">{video.studioName}</p>
              </div>
              <a
                href={youtubeWatchUrl(video.youtubeVideoId)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Отвори в YouTube
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </section>

      {videosByStudio.map(([studioId, group]) => (
        <section key={studioId} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-foreground">{group.studioName}</h2>
            <Button asChild variant="outline" size="sm" className="rounded-lg">
              <Link href={`/studio/${studioId}?tab=videos`}>Към студиото</Link>
            </Button>
          </div>
          <SubscriptionVideosGrid videos={group.videos} />
        </section>
      ))}
    </div>
  );
}
