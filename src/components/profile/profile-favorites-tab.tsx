import Link from 'next/link';
import { CalendarDays, CreditCard, Heart, MapPin, Sparkles, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import type { Studio } from '@/data/mock-data';
import { mockClasses, mockSchedule, mockSubscriptions } from '@/data/mock-data';

interface ProfileFavoritesTabProps {
  favoriteStudios: Studio[];
  showEmptyFavorites: boolean;
  onToggleEmptyFavorites: () => void;
  onRemoveFavorite: (studioId: string) => void;
}

export const ProfileFavoritesTab = ({
  favoriteStudios,
  showEmptyFavorites,
  onToggleEmptyFavorites,
  onRemoveFavorite,
}: ProfileFavoritesTabProps) => (
  <TabsContent value="favorites" className="space-y-4">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-muted-foreground">{favoriteStudios.length} любими студиа</p>
      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={onToggleEmptyFavorites}>
        {showEmptyFavorites ? 'Покажи данни' : 'Покажи празно'}
      </Button>
    </div>

    {favoriteStudios.length === 0 ? (
      <div className="text-center py-16">
        <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="font-display text-xl font-semibold text-foreground mb-2">Няма любими студиа</h3>
        <p className="text-muted-foreground mb-6">
          Натиснете {'\u2764\uFE0F'} на студио, за да го добавите тук.
        </p>
        <Button asChild variant="outline">
          <Link href="/discover">Открий студио</Link>
        </Button>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {favoriteStudios.map((studio) => {
          const scheduleCount = mockSchedule.filter((s) => s.studioId === studio.id).length;
          const eventsCount = mockClasses.filter((c) => c.studioId === studio.id).length;
          const subscription = mockSubscriptions.find((s) => s.studioId === studio.id);

          return (
            <Card key={studio.id} className="group overflow-hidden hover:shadow-md transition-all duration-200 hover:border-primary/30">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-28 sm:w-36 bg-gradient-to-br from-sage/40 to-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-4xl">{'\u{1F9D8}'}</span>
                  </div>
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/studio/${studio.id}`} className="min-w-0">
                        <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {studio.name}
                        </h3>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          onRemoveFavorite(studio.id);
                          toast.success('Премахнато от любими');
                        }}
                        className="shrink-0 p-1.5 rounded-full hover:bg-muted transition-colors"
                      >
                        <Heart className="h-4 w-4 fill-destructive text-destructive" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{studio.address}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                        <span className="text-sm font-medium text-foreground">{studio.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">({studio.reviewCount} ревюта)</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm" className="h-8 gap-1.5 px-2.5 text-xs font-medium" asChild>
                        <Link href={`/studio/${studio.id}?tab=schedule`}>
                          <CalendarDays className="h-3.5 w-3.5" />
                          Разписание
                          {scheduleCount > 0 && (
                            <span className="ml-0.5 rounded-md bg-background/80 px-1.5 py-0 text-[10px] tabular-nums">
                              {scheduleCount}
                            </span>
                          )}
                        </Link>
                      </Button>
                      <Button variant="secondary" size="sm" className="h-8 gap-1.5 px-2.5 text-xs font-medium" asChild>
                        <Link href={`/studio/${studio.id}?tab=events`}>
                          <Sparkles className="h-3.5 w-3.5" />
                          Събития
                          {eventsCount > 0 && (
                            <span className="ml-0.5 rounded-md bg-background/80 px-1.5 py-0 text-[10px] tabular-nums">
                              {eventsCount}
                            </span>
                          )}
                        </Link>
                      </Button>
                      <Button variant="secondary" size="sm" className="h-8 gap-1.5 px-2.5 text-xs font-medium" asChild>
                        <Link
                          href={
                            subscription?.hasMonthlySubscription
                              ? `/studio/${studio.id}?tab=schedule#studio-subscription`
                              : `/studio/${studio.id}?tab=schedule`
                          }
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          Абонамент
                          {subscription?.hasMonthlySubscription && (
                            <span className="ml-0.5 rounded-md bg-primary/15 px-1.5 py-0 text-[10px] font-medium text-primary">
                              активен
                            </span>
                          )}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    )}
  </TabsContent>
);
