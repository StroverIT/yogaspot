import { useState } from 'react';
import { mockStudios, mockClasses, mockInstructors, mockSchedule, mockSubscriptions, WEEKDAYS } from "@/data/mock-data";
import { Heart, Star, MapPin, Users, Clock, Search, ArrowRight, CreditCard, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useFavorites } from '@/hooks/useFavorites';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Favorites = () => {
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [showMock, setShowMock] = useState(favoriteIds.length === 0);

  // Mock favorites for demo
  const mockFavoriteIds = ['s1', 's3', 's4'];
  const activeIds = showMock ? mockFavoriteIds : favoriteIds;
  const favoriteStudios = mockStudios.filter(s => activeIds.includes(s.id));

  const handleRemove = (studioId: string) => {
    if (!showMock) {
      toggleFavorite(studioId);
    }
    toast.success('Премахнато от любими');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/8 via-background to-sage/15 border-b border-border">
        <div className="container mx-auto px-4 py-10">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
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
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => setShowMock(!showMock)}
              >
                {showMock ? 'Покажи реални' : 'Покажи демо'}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {favoriteStudios.length === 0 ? (
          /* ─── Empty State ─── */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 max-w-md mx-auto"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Heart className="h-9 w-9 text-muted-foreground/40" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Няма любими студиа</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Все още не сте запазили нито едно студио. Разгледайте нашия каталог и натиснете сърчицето, за да добавите студио в любими.
            </p>
            <Button asChild size="lg" className="rounded-xl gap-2">
              <Link to="/discover"><Search className="h-4 w-4" /> Открий студио</Link>
            </Button>
          </motion.div>
        ) : (
          /* ─── Favorites Grid ─── */
          <div className="space-y-6">
            {favoriteStudios.map((studio, i) => {
              const schedule = mockSchedule.filter(s => s.studioId === studio.id);
              const classes = mockClasses.filter(c => c.studioId === studio.id);
              const instructors = mockInstructors.filter(ins => ins.studioId === studio.id);
              const subscription = mockSubscriptions.find(s => s.studioId === studio.id);
              const nextDays = WEEKDAYS.filter(d => schedule.some(s => s.day === d)).slice(0, 3);

              return (
                <motion.div
                  key={studio.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <Link to={`/studio/${studio.id}`} className="md:w-64 shrink-0">
                      <div className="aspect-[16/10] md:aspect-auto md:h-full bg-gradient-to-br from-sage/40 via-primary/15 to-warm/30 flex items-center justify-center relative">
                        <span className="text-6xl group-hover:scale-110 transition-transform">🧘</span>
                        {subscription?.hasMonthlySubscription && (
                          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/90 text-xs font-medium text-primary-foreground">
                            <CreditCard className="h-3 w-3" /> Абонамент
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="flex-1 p-5 md:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <Link to={`/studio/${studio.id}`} className="group">
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
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemove(studio.id)}
                          className="p-2 rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors shrink-0"
                        >
                          <Heart className="h-4 w-4 fill-destructive text-destructive" />
                        </motion.button>
                      </div>

                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{studio.description}</p>

                      {/* Quick stats */}
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

                      {/* Next schedule preview */}
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

                      {/* Action */}
                      <div className="mt-4">
                        <Button asChild variant="outline" size="sm" className="rounded-lg gap-1">
                          <Link to={`/studio/${studio.id}`}>Виж разписание <ArrowRight className="h-3.5 w-3.5" /></Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
