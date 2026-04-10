"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { mockStudios, mockClasses } from "@/data/mock-data";
import { Star, MapPin, ArrowRight, Users, Clock, Search } from "lucide-react";

const totalEnrolled = mockClasses.reduce((s, c) => s + c.enrolled, 0);

export default function HeroSection() {
  const stats = [
    { value: `${mockStudios.length}+`, label: "Партньорски студиа", icon: <MapPin className="h-5 w-5" /> },
    { value: `${mockClasses.length}+`, label: "Седмични класове", icon: <Clock className="h-5 w-5" /> },
    { value: `${totalEnrolled}+`, label: "Доволни практикуващи", icon: <Users className="h-5 w-5" /> },
    { value: "4.7", label: "Средна оценка", icon: <Star className="h-5 w-5" /> },
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
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-base px-8 py-6 rounded-xl border-2 border-yoga-accent bg-background/90 text-yoga-accent hover:bg-yoga-accent/10 hover:text-yoga-accent focus-visible:ring-yoga-accent no-underline hover:no-underline"
              >
                <Link href="/auth">
                  Добави своето студио <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="hero-stat-card gsap-reveal-stagger rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-5 hover:shadow-md transition-shadow"
                >
                  <div className="text-yoga-accent mb-2">{stat.icon}</div>
                  <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
