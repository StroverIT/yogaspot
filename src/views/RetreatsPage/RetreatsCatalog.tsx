'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { HomeRetreat } from '@/lib/home/home-data';
import { CalendarDays, Clock3, LocateFixed, MapPin, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { RetreatSignupButton } from '@/components/retreats/RetreatSignupButton';

type Coordinates = { lat: number; lng: number };

function haversineDistanceKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function RetreatsCatalog({ retreats }: { retreats: HomeRetreat[] }) {
  const [sortByNear, setSortByNear] = useState(false);
  const [sortBySoon, setSortBySoon] = useState(true);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  useEffect(() => {
    if (!sortByNear) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        setUserLocation(null);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [sortByNear]);

  const sortedRetreats = useMemo(() => {
    const now = new Date();
    const withDistance = retreats.map((retreat) => ({
      retreat,
      distance:
        userLocation && retreat.lat && retreat.lng
          ? haversineDistanceKm({ lat: retreat.lat, lng: retreat.lng }, userLocation)
          : Number.POSITIVE_INFINITY,
    }));

    return withDistance.sort((a, b) => {
      const aDate = new Date(a.retreat.startDate);
      const bDate = new Date(b.retreat.startDate);
      const aUpcoming = aDate >= now;
      const bUpcoming = bDate >= now;

      if (sortBySoon) {
        if (aUpcoming && !bUpcoming) return -1;
        if (!aUpcoming && bUpcoming) return 1;
        const dateDiff = aDate.getTime() - bDate.getTime();
        if (dateDiff !== 0) return dateDiff;
      }

      if (sortByNear) {
        const distanceDiff = a.distance - b.distance;
        if (distanceDiff !== 0) return distanceDiff;
      }

      // Fallback when both toggles are off: keep a predictable upcoming-date order.
      if (!sortBySoon && !sortByNear) {
        if (aUpcoming && !bUpcoming) return -1;
        if (!aUpcoming && bUpcoming) return 1;
        return aDate.getTime() - bDate.getTime();
      }

      return 0;
    });
  }, [retreats, sortByNear, sortBySoon, userLocation]);

  const formatPrice = (price: number) => (price === 0 ? 'Безплатно' : `${price.toFixed(2)} лв.`);

  if (retreats.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-primary/30 bg-linear-to-br from-primary/10 via-background to-secondary/10 p-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-foreground">Още няма създадени рийтрийти</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Когато бизнесите публикуват нови рийтрийти, те ще се появят тук. Провери отново по-късно.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 rounded-full border border-border bg-background p-1">
        <Button
          type="button"
          size="sm"
          variant={sortByNear ? 'default' : 'ghost'}
          className="rounded-full"
          onClick={() => setSortByNear((prev) => !prev)}
        >
          <LocateFixed className="mr-1 h-4 w-4" /> Най-близко
        </Button>
        <Button
          type="button"
          size="sm"
          variant={sortBySoon ? 'default' : 'ghost'}
          className="rounded-full"
          onClick={() => setSortBySoon((prev) => !prev)}
        >
          <CalendarDays className="mr-1 h-4 w-4" /> Най-скорошни
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sortedRetreats.map(({ retreat, distance }) => (
          <article key={retreat.id} className="overflow-hidden rounded-2xl border border-border bg-background">
            <Link href={`/retreats/${retreat.id}`} className="block">
              <div className="relative aspect-[16/10] bg-muted">
                {retreat.images[0] ? <img src={retreat.images[0]} alt={retreat.title} className="h-full w-full object-cover" /> : null}
              </div>
            </Link>
            <div className="space-y-3 p-4">
              <Link href={`/retreats/${retreat.id}`} className="font-display text-lg font-semibold text-foreground hover:text-primary">
                {retreat.title}
              </Link>
              <p className="line-clamp-2 text-sm text-muted-foreground">{retreat.description}</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {new Date(retreat.startDate).toLocaleDateString('bg-BG')} - {new Date(retreat.endDate).toLocaleDateString('bg-BG')}
                </p>
                <p className="flex items-center gap-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  {retreat.duration}
                </p>
                <p className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {retreat.address}
                </p>
                {sortByNear && Number.isFinite(distance) ? (
                  <p className="text-xs text-primary">На {distance.toFixed(1)} км от теб</p>
                ) : null}
                <p className="text-xs">Записани: {retreat.enrolled} / {retreat.maxCapacity}</p>
                <p className="text-xs">Свободни места: {Math.max(retreat.maxCapacity - retreat.enrolled, 0)}</p>
                <p className="text-sm font-medium text-foreground">{formatPrice(retreat.price)}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {retreat.activities.slice(0, 3).map((activity) => (
                  <Badge key={activity} variant="outline">
                    {activity}
                  </Badge>
                ))}
              </div>
              <RetreatSignupButton
                retreatId={retreat.id}
                enrolled={retreat.enrolled}
                maxCapacity={retreat.maxCapacity}
                isEnrolled={retreat.isEnrolled}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
