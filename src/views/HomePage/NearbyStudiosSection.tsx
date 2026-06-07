'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { HomeStudioSlideCard } from '@/components/home/home-studio-slide-card';
import { HomeStudiosCarousel } from '@/components/home/home-studios-carousel';
import type { HomeStudioCard } from '@/lib/home/home-studio-card';
import { ArrowRight, Heart, LocateFixed, MapPin } from 'lucide-react';

type Coordinates = { lat: number; lng: number };

const haversineDistanceKm = (a: Coordinates, b: Coordinates) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

function formatDistanceLabel(distanceKm: number | null): string | null {
  if (distanceKm == null) return null;
  const meters = distanceKm * 1000;
  if (meters < 50) return 'под 50 м';
  if (meters < 1000) return `${Math.round(meters)} м`;
  const km = distanceKm;
  if (km < 10) {
    const roundedMeters = Math.round((km - Math.floor(km)) * 1000);
    if (roundedMeters > 0) return `${Math.floor(km)} км ${roundedMeters} м`;
  }
  return `${km.toFixed(1)} км`;
}

export default function NearbyStudiosSection({
  studios,
  isFavorite,
  onFavorite,
}: {
  studios: HomeStudioCard[];
  isFavorite: (studioId: string) => boolean;
  onFavorite: (e: React.MouseEvent, studioId: string) => void;
}) {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationRequested, setLocationRequested] = useState(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Локацията не се поддържа в този браузър.');
      return;
    }

    setLocationRequested(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(null);
      },
      () => {
        setLocationError('Не успяхме да вземем локацията ти. Показваме примерни студиа.');
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60_000,
      },
    );
  };

  const studiosWithDistance = useMemo(() => {
    if (!userLocation) {
      return studios.slice(0, 6).map((studio) => ({ studio, distanceKm: null as number | null }));
    }

    return [...studios]
      .map((studio) => ({
        studio,
        distanceKm: haversineDistanceKm({ lat: studio.lat, lng: studio.lng }, userLocation),
      }))
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
      .slice(0, 6);
  }, [studios, userLocation]);

  const hasRealLocation = !!userLocation && !locationError;

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
      {studiosWithDistance.slice(0, 3).map(({ studio, distanceKm }, index) => (
        <HomeStudioSlideCard
          key={studio.id}
          studio={studio}
          distanceLabel={formatDistanceLabel(distanceKm)}
          priority={index === 0}
          favoriteButton={renderFavoriteButton(studio.id)}
        />
      ))}
    </div>
  );

  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-yoga-secondary/20 p-2">
              <MapPin className="h-6 w-6 text-yoga-secondary" />
            </div>
            <div>
              <h2 className="mb-2 font-display text-3xl font-bold text-foreground md:text-4xl">
                Близо до теб
              </h2>
              <p className="text-muted-foreground">
                {hasRealLocation
                  ? 'Открий йога студиа в твоя район.'
                  : 'Показваме популярни студиа. Използвай локацията си за по-точни резултати.'}
              </p>
              {!hasRealLocation ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-1.5 rounded-full"
                  onClick={requestLocation}
                  disabled={locationRequested && !locationError}
                >
                  <LocateFixed className="h-4 w-4" />
                  {locationRequested && !locationError && !userLocation
                    ? 'Локацията се зарежда...'
                    : 'Използвай моята локация'}
                </Button>
              ) : null}
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="nearby-studios-prev inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-all hover:bg-accent/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Предишно студио"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
              </button>
              <button
                type="button"
                className="nearby-studios-next inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-all hover:bg-accent/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
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

        {locationError ? <p className="mb-4 text-sm text-muted-foreground">{locationError}</p> : null}

        <HomeStudiosCarousel
          prevClass="nearby-studios-prev"
          nextClass="nearby-studios-next"
          bulletClass="nearby-studios-bullet"
          bulletActiveClass="nearby-studios-bullet-active"
          loop={studiosWithDistance.length > 3}
          fallback={carouselFallback}
          slides={studiosWithDistance.map(({ studio, distanceKm }, index) => (
            <HomeStudioSlideCard
              key={studio.id}
              studio={studio}
              distanceLabel={formatDistanceLabel(distanceKm)}
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
