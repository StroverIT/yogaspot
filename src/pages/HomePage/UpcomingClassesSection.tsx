"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Studio, Instructor, YogaClass } from "@/data/mock-data";
import { Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface UpcomingClassesSectionProps {
  classes: YogaClass[];
  getStudio: (id: string) => Studio | undefined;
  getInstructor: (id: string) => Instructor | undefined;
}

export default function UpcomingClassesSection({
  classes: upcomingClasses,
  getStudio,
  getInstructor,
}: UpcomingClassesSectionProps) {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <Badge variant="secondary" className="rounded-full mb-3">
              Скоро
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Следващите ти класове
            </h2>
            <p className="text-muted-foreground">Намери свободно място и се включи още тази седмица</p>
          </div>
          <Button asChild variant="outline" className="hidden md:flex rounded-full gap-1">
            <Link href="/discover">
              Виж всички <ArrowRight className="h-4 w-4" />
            </Link>
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
                    <div className="shrink-0 w-16 h-16 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                      <span className="text-xs text-primary font-medium uppercase">
                        {new Date(cls.date).toLocaleDateString("bg-BG", { month: "short" })}
                      </span>
                      <span className="font-display text-xl font-bold text-foreground">
                        {new Date(cls.date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{cls.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {studio?.name} · {instructor?.name}
                          </p>
                        </div>
                        <Badge
                          variant={isFull ? "destructive" : "secondary"}
                          className="shrink-0 rounded-full text-xs"
                        >
                          {isFull ? "Пълен" : `${cls.enrolled}/${cls.maxCapacity}`}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {cls.startTime}–{cls.endTime}
                        </span>
                        <span>{cls.price} лв.</span>
                        <Badge variant="outline" className="rounded-full text-xs">
                          {cls.yogaType}
                        </Badge>
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
  );
}
