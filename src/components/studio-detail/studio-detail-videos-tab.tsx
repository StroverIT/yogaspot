'use client';

import Link from 'next/link';
import { Lock, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubscriptionVideosGrid } from '@/components/subscription/subscription-videos-grid';
import type { AccessibleSubscriptionVideo } from '@/lib/subscription-videos-access';

type StudioDetailVideosTabProps = {
  studioId: string;
  videos: AccessibleSubscriptionVideo[];
  hasActiveMembership: boolean;
  loading: boolean;
};

export function StudioDetailVideosTab({
  studioId,
  videos,
  hasActiveMembership,
  loading,
}: StudioDetailVideosTabProps) {
  if (loading) {
    return <div className="h-48 animate-pulse rounded-2xl border border-border bg-muted/40" />;
  }

  if (!hasActiveMembership) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-6 w-6 text-primary" aria-hidden />
        </div>
        <h2 className="font-display text-lg font-semibold text-foreground">Видеата са за абонати</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Абонирайте се за студиото, за да получите достъп до ексклузивните YouTube видеа.
        </p>
        <Button asChild className="mt-6 rounded-lg">
          <Link href={`/studio/${studioId}?tab=schedule#studio-subscription`}>Виж абонамента</Link>
        </Button>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Video className="h-6 w-6 text-muted-foreground" aria-hidden />
        </div>
        <h2 className="font-display text-lg font-semibold text-foreground">Все още няма видеа</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Студиото все още не е добавило видеа към вашия абонамент.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {videos.length} {videos.length === 1 ? 'видео' : 'видеа'} включени във вашия абонамент.
      </p>
      <SubscriptionVideosGrid videos={videos} />
    </div>
  );
}
