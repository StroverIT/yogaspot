'use client';

import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Studio, StudioSubscription, SubscriptionVideo } from '@/data/mock-data';
import { youtubeThumbnailUrl, youtubeWatchUrl } from '@/lib/youtube';
import { Edit, ExternalLink, Plus, Trash2, Video } from 'lucide-react';

import { dashboardCardClass } from '../dashboardUi';
import { DashboardPageHeader } from './DashboardPageHeader';

function subscriptionLabel(sub: StudioSubscription | undefined): string {
  if (!sub) return 'Абонамент';
  return sub.name?.trim() || 'Абонамент';
}

export function VideosSection({
  videos,
  studios,
  subscriptions,
  onAdd,
  onEdit,
  onDelete,
}: {
  videos: SubscriptionVideo[];
  studios: Studio[];
  subscriptions: StudioSubscription[];
  onAdd: () => void;
  onEdit: (video: SubscriptionVideo) => void;
  onDelete: (video: SubscriptionVideo) => void;
}) {
  const [selectedStudio, setSelectedStudio] = useState('all');

  const filteredVideos = useMemo(() => {
    if (selectedStudio === 'all') return videos;
    return videos.filter(video => video.studioId === selectedStudio);
  }, [videos, selectedStudio]);

  const subscriptionById = useMemo(
    () => new Map(subscriptions.map(sub => [sub.id, sub])),
    [subscriptions],
  );

  if (studios.length === 0) {
    return (
      <div className="space-y-6">
        <DashboardPageHeader title="Видеа" description="Добавете YouTube видеа за абонатите си." />
        <div className={`${dashboardCardClass} p-8 text-center`}>
          <Video className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
          <p className="text-muted-foreground">Първо създайте студио, за да добавяте видеа.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Видеа"
        description={`${filteredVideos.length} видеа, свързани с абонаменти.`}
        actions={
          <Button type="button" onClick={onAdd} className="gap-2 shadow-sm shadow-primary/20">
            <Plus className="h-4 w-4" /> Добави видео
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Филтър по студио:</span>
        <Select value={selectedStudio} onValueChange={setSelectedStudio}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Всички студиа" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всички студиа</SelectItem>
            {studios.map(studio => (
              <SelectItem key={studio.id} value={studio.id}>
                {studio.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredVideos.length === 0 ? (
        <div className={`${dashboardCardClass} p-8 text-center`}>
          <Video className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
          <p className="text-muted-foreground">Все още няма добавени видеа.</p>
          <Button type="button" variant="outline" className="mt-4 gap-2" onClick={onAdd}>
            <Plus className="h-4 w-4" /> Добави първо видео
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredVideos.map(video => {
            const studio = studios.find(s => s.id === video.studioId);
            const linkedSubscriptions = video.subscriptionIds
              .map(id => subscriptionById.get(id))
              .filter((sub): sub is StudioSubscription => Boolean(sub));

            return (
              <div key={video.id} className={`${dashboardCardClass} overflow-hidden`}>
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
                    <ExternalLink className="h-6 w-6 text-white" />
                  </span>
                </a>

                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="font-display text-base font-semibold line-clamp-2">
                      {video.title?.trim() || 'YouTube видео'}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">{studio?.name ?? 'Студио'}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {linkedSubscriptions.length > 0 ? (
                      linkedSubscriptions.map(sub => (
                        <Badge key={sub.id} variant="secondary">
                          {subscriptionLabel(sub)}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline">Без абонамент</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => onEdit(video)}>
                      <Edit className="h-3.5 w-3.5" />
                      Редактирай
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-destructive hover:text-destructive"
                      onClick={() => onDelete(video)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Изтрий
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
