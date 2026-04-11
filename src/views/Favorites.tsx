import { useState, useEffect, useMemo } from "react";
import type { Instructor, ScheduleEntry, Studio, StudioSubscription } from "@/data/mock-data";
import { WEEKDAYS } from "@/data/mock-data";
import { Heart, Star, MapPin, Users, Search, ArrowRight, CreditCard, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useFavorites } from '@/hooks/useFavorites';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

type StudioDetailBundle = {
  schedule: ScheduleEntry[];
  instructors: Instructor[];
  subscription: StudioSubscription | null;
};

const Favorites = () => {
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [catalogStudios, setCatalogStudios] = useState<Studio[]>([]);
  const [detailsById, setDetailsById] = useState<Record<string, StudioDetailBundle>>({});

  useEffect(() => {
    fetch('/api/public/studios')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j: { studios: Studio[] }) => setCatalogStudios(j.studios ?? []))
      .catch(() => setCatalogStudios([]));
  }, []);

  useEffect(() => {
    if (!favoriteIds.length) {
      setDetailsById({});
      return;
    }
    let cancelled = false;
    Promise.all(
      favoriteIds.map((id) =>
        fetch(`/api/public/studios/${encodeURIComponent(id)}`).then((r) =>
          r.ok ? (r.json() as Promise<StudioDetailBundle & { studio: Studio }>) : null,
        ),
      ),
    ).then((rows) => {
      if (cancelled) return;
      const next: Record<string, StudioDetailBundle> = {};
      rows.forEach((row, i) => {
        const id = favoriteIds[i];
        if (row && id) {
          next[id] = {
            schedule: row.schedule ?? [],
            instructors: row.instructors ?? [],
            subscription: row.subscription ?? null,
          };
        }
      });
      setDetailsById(next);
    });
    return () => {
      cancelled = true;
    };
  }, [favoriteIds]);

  const favoriteStudios = useMemo(
    () => favoriteIds.map((id) => catalogStudios.find((s) => s.id === id)).filter(Boolean) as Studio[],
    [favoriteIds, catalogStudios],
  );

  const handleRemove = (studioId: string) => {
    toggleFavorite(studioId);
    toast.success('Премахнато от любими');
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-primary/8 via-background to-sage/15 border-b border-border">
        <div className="container mx-auto px-4 py-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Вашата колекция</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1">Любими студиа</h1>
                <p className="text-muted-foreground">
                  {favoriteStudios.length > 0
                    ? `${favoriteStudios.length} ${favoriteStudios.length === 1 ? 'запазено студио' : 'запазени студиа'}`
                    : 'Вашите запазени студиа на едно място'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {favoriteStudios.length === 0 ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Heart className="h-9 w-9 text-muted-foreground/40" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Няма любими студиа</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Все още не сте запазили нито едно студио. Разгледайте нашия каталог и натиснете сърчицето, за да добавите студио в любими.
            </p>
            <Button asChild size="lg" className="rounded-xl gap-2">
              <Link href="/discover"><Search className="h-4 w-4" /> Открий студио</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {favoriteStudios.map((studio) => {
              const bundle = detailsById[studio.id];
              const schedule = bundle?.schedule ?? [];
              const instructors = bundle?.instructors ?? [];
              const subscription = bundle?.subscription ?? undefined;
              const nextDays = WEEKDAYS.filter(d => schedule.some(s => s.day === d)).slice(0, 3);

              return (
                <div
                  key={studio.id}
                  className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    <Link href={`/studio/${studio.id}`} className="md:w-64 shrink-0">
                      <div className="aspect-[16/10] md:aspect-auto md:h-full bg-gradient-to-br from-sage/40 via-primary/15 to-warm/30 flex items-center justify-center relative">
                        <span className="text-6xl group-hover:scale-110 transition-transform">🧘</span>
                        {subscription?.hasMonthlySubscription && (
                          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/90 text-xs font-medium text-primary-foreground">
                            <CreditCard className="h-3 w-3" /> Абонамент
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="flex-1 p-5 md:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/studio/${studio.id}`} className="group">
                          <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                            {studio.name}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span>{studio.address}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                              <span className="text-sm font-semibold text-foreground">{studio.rating}</span>
                              <span className="text-xs text-muted-foreground">({studio.reviewCount})</span>
                            </div>
                          </div>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleRemove(studio.id)}
                          className="p-2 rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors shrink-0 transition-transform hover:scale-110 active:scale-95"
                        >
                          <Heart className="h-4 w-4 fill-destructive text-destructive" />
                        </button>
                      </div>

                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{studio.description}</p>

                      <div className="flex flex-wrap items-center gap-3 mt-4">
                        <Badge variant="secondary" className="rounded-full gap-1 text-xs">
                          <CalendarDays className="h-3 w-3" /> {schedule.length} часа/седмица
                        </Badge>
                        <Badge variant="secondary" className="rounded-full gap-1 text-xs">
                          <Users className="h-3 w-3" /> {instructors.length} инструктора
                        </Badge>
                        {subscription?.hasMonthlySubscription && (
                          <Badge variant="outline" className="rounded-full gap-1 text-xs text-primary border-primary/30">
                            <CreditCard className="h-3 w-3" /> {subscription.monthlyPrice} лв./мес.
                          </Badge>
                        )}
                        <div className="flex gap-1.5 ml-auto">
                          {studio.amenities.parking && <span className="text-xs" title="Паркинг">🅿️</span>}
                          {studio.amenities.shower && <span className="text-xs" title="Душ">🚿</span>}
                          {studio.amenities.changingRoom && <span className="text-xs" title="Съблекалня">👔</span>}
                          {studio.amenities.equipmentRental && <span className="text-xs" title="Оборудване">🧘</span>}
                        </div>
                      </div>

                      {nextDays.length > 0 && (
                        <>
                          <Separator className="my-4" />
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Предстоящи часове:</p>
                            <div className="flex flex-wrap gap-2">
                              {nextDays.map(day => {
                                const dayEntries = schedule.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
                                return dayEntries.map(entry => (
                                  <div key={entry.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 text-xs">
                                    <span className="font-semibold text-foreground">{day.slice(0, 3)}</span>
                                    <span className="text-muted-foreground">{entry.startTime}–{entry.endTime}</span>
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{entry.yogaType}</Badge>
                                  </div>
                                ));
                              })}
                            </div>
                          </div>
                        </>
                      )}

                      <div className="mt-4">
                        <Button asChild variant="outline" size="sm" className="rounded-lg gap-1">
                          <Link href={`/studio/${studio.id}`}>Виж разписание <ArrowRight className="h-3.5 w-3.5" /></Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
