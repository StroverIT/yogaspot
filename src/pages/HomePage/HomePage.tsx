"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockStudios, mockClasses, mockReviews, mockInstructors, YOGA_TYPES } from '@/data/mock-data';
import { Star, MapPin, ArrowRight, Sparkles, Heart, Users, Clock, Search, ChevronRight, Quote, Shield, Zap, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { toast } from 'sonner';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';

const getStudioImageSrc = (studioId: string) => `/homepage/studio-${studioId.slice(1)}.jpg`;

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();

  const topStudios = useMemo(
    () => [...mockStudios].sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount).slice(0, 6),
    []
  );

  const upcomingClasses = useMemo(
    () => [...mockClasses].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4),
    []
  );

  const handleFavorite = (e: React.MouseEvent, studioId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { setAuthModalOpen(true); return; }
    const added = toggleFavorite(studioId);
    toast.success(added ? 'Добавено в любими' : 'Премахнато от любими');
  };

  const getStudio = (id: string) => mockStudios.find(s => s.id === id);
  const getInstructor = (id: string) => mockInstructors.find(i => i.id === id);
  const totalEnrolled = mockClasses.reduce((s, c) => s + c.enrolled, 0);

  return (
    <div className="font-body">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0">
          <Image src="/homepage/hero-yoga.jpg" alt="Yoga studio" fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <Badge variant="secondary" className="mb-5 rounded-full px-4 py-1.5 text-sm gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Водещата йога платформа в България
              </Badge>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-6">
                Твоята практика.<br />
                <span className="text-primary">Твоят ритъм.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
                Открий идеалното студио за теб — от виняса до кундалини. Разгледай реални отзиви, сравни разписания и запази място за секунди.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="text-base px-8 py-6 rounded-xl gap-2">
                  <Link href="/discover"><Search className="h-4 w-4" /> Открий студио</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base px-8 py-6 rounded-xl">
                  <Link href="/auth">Добави своето студио <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </div>
            </motion.div>

            {/* Right — quick stats + mini cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: `${mockStudios.length}+`, label: 'Партньорски студиа', icon: <MapPin className="h-5 w-5" /> },
                  { value: `${mockClasses.length}+`, label: 'Седмични класове', icon: <Clock className="h-5 w-5" /> },
                  { value: `${totalEnrolled}+`, label: 'Доволни практикуващи', icon: <Users className="h-5 w-5" /> },
                  { value: '4.7', label: 'Средна оценка', icon: <Star className="h-5 w-5" /> },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="text-primary mb-2">{stat.icon}</div>
                    <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── YOGA TYPE CATEGORIES ─── */}
      <section className="py-10 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-sm font-medium text-muted-foreground shrink-0">Популярни:</span>
            {YOGA_TYPES.slice(0, 8).map(type => (
              <Link
                key={type}
                href={`/discover?type=${type}`}
                className="shrink-0 px-4 py-2 rounded-full border border-border bg-background text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-all"
              >
                {type}
              </Link>
            ))}
            <Link href="/discover" className="shrink-0 flex items-center gap-1 px-4 py-2 text-sm font-medium text-primary hover:underline">
              Виж всички <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── VALUE PROPOSITIONS ─── */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Search className="h-6 w-6" />, title: 'Умно търсене', desc: 'Филтри по стил, ниво, квартал и ценови диапазон — за да намериш точно своя клас.' },
              { icon: <Shield className="h-6 w-6" />, title: 'Верифицирани студиа', desc: 'Само проверени пространства с реални снимки и автентични отзиви от общността.' },
              { icon: <Zap className="h-6 w-6" />, title: 'Резервация за секунди', desc: 'Избери час, потвърди и готово. Без телефонни обаждания, без изчакване.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="flex gap-4"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TOP STUDIOS ─── */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Badge variant="secondary" className="rounded-full mb-3">Препоръчани</Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Студиа, които ще обикнеш</h2>
              <p className="text-muted-foreground">Избрани от общността с най-много положителни отзиви</p>
            </div>
            <Button asChild variant="outline" className="hidden md:flex rounded-full gap-1">
              <Link href="/discover">Виж всички <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 4500, disableOnInteraction: true }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="studios-swiper !pb-12"
          >
            {topStudios.map((studio) => {
              const classes = mockClasses.filter(c => c.studioId === studio.id);
              const fav = isFavorite(studio.id);
              return (
                <SwiperSlide key={studio.id} className="h-auto">
                  <div className="relative group h-full">
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleFavorite(e, studio.id)}
                      className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-sm"
                    >
                      <Heart className={`h-4 w-4 transition-colors ${fav ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
                    </motion.button>
                    <Link href={`/studio/${studio.id}`} className="block h-full">
                      <div className="rounded-2xl border border-border bg-background overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                        <div className="aspect-[16/10] relative overflow-hidden">
                          <Image
                            src={getStudioImageSrc(studio.id)}
                            alt={studio.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute bottom-3 left-3 flex gap-2">
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium">
                              <Users className="h-3 w-3 text-primary" /> {classes.length} класа
                            </span>
                          </div>
                          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/90 text-xs font-bold text-accent-foreground">
                            <Star className="h-3 w-3 fill-current" /> {studio.rating}
                          </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                            {studio.name}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{studio.address}</span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{studio.description}</p>
                          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                            <span className="text-xs text-muted-foreground">{studio.reviewCount} ревюта</span>
                            <span className="text-muted-foreground/30">·</span>
                            <div className="flex gap-1.5">
                              {studio.amenities.parking && <span className="text-xs" title="Паркинг">🅿️</span>}
                              {studio.amenities.shower && <span className="text-xs" title="Душ">🚿</span>}
                              {studio.amenities.changingRoom && <span className="text-xs" title="Съблекалня">👔</span>}
                              {studio.amenities.equipmentRental && <span className="text-xs" title="Оборудване">🧘</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          <div className="text-center mt-4 md:hidden">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/discover">Виж всички студиа <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── UPCOMING CLASSES ─── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Badge variant="secondary" className="rounded-full mb-3">Скоро</Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Следващите ти класове</h2>
              <p className="text-muted-foreground">Намери свободно място и се включи още тази седмица</p>
            </div>
            <Button asChild variant="outline" className="hidden md:flex rounded-full gap-1">
              <Link href="/discover">Виж всички <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingClasses.map((cls, i) => {
              const studio = getStudio(cls.studioId);
              const instructor = getInstructor(cls.instructorId);
              const isFull = cls.enrolled >= cls.maxCapacity;
              return (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -15 : 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link href={`/studio/${cls.studioId}`}>
                    <div className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-all hover:-translate-y-0.5 flex gap-4">
                      {/* Date block */}
                      <div className="shrink-0 w-16 h-16 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                        <span className="text-xs text-primary font-medium uppercase">
                          {new Date(cls.date).toLocaleDateString('bg-BG', { month: 'short' })}
                        </span>
                        <span className="font-display text-xl font-bold text-foreground">
                          {new Date(cls.date).getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-foreground">{cls.name}</h3>
                            <p className="text-sm text-muted-foreground">{studio?.name} · {instructor?.name}</p>
                          </div>
                          <Badge variant={isFull ? 'destructive' : 'secondary'} className="shrink-0 rounded-full text-xs">
                            {isFull ? 'Пълен' : `${cls.enrolled}/${cls.maxCapacity}`}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {cls.startTime}–{cls.endTime}</span>
                          <span>{cls.price} лв.</span>
                          <Badge variant="outline" className="rounded-full text-xs">{cls.yogaType}</Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">Как да започнеш?</h2>
            <p className="text-muted-foreground text-lg">От търсене до постелка — само три стъпки</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: <Eye className="h-7 w-7" />, title: 'Разгледай', desc: 'Преглеждай студиа по стил йога, квартал, ценови клас и ниво — всичко на едно място.', step: '1' },
              { icon: <Heart className="h-7 w-7" />, title: 'Сравни и избери', desc: 'Прочети отзиви, разгледай снимки и запази любимите си студиа за по-лесен достъп.', step: '2' },
              { icon: <Users className="h-7 w-7" />, title: 'Запиши се', desc: 'Резервирай място онлайн и просто се появи на практика — толкова е лесно.', step: '3' },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="text-center relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.15 }}
              >
                <div className="relative inline-block mb-5">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">{step.icon}</div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">{step.step}</span>
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOR STUDIOS CTA ─── */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-sage/15 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-4xl mx-auto">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Притежаваш йога студио?</h2>
              <p className="text-muted-foreground max-w-md">
                Покажи пространството си на хиляди йога ентусиасти. Управлявай разписание, инструктори и резервации — всичко от едно табло.
              </p>
            </div>
            <Button asChild size="lg" className="text-base px-8 py-6 rounded-xl shrink-0">
              <Link href="/auth">Добави студио безплатно <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default Index;
