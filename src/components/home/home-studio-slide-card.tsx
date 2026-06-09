import type { ReactNode } from 'react';
import Link from 'next/link';
import { MapPin, Star, Users, Video } from 'lucide-react';
import { TeachingModeBadge } from '@/components/studio/teaching-mode-badge';
import type { HomeStudioCard } from '@/lib/home/home-studio-card';

export function HomeStudioSlideCard({
  studio,
  distanceLabel,
  priority = false,
  favoriteButton,
}: {
  studio: HomeStudioCard;
  distanceLabel?: string | null;
  priority?: boolean;
  favoriteButton: ReactNode;
}) {
  return (
    <div className="relative group h-full">
      {favoriteButton}
      <Link href={`/studio/${studio.id}`} prefetch={priority} className="block h-full">
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              src={studio.image}
              alt={studio.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              {...(priority ? { fetchPriority: 'high' as const } : {})}
            />
            <div className="absolute bottom-3 left-3 flex gap-2">
              <span className="flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                <Users className="h-3 w-3 text-primary" /> {studio.classCount} класа
              </span>
            </div>
            <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-accent/90 px-2.5 py-1 text-xs font-bold text-accent-foreground">
              <Star className="h-3 w-3 fill-current" /> {studio.rating}
            </div>
            {distanceLabel && studio.teachingMode !== 'online' ? (
              <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                <MapPin className="h-3 w-3 text-primary" />
                <span>{distanceLabel}</span>
              </div>
            ) : null}
            {studio.teachingMode === 'online' ? (
              <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                <Video className="h-3 w-3 text-primary" />
                <span>Онлайн</span>
              </div>
            ) : null}
          </div>
          <div className="flex flex-1 flex-col p-5">
            <h3 className="mb-1 font-display text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
              {studio.name}
            </h3>
            <div className="mb-3">
              <TeachingModeBadge mode={studio.teachingMode} address={studio.address} />
            </div>
            <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">{studio.descriptionPreview}</p>
            <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">{studio.reviewCount} ревюта</span>
              <span className="text-muted-foreground/30">·</span>
              <div className="flex gap-1.5">
                {studio.amenities.parking ? (
                  <span className="text-xs" title="Паркинг">
                    🅿️
                  </span>
                ) : null}
                {studio.amenities.shower ? (
                  <span className="text-xs" title="Душ">
                    🚿
                  </span>
                ) : null}
                {studio.amenities.changingRoom ? (
                  <span className="text-xs" title="Съблекалня">
                    👔
                  </span>
                ) : null}
                {studio.amenities.equipmentRental ? (
                  <span className="text-xs" title="Оборудване">
                    🧘
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
