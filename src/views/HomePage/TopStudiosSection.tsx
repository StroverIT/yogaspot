'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HomeStudioSlideCard } from '@/components/home/home-studio-slide-card';
import { HomeStudiosCarousel } from '@/components/home/home-studios-carousel';
import type { HomeStudioCard } from '@/lib/home/home-studio-card';
import { ArrowRight, Heart, Star } from 'lucide-react';

export default function TopStudiosSection({
  studios,
  isFavorite,
  onFavorite,
}: {
  studios: HomeStudioCard[];
  isFavorite: (studioId: string) => boolean;
  onFavorite: (e: React.MouseEvent, studioId: string) => void;
}) {
  const renderFavoriteButton = (studioId: string) => {
    const fav = isFavorite(studioId);
    return (
      <button
        type="button"
        onClick={(e) => onFavorite(e, studioId)}
        className="absolute top-3 right-3 z-10 rounded-full border border-border bg-background/90 p-2 shadow-sm backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
      >
        <Heart
          className={`h-4 w-4 transition-colors ${
            fav ? 'fill-destructive text-destructive' : 'text-muted-foreground'
          }`}
        />
      </button>
    );
  };

  const carouselFallback = (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {studios.slice(0, 3).map((studio, index) => (
        <HomeStudioSlideCard
          key={studio.id}
          studio={studio}
          priority={index === 0}
          favoriteButton={renderFavoriteButton(studio.id)}
        />
      ))}
    </div>
  );

  return (
    <section className="bg-card py-20">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-yoga-secondary/20 p-2">
              <Star className="h-6 w-6 fill-yoga-secondary text-yoga-secondary" />
            </div>
            <div>
              <h2 className="mb-2 font-display text-3xl font-bold text-foreground md:text-4xl">
                Най-добре оценени
              </h2>
              <p className="text-muted-foreground">Студиа с най-висок рейтинг от нашата общност</p>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="top-studios-prev inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-all hover:bg-accent/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Предишно студио"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
              </button>
              <button
                type="button"
                className="top-studios-next inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-all hover:bg-accent/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Следващо студио"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <Button asChild variant="outline" className="gap-1 rounded-full">
              <Link href="/discover">
                Виж всички <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <HomeStudiosCarousel
          prevClass="top-studios-prev"
          nextClass="top-studios-next"
          bulletClass="top-studios-bullet"
          bulletActiveClass="top-studios-bullet-active"
          loop={studios.length > 3}
          autoplay
          fallback={carouselFallback}
          slides={studios.map((studio, index) => (
            <HomeStudioSlideCard
              key={studio.id}
              studio={studio}
              priority={index < 3}
              favoriteButton={renderFavoriteButton(studio.id)}
            />
          ))}
        />

        <div className="mt-4 text-center md:hidden">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/discover">
              Виж всички студиа <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
