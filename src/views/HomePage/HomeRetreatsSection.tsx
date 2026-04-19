'use client';

import Link from 'next/link';
import { ArrowRight, CalendarDays, Clock3, MapPin, Palmtree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { HomeRetreat } from '@/lib/home/home-data';

export default function HomeRetreatsSection({ retreats }: { retreats: HomeRetreat[] }) {
  if (retreats.length === 0) return null;

  return (
    <section className="bg-card py-20">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/15 p-2">
              <Palmtree className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Последни рийтрийти</h2>
              <p className="text-muted-foreground">Най-новите 5 публикувани рийтрийта.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {retreats.map((retreat) => (
            <article key={retreat.id} className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
              <Link href={`/retreats/${retreat.id}`} className="block">
                <div className="relative aspect-[16/10] bg-muted">
                  {retreat.images[0] ? (
                    <img src={retreat.images[0]} alt={retreat.title} className="h-full w-full object-cover" loading="lazy" />
                  ) : null}
                </div>
              </Link>
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/retreats/${retreat.id}`} className="font-display text-lg font-semibold hover:text-primary">
                    {retreat.title}
                  </Link>
                  <Badge variant="secondary">{retreat.studioName}</Badge>
                </div>
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
                  <p className="text-xs">
                    Свободни места: {Math.max(retreat.maxCapacity - retreat.enrolled, 0)} / {retreat.maxCapacity}
                  </p>
                  <p className="font-medium text-foreground">{retreat.price === 0 ? 'Безплатно' : `${retreat.price.toFixed(2)} лв.`}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {retreat.activities.slice(0, 3).map((activity) => (
                    <Badge key={activity} variant="outline">
                      {activity}
                    </Badge>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/retreats">
              Виж всички рийтрийти <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
