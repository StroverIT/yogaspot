"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { AddStudioCtaButton } from "@/components/home/add-studio-cta-button";
import { useShowAddStudioMarketing } from "@/hooks/useShowAddStudioMarketing";
import { Button } from "@/components/ui/button";
import {
  Star,
  MapPin,
  ArrowRight,
  Users,
  Clock,
  Search,
  MessageSquareText,
  Flower2,
} from "lucide-react";

export default function HeroSection({
  studioCount,
  classCount,
  totalEnrolled,
  avgRating,
  totalReviews,
  yogaStylesCount,
}: {
  studioCount: number;
  classCount: number;
  totalEnrolled: number;
  avgRating: string;
  totalReviews: number;
  yogaStylesCount: number;
}) {
  const showAddStudioMarketing = useShowAddStudioMarketing();
  const fmt = (n: number) => n.toLocaleString("bg-BG");

  const stats: { value: string; label: string; icon: ReactNode; hint?: string }[] = [
    { value: `${studioCount}+`, label: "Партньорски студиа", icon: <MapPin className="h-5 w-5" /> },
    { value: `${classCount}+`, label: "Предстоящи класове", icon: <Clock className="h-5 w-5" /> },
    { value: `${totalEnrolled}+`, label: "Записани места", icon: <Users className="h-5 w-5" /> },
    {
      value: avgRating,
      label: "Средна оценка",
      hint: totalReviews > 0 ? `от ${fmt(totalReviews)} отзива` : undefined,
      icon: <Star className="h-5 w-5" />,
    },
    {
      value: fmt(totalReviews),
      label: "Отзиви в платформата",
      icon: <MessageSquareText className="h-5 w-5" />,
    },
    {
      value: fmt(yogaStylesCount),
      label: "Стилове йога",
      icon: <Flower2 className="h-5 w-5" />,
    },
  ];

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0">
        <Image src="/homepage/hero-yoga.jpg" alt="Yoga studio" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="hero-content gsap-reveal-block">
            <h1 className=" text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-6 font-serif">
              Йога, която пасва на ритъма ти
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
              Открий студиа, графици и практики на едно място.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                size="lg"
                className="text-base px-8 py-6 rounded-xl gap-2 border-0 bg-yoga-accent text-white shadow-md shadow-yoga-accent/25 hover:bg-yoga-accent/90 hover:text-white focus-visible:ring-yoga-accent no-underline hover:no-underline"
              >
                <Link href="/discover">
                  <Search className="h-4 w-4" /> Разгледай студиа
                </Link>
              </Button>
              {showAddStudioMarketing ? (
                <AddStudioCtaButton
                  variant="outline"
                  size="lg"
                  className="text-base px-8 py-6 rounded-xl border-2 border-yoga-accent bg-background/90 focus-visible:ring-yoga-accent"
                >
                  Добави своето студио <ArrowRight className="ml-1 h-4 w-4" />
                </AddStudioCtaButton>
              ) : null}
            </div>
          </div>

          <div className="mt-10 lg:mt-0">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="hero-stat-card gsap-reveal-stagger rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-4 sm:p-5 hover:shadow-md transition-shadow"
                >
                  <div className="text-yoga-accent mb-2">{stat.icon}</div>
                  <p className="font-display text-xl font-bold text-foreground sm:text-2xl">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  {stat.hint ? <p className="mt-1 text-xs text-muted-foreground/90">{stat.hint}</p> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
