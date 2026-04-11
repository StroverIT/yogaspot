"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Studio, YogaClass } from "@/data/mock-data";
import { Star, MapPin, ArrowRight, Heart, Users } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const getStudioImageSrc = (studioId: string) => `/homepage/studio-${studioId.slice(1)}.jpg`;

interface TopStudiosSectionProps {
  studios: Studio[];
  classes: YogaClass[];
  isFavorite: (studioId: string) => boolean;
  onFavorite: (e: React.MouseEvent, studioId: string) => void;
}

export default function TopStudiosSection({ studios, classes, isFavorite, onFavorite }: TopStudiosSectionProps) {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yoga-secondary/20 rounded-full">
              <Star className="w-6 h-6 text-yoga-secondary fill-yoga-secondary" />
            </div>
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Най-добре оценени
              </h2>
              <p className="text-muted-foreground">Студиа с най-висок рейтинг от нашата общност</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                className="top-studios-prev inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent/60 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Предишно студио"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
              </button>
              <button
                className="top-studios-next inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent/60 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Следващо студио"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <Button asChild variant="outline" className="rounded-full gap-1">
              <Link href="/discover">
                Виж всички <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          centeredSlides={false}
          loop={studios.length > 3}
          grabCursor
          keyboard={{ enabled: true }}
          navigation={{
            enabled: true,
            prevEl: ".top-studios-prev",
            nextEl: ".top-studios-next",
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
            bulletClass: "top-studios-bullet",
            bulletActiveClass: "top-studios-bullet-active",
          }}
          autoplay={{
            delay: 5500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={650}
          breakpoints={{
            640: { slidesPerView: 2, slidesPerGroup: 2 },
            1024: { slidesPerView: 3, slidesPerGroup: 3 },
          }}
          className="studios-swiper !pb-14"
        >
          {studios.map((studio) => {
            const studioClasses = classes.filter((c) => c.studioId === studio.id);
            const fav = isFavorite(studio.id);
            return (
              <SwiperSlide key={studio.id} className="h-auto">
                <div className="relative group h-full">
                  <button
                    onClick={(e) => onFavorite(e, studio.id)}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-sm transition-transform hover:scale-110 active:scale-95"
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors ${fav ? "fill-destructive text-destructive" : "text-muted-foreground"}`}
                    />
                  </button>
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
                            <Users className="h-3 w-3 text-primary" /> {studioClasses.length} класа
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
                            {studio.amenities.parking && (
                              <span className="text-xs" title="Паркинг">
                                🅿️
                              </span>
                            )}
                            {studio.amenities.shower && (
                              <span className="text-xs" title="Душ">
                                🚿
                              </span>
                            )}
                            {studio.amenities.changingRoom && (
                              <span className="text-xs" title="Съблекалня">
                                👔
                              </span>
                            )}
                            {studio.amenities.equipmentRental && (
                              <span className="text-xs" title="Оборудване">
                                🧘
                              </span>
                            )}
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
            <Link href="/discover">
              Виж всички студиа <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
