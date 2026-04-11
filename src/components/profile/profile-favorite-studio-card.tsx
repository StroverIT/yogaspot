import Link from 'next/link';
import { CalendarDays, CreditCard, ExternalLink, Heart, Mail, MapPin, Phone, Sparkles, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DifficultyBadge } from '@/components/studio-detail/difficulty-badge';
import { STUDIO_AMENITY_LABELS } from '@/components/studio-detail/studio-detail-summary';
import {
  mockClasses,
  mockInstructors,
  mockSchedule,
  mockSubscriptions,
  WEEKDAYS,
  type Studio,
} from '@/data/mock-data';
import { formatMonthlyDualFromBgn, formatPriceDualFromBgn } from '@/lib/eur-bgn';

interface ProfileFavoriteStudioCardProps {
  studio: Studio;
  onRemoveFavorite: (studioId: string) => void;
}

export function ProfileFavoriteStudioCard({ studio, onRemoveFavorite }: ProfileFavoriteStudioCardProps) {
  const scheduleEntries = mockSchedule.filter((s) => s.studioId === studio.id);
  const events = mockClasses.filter((c) => c.studioId === studio.id);
  const subscription = mockSubscriptions.find((s) => s.studioId === studio.id);

  return (
    <Card className="overflow-hidden border-border/80 shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="flex shrink-0 items-center justify-center bg-gradient-to-br from-sage/40 to-primary/20 px-6 py-8 sm:w-36 sm:flex-col sm:px-0">
            <span className="text-5xl sm:text-4xl">{'\u{1F9D8}'}</span>
          </div>

          <div className="min-w-0 flex-1 border-t border-border/60 p-4 sm:border-l sm:border-t-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link href={`/studio/${studio.id}`} className="group inline-block">
                  <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary sm:text-xl">
                    {studio.name}
                  </h3>
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex min-w-0 items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{studio.address}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                    <span className="font-medium text-foreground">{studio.rating}</span>
                    <span>({studio.reviewCount} ревюта)</span>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onRemoveFavorite(studio.id);
                  toast.success('Премахнато от любими');
                }}
                className="shrink-0 rounded-full p-1.5 hover:bg-muted"
                aria-label="Премахни от любими"
              >
                <Heart className="h-4 w-4 fill-destructive text-destructive" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
              <a href={`tel:${studio.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                {studio.phone}
              </a>
              <a href={`mailto:${studio.email}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{studio.email}</span>
              </a>
              {studio.website && (
                <a
                  href={studio.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  Сайт
                </a>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(studio.amenities)
                .filter(([, v]) => v)
                .map(([key]) => (
                  <Badge key={key} variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-normal">
                    {STUDIO_AMENITY_LABELS[key]}
                  </Badge>
                ))}
            </div>

            <Separator className="my-4" />

            <section className="space-y-2">
              <h4 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                <CreditCard className="h-4 w-4 text-primary" />
                Абонамент
              </h4>
              {subscription?.hasMonthlySubscription ? (
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground leading-snug">{formatMonthlyDualFromBgn(subscription.monthlyPrice ?? 0)}</span>
                  {subscription.subscriptionNote && (
                    <span className="mt-1 block text-muted-foreground">{subscription.subscriptionNote}</span>
                  )}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Няма публикуван месечен абонамент за това студио.</p>
              )}
            </section>

            <Separator className="my-4" />

            <section className="space-y-2">
              <h4 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                <CalendarDays className="h-4 w-4 text-primary" />
                Разписание
              </h4>
              {scheduleEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">Няма записано седмично разписание.</p>
              ) : (
                <div className="space-y-2 text-sm">
                  {WEEKDAYS.map((day) => {
                    const dayEntries = scheduleEntries
                      .filter((e) => e.day === day)
                      .sort((a, b) => a.startTime.localeCompare(b.startTime));
                    if (dayEntries.length === 0) return null;
                    return (
                      <p key={day} className="leading-relaxed text-foreground/90">
                        <span className="font-medium text-foreground">{day}:</span>{' '}
                        {dayEntries.map((entry, idx) => {
                          const instructor = mockInstructors.find((i) => i.id === entry.instructorId);
                          return (
                            <span key={entry.id}>
                              {idx > 0 && <span className="text-muted-foreground"> · </span>}
                              <span className="whitespace-nowrap">
                                {entry.startTime}–{entry.endTime}
                              </span>{' '}
                              <span>{entry.className}</span>
                              <span className="text-muted-foreground"> (</span>
                              {entry.yogaType}
                              <span className="text-muted-foreground">, </span>
                              <DifficultyBadge difficulty={entry.difficulty} />
                              <span className="text-muted-foreground">)</span>
                              {instructor && <span className="text-muted-foreground"> — {instructor.name}</span>}
                              <span className="text-muted-foreground">
                                , {formatPriceDualFromBgn(entry.price)}, {entry.maxCapacity} места
                              </span>
                            </span>
                          );
                        })}
                      </p>
                    );
                  })}
                </div>
              )}
            </section>

            <Separator className="my-4" />

            <section className="space-y-2">
              <h4 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Събития
              </h4>
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground">Няма предстоящи събития.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {events.map((cls) => {
                    const instructor = mockInstructors.find((i) => i.id === cls.instructorId);
                    return (
                      <li key={cls.id} className="flex flex-wrap items-baseline gap-x-1 gap-y-1 leading-relaxed text-foreground/90">
                        <span className="font-medium tabular-nums text-foreground">{cls.date}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="whitespace-nowrap tabular-nums">
                          {cls.startTime}–{cls.endTime}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span>{cls.name}</span>
                        <span className="text-muted-foreground">·</span>
                        <Badge variant="outline" className="text-xs font-normal">
                          {cls.yogaType}
                        </Badge>
                        <DifficultyBadge difficulty={cls.difficulty} />
                        {instructor && (
                          <>
                            <span className="text-muted-foreground"> · </span>
                            <span className="text-muted-foreground">{instructor.name}</span>
                          </>
                        )}
                        <span className="text-muted-foreground">
                          {' '}
                          · {formatPriceDualFromBgn(cls.price)} · {cls.enrolled}/{cls.maxCapacity}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="text-xs" asChild>
                <Link href={`/studio/${studio.id}`}>
                  Пълна страница на студиото
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
