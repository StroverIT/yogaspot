import { ExternalLink } from 'lucide-react';
import type { AccessibleSubscriptionVideo } from '@/lib/subscription-videos-access';
import { youtubeThumbnailUrl, youtubeWatchUrl } from '@/lib/youtube';

type SubscriptionVideosGridProps = {
  videos: AccessibleSubscriptionVideo[];
  showStudioName?: boolean;
};

export function SubscriptionVideosGrid({ videos, showStudioName = false }: SubscriptionVideosGridProps) {
  if (videos.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <article
          key={video.id}
          className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
        >
          <a
            href={youtubeWatchUrl(video.youtubeVideoId)}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-video overflow-hidden bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={youtubeThumbnailUrl(video.youtubeVideoId)}
              alt={video.title ?? 'YouTube видео'}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
              <ExternalLink className="h-6 w-6 text-white" aria-hidden />
            </span>
          </a>
          <div className="p-4">
            <h3 className="font-display text-base font-semibold text-foreground line-clamp-2">
              {video.title?.trim() || 'YouTube видео'}
            </h3>
            {showStudioName ? (
              <p className="mt-1 text-xs text-muted-foreground">{video.studioName}</p>
            ) : null}
            <a
              href={youtubeWatchUrl(video.youtubeVideoId)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Гледай в YouTube
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
