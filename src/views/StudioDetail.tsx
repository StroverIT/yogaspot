import Link from "next/link";
import { useParams } from "next/navigation";
import { mockStudios, mockInstructors, mockClasses, mockReviews, mockSchedule, mockSubscriptions, WEEKDAYS } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin, Phone, Mail, Globe, Clock, Users, ArrowLeft, ChevronLeft, ChevronRight, Heart, CalendarDays, CreditCard, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import type { Swiper as SwiperType } from "swiper";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useFavorites } from '@/hooks/useFavorites';
import AuthModal from '@/components/AuthModal';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Keyboard, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const StudioDetail = () => {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'schedule' | 'classes' | 'instructors' | 'reviews'>('schedule');
  const [gallerySwiper, setGallerySwiper] = useState<SwiperType | null>(null);

  const studio = mockStudios.find(s => s.id === id);
  if (!studio) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <p className="text-lg text-muted-foreground">Студиото не е намерено.</p>
      <Button asChild variant="ghost" className="mt-4"><Link href="/discover">Назад</Link></Button>
    </div>
  );

  const studioInstructors = mockInstructors.filter(i => i.studioId === id);
  const studioClasses = mockClasses.filter(c => c.studioId === id);
  const studioReviews = mockReviews.filter(r => r.targetId === id && r.targetType === 'studio');
  const studioSchedule = mockSchedule.filter(s => s.studioId === id);
  const subscription = mockSubscriptions.find(s => s.studioId === id);

  const handleBook = (classId: string) => {
    if (!isAuthenticated) {
      toast.error('Моля, влезте в акаунта си, за да се запишете.');
      return;
    }
    const cls = studioClasses.find(c => c.id === classId);
    if (!cls) return;
    if (cls.enrolled >= cls.maxCapacity) {
      toast.info('Класът е пълен. Добавени сте в списъка на изчакване.');
    } else {
      toast.success('Успешно се записахте за класа!');
    }
  };

  const amenityLabels: Record<string, string> = {
    parking: '🅿️ Паркинг',
    shower: '🚿 Душ',
    changingRoom: '👔 Съблекалня',
    equipmentRental: '🧘 Оборудване под наем',
  };

  const tabs = [
    { key: 'schedule' as const, label: 'Разписание', count: studioSchedule.length },
    { key: 'classes' as const, label: 'Класове', count: studioClasses.length },
    { key: 'instructors' as const, label: 'Инструктори', count: studioInstructors.length },
    { key: 'reviews' as const, label: 'Ревюта', count: studioReviews.length },
  ];

  const gallerySlides = studio.images.length > 0
    ? studio.images.map((src, index) => ({
      id: `image-${index}`,
      src,
      caption: `Снимка ${index + 1} от ${studio.images.length}`,
    }))
    : [
      { id: 'placeholder-1', src: null, caption: 'Практика' },
      { id: 'placeholder-2', src: null, caption: 'Спокойствие' },
      { id: 'placeholder-3', src: null, caption: 'Баланс' },
    ];

  const placeholderGradients = [
    'from-sage/45 via-primary/15 to-primary/25',
    'from-primary/20 via-sage/30 to-muted/80',
    'from-muted/60 via-sage/35 to-primary/20',
  ] as const;

  const galleryNavBtnClass =
    "group absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white shadow-lg backdrop-blur-md transition-[transform,background-color,border-color,box-shadow] duration-200 hover:scale-[1.06] hover:border-white/45 hover:bg-black/55 hover:shadow-xl active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent md:h-12 md:w-12";

  const galleryCaptionBottom =
    gallerySlides.length > 1 ? "bottom-14 md:bottom-16" : "bottom-11 md:bottom-12";

  const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
    const colors: Record<string, string> = {
      'начинаещ': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
      'среден': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
      'напреднал': 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
    };
    return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${colors[difficulty] || ''}`}>{difficulty}</span>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/discover" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> Обратно към търсене
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2">
          <div
            className="relative mb-6 aspect-video overflow-hidden rounded-2xl border border-border bg-muted shadow-sm
              [&_.swiper]:absolute [&_.swiper]:inset-0 [&_.swiper]:h-full [&_.swiper]:w-full
              [&_.swiper-wrapper]:h-full
              [&_.swiper-slide]:h-full
              [&_.swiper-pagination]:pointer-events-auto [&_.swiper-pagination]:z-10
              [&_.swiper-pagination]:!bottom-4 [&_.swiper-pagination]:!left-0 [&_.swiper-pagination]:!right-0 [&_.swiper-pagination]:!mx-auto [&_.swiper-pagination]:!w-max
              [&_.swiper-pagination]:flex [&_.swiper-pagination]:items-center [&_.swiper-pagination]:justify-center [&_.swiper-pagination]:gap-1.5
              [&_.swiper-pagination]:rounded-full [&_.swiper-pagination]:border [&_.swiper-pagination]:border-primary/25 [&_.swiper-pagination]:bg-black/35
              [&_.swiper-pagination]:px-3.5 [&_.swiper-pagination]:py-2.5 [&_.swiper-pagination]:shadow-lg [&_.swiper-pagination]:backdrop-blur-md
              [&_.swiper-pagination-bullet]:!m-0 [&_.swiper-pagination-bullet]:box-border [&_.swiper-pagination-bullet]:inline-flex
              [&_.swiper-pagination-bullet]:!h-2 [&_.swiper-pagination-bullet]:!w-2 [&_.swiper-pagination-bullet]:!min-h-0 [&_.swiper-pagination-bullet]:!min-w-0
              [&_.swiper-pagination-bullet]:shrink-0 [&_.swiper-pagination-bullet]:cursor-pointer [&_.swiper-pagination-bullet]:!rounded-full [&_.swiper-pagination-bullet]:border-0
              [&_.swiper-pagination-bullet]:!bg-primary [&_.swiper-pagination-bullet]:!opacity-100
              [&_.swiper-pagination-bullet]:transition-all [&_.swiper-pagination-bullet]:duration-300 [&_.swiper-pagination-bullet]:ease-out
              [&_.swiper-pagination-bullet]:hover:bg-primary/70
              [&_.swiper-pagination-bullet]:focus-visible:outline-none [&_.swiper-pagination-bullet]:focus-visible:ring-2 [&_.swiper-pagination-bullet]:focus-visible:ring-primary/55 [&_.swiper-pagination-bullet]:focus-visible:ring-offset-2 [&_.swiper-pagination-bullet]:focus-visible:ring-offset-transparent
              [&_.swiper-pagination-bullet-active]:!h-4 [&_.swiper-pagination-bullet-active]:!w-4 [&_.swiper-pagination-bullet-active]:!rounded-full
              [&_.swiper-pagination-bullet-active]:!bg-primary [&_.swiper-pagination-bullet-active]:shadow-[0_0_12px_-2px_color-mix(in_srgb,var(--primary)_55%,transparent)]
              [&_.swiper-pagination-bullet-active]:hover:bg-primary"
          >
            {gallerySlides.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${galleryNavBtnClass} left-2.5 md:left-4`}
                  aria-label="Предишна снимка"
                  onClick={() => gallerySwiper?.slidePrev()}
                >
                  <ChevronLeft
                    className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-px md:h-6 md:w-6"
                    strokeWidth={2.25}
                    aria-hidden
                  />
                </button>
                <button
                  type="button"
                  className={`${galleryNavBtnClass} right-2.5 md:right-4`}
                  aria-label="Следваща снимка"
                  onClick={() => gallerySwiper?.slideNext()}
                >
                  <ChevronRight
                    className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-px md:h-6 md:w-6"
                    strokeWidth={2.25}
                    aria-hidden
                  />
                </button>
              </>
            )}
            <Swiper
              modules={[Autoplay, Keyboard, Pagination, A11y]}
              loop={gallerySlides.length > 1}
              speed={480}
              grabCursor
              keyboard={{ enabled: true }}
              autoplay={
                gallerySlides.length > 1
                  ? { delay: 5200, disableOnInteraction: true, pauseOnMouseEnter: true }
                  : false
              }
              pagination={
                gallerySlides.length > 1
                  ? { clickable: true, dynamicBullets: gallerySlides.length > 6 }
                  : false
              }
              a11y={{
                enabled: true,
                prevSlideMessage: 'Предишна снимка',
                nextSlideMessage: 'Следваща снимка',
                paginationBulletMessage: 'Отиди към снимка {{index}}',
              }}
              onSwiper={setGallerySwiper}
              className="h-full w-full"
            >
              {gallerySlides.map((slide, index) => (
                <SwiperSlide key={slide.id} className="relative overflow-hidden">
                  {slide.src ? (
                    <>
                      <img
                        src={slide.src}
                        alt={slide.caption}
                        className="h-full w-full object-cover"
                        loading={index === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent"
                        aria-hidden
                      />
                      <p className={`pointer-events-none absolute left-3 right-3 max-w-[85%] text-sm font-medium tracking-tight text-white drop-shadow-md md:text-base ${galleryCaptionBottom}`}>
                        {slide.caption}
                      </p>
                    </>
                  ) : (
                    <div
                      className={`flex h-full w-full items-center justify-center bg-linear-to-br ${placeholderGradients[index % placeholderGradients.length]} relative`}
                    >
                      <span className="text-8xl drop-shadow-sm" aria-hidden>
                        🧘
                      </span>
                      <p className={`pointer-events-none absolute left-3 text-sm font-medium text-foreground/90 drop-shadow-sm md:text-base ${galleryCaptionBottom}`}>
                        {slide.caption}
                      </p>
                    </div>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{studio.name}</h1>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-accent text-accent" />
              <span className="font-semibold text-lg">{studio.rating}</span>
              <span className="text-muted-foreground">({studio.reviewCount} ревюта)</span>
            </div>
          </div>

          <p className="mt-6 text-foreground/80 leading-relaxed">{studio.description}</p>

          <div className="flex flex-wrap gap-2 mt-6">
            {Object.entries(studio.amenities).filter(([, v]) => v).map(([key]) => (
              <Badge key={key} variant="default" className="rounded-full px-3 py-1 text-sm">
                {amenityLabels[key]}
              </Badge>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-10 border-b border-border overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="mt-6">
            {/* Schedule tab */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                {/* Subscription banner */}
                {subscription?.hasMonthlySubscription && (
                  <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-5">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-lg font-semibold text-foreground">Месечен абонамент</h3>
                        <p className="text-sm text-muted-foreground mt-1">{subscription.subscriptionNote}</p>
                        <p className="text-2xl font-bold text-primary mt-2">{subscription.monthlyPrice} лв.<span className="text-sm font-normal text-muted-foreground">/месец</span></p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Weekly schedule */}
                <div className="space-y-3">
                  {WEEKDAYS.map(day => {
                    const entries = studioSchedule.filter(s => s.day === day);
                    if (entries.length === 0) return null;
                    return (
                      <div
                        key={day}
                        className="rounded-xl border border-border bg-card overflow-hidden"
                      >
                        <div className="px-4 py-2.5 bg-muted/50 border-b border-border">
                          <h4 className="font-semibold text-foreground text-sm">{day}</h4>
                        </div>
                        <div className="divide-y divide-border">
                          {entries.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(entry => {
                            const instructor = mockInstructors.find(i => i.id === entry.instructorId);
                            return (
                              <div key={entry.id} className="px-4 py-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="text-center min-w-[50px]">
                                    <p className="text-sm font-bold text-foreground">{entry.startTime}</p>
                                    <p className="text-xs text-muted-foreground">{entry.endTime}</p>
                                  </div>
                                  <Separator orientation="vertical" className="h-8" />
                                  <div>
                                    <p className="font-medium text-foreground text-sm">{entry.className}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <Badge variant="secondary" className="text-xs">{entry.yogaType}</Badge>
                                      <DifficultyBadge difficulty={entry.difficulty} />
                                      {instructor && <span className="text-xs text-muted-foreground">с {instructor.name}</span>}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-foreground">{entry.price} лв.</p>
                                    <p className="text-xs text-muted-foreground">{entry.maxCapacity} места</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="rounded-lg"
                                    onClick={() => {
                                      if (!isAuthenticated) {
                                        toast.error('Моля, влезте, за да се запишете.');
                                        return;
                                      }
                                      toast.success(`Записахте се за ${entry.className}!`);
                                    }}
                                  >
                                    Запиши се
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {studioSchedule.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-40" />
                      <p>Няма добавено разписание за това студио.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'classes' && (
              <div className="space-y-4">
                {studioClasses.length === 0 && <p className="text-muted-foreground">Няма предстоящи класове.</p>}
                {studioClasses.map(cls => {
                  const instructor = mockInstructors.find(i => i.id === cls.instructorId);
                  const isFull = cls.enrolled >= cls.maxCapacity;
                  return (
                    <div key={cls.id} className="rounded-xl border border-border bg-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-display font-semibold text-foreground text-lg">{cls.name}</h4>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{cls.date} | {cls.startTime}–{cls.endTime}</span>
                          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{cls.enrolled}/{cls.maxCapacity}</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{cls.yogaType}</Badge>
                          <Badge variant="outline">{cls.difficulty}</Badge>
                          {instructor && <span className="text-sm text-muted-foreground">с {instructor.name}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-xl text-foreground">{cls.price} лв.</span>
                        <Button onClick={() => handleBook(cls.id)} variant={isFull ? 'outline' : 'default'}>
                          {isFull ? 'Списък за изчакване' : 'Запиши се'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'instructors' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studioInstructors.map(instr => (
                  <div key={instr.id} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-sage/30 flex items-center justify-center text-2xl">🧑‍🏫</div>
                      <div>
                        <h4 className="font-display font-semibold text-foreground">{instr.name}</h4>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                          <span>{instr.rating}</span>
                          <span className="text-muted-foreground">· {instr.experienceLevel}</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{instr.bio}</p>
                    <div className="flex gap-1 mt-3">
                      {instr.yogaStyle.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {studioReviews.length === 0 && <p className="text-muted-foreground">Все още няма ревюта.</p>}
                {studioReviews.map(review => (
                  <div key={review.id} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{review.userName}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, j) => (
                          <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-foreground/80">{review.text}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{review.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Информация</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3"><MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" /><span>{studio.address}</span></div>
              <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary shrink-0" /><span>{studio.phone}</span></div>
              <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary shrink-0" /><span>{studio.email}</span></div>
              {studio.website && (
                <div className="flex items-center gap-3"><Globe className="h-4 w-4 text-primary shrink-0" /><a href={studio.website} target="_blank" className="text-primary hover:underline">Уебсайт</a></div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-3">Локация</h3>
            <div className="aspect-square rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-sm">
              📍 Картата изисква Google Maps API ключ
            </div>
          </div>

          <FavoriteButton studioId={studio.id} />
        </aside>
      </div>
    </div>
  );
};

const FavoriteButton = ({ studioId }: { studioId: string }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const fav = isFavorite(studioId);

  const handleClick = () => {
    if (!isAuthenticated) { setAuthOpen(true); return; }
    const added = toggleFavorite(studioId);
    toast.success(added ? 'Добавено в любими' : 'Премахнато от любими');
  };

  return (
    <>
      <Button
        variant={fav ? 'default' : 'outline'}
        className="w-full"
        onClick={handleClick}
      >
        <Heart className={`h-4 w-4 mr-2 ${fav ? 'fill-current' : ''}`} />
        {fav ? 'В любими' : 'Добави в любими'}
      </Button>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
};

export default StudioDetail;
