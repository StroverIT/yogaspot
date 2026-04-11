import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  Heart,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import type {
  Instructor,
  ScheduleEntry,
  Studio,
  StudioSubscription,
} from "@/data/mock-data";
import { WEEKDAYS } from "@/data/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatMonthlyDualFromBgn } from "@/lib/eur-bgn";
import { getStudioCoverSrc } from "@/lib/studio-cover-src";

export type FavoriteStudioDetailBundle = {
  schedule: ScheduleEntry[];
  instructors: Instructor[];
  subscription: StudioSubscription | null;
};

type FavoriteStudioCardProps = {
  studio: Studio;
  bundle: FavoriteStudioDetailBundle | undefined;
  onRemove: (studioId: string) => void;
};

export function FavoriteStudioCard({ studio, bundle, onRemove }: FavoriteStudioCardProps) {
  const schedule = bundle?.schedule ?? [];
  const instructors = bundle?.instructors ?? [];
  const subscription = bundle?.subscription ?? undefined;
  const nextDays = WEEKDAYS.filter((d) => schedule.some((s) => s.day === d)).slice(0, 3);
  const coverSrc = getStudioCoverSrc(studio);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex min-w-0 flex-col md:flex-row">
        <Link
          href={`/studio/${studio.id}`}
          className="relative block w-full max-w-full shrink-0 overflow-hidden md:w-64 md:max-w-[16rem] md:self-stretch min-w-0"
        >
          <div className="aspect-[16/10] w-full max-w-full md:h-full md:min-h-[220px] relative overflow-hidden bg-muted">
            <img
              src={coverSrc}
              alt={studio.name}
              className="absolute inset-0 box-border h-full w-full max-h-full max-w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            {subscription?.hasMonthlySubscription && (
              <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/90 text-xs font-medium text-primary-foreground z-[1]">
                <CreditCard className="h-3 w-3" /> Абонамент
              </div>
            )}
          </div>
        </Link>

        <div className="min-w-0 flex-1 p-5 md:p-6">
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
              onClick={() => onRemove(studio.id)}
              className="p-2 rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors shrink-0 transition-transform hover:scale-110 active:scale-95"
              aria-label="Премахни от любими"
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
                <CreditCard className="h-3 w-3" /> {formatMonthlyDualFromBgn(subscription.monthlyPrice ?? 0)}
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
                  {nextDays.map((day) => {
                    const dayEntries = schedule
                      .filter((s) => s.day === day)
                      .sort((a, b) => a.startTime.localeCompare(b.startTime));
                    return dayEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 text-xs"
                      >
                        <span className="font-semibold text-foreground">{day.slice(0, 3)}</span>
                        <span className="text-muted-foreground">
                          {entry.startTime}–{entry.endTime}
                        </span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {entry.yogaType}
                        </Badge>
                      </div>
                    ));
                  })}
                </div>
              </div>
            </>
          )}

          <div className="mt-4">
            <Button asChild variant="outline" size="sm" className="rounded-lg gap-1">
              <Link href={`/studio/${studio.id}`}>
                Виж разписание <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
