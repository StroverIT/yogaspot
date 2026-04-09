"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockStudios, mockClasses } from "@/data/mock-data";
import { Star, MapPin, ArrowRight, Sparkles, Users, Clock, Search } from "lucide-react";

const totalEnrolled = mockClasses.reduce((s, c) => s + c.enrolled, 0);

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const stats = [
    { value: `${mockStudios.length}+`, label: "Партньорски студиа", icon: <MapPin className="h-5 w-5" /> },
    { value: `${mockClasses.length}+`, label: "Седмични класове", icon: <Clock className="h-5 w-5" /> },
    { value: `${totalEnrolled}+`, label: "Доволни практикуващи", icon: <Users className="h-5 w-5" /> },
    { value: "4.7", label: "Средна оценка", icon: <Star className="h-5 w-5" /> },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".hero-content", {
        opacity: 0,
        x: -30,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.from(".hero-stat-card", {
        opacity: 0,
        y: 15,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.1,
        delay: 0.4,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0">
        <Image src="/homepage/hero-yoga.jpg" alt="Yoga studio" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
      </div>
      <div className="container mx-auto px-4 relative z-10" ref={containerRef}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="hero-content">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-6">
              Твоята практика
              <br />
              <span className="text-primary">Твоят ритъм</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
              Открий идеалното студио за теб. Разгледай реални отзиви, сравни разписания и
              запази място за секунди.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="text-base px-8 py-6 rounded-xl gap-2">
                <Link href="/discover">
                  <Search className="h-4 w-4" /> Открий студио
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8 py-6 rounded-xl">
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
                  className="hero-stat-card rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-5 hover:shadow-md transition-shadow"
                >
                  <div className="text-primary mb-2">{stat.icon}</div>
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
