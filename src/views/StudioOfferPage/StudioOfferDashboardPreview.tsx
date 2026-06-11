"use client";

import { LayoutDashboard, CalendarDays, Users, MapPin, TrendingDown, BarChart3 } from "lucide-react";

export function StudioOfferDashboardPreview() {
  return (
    <div
      className="studio-offer-preview overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-primary/10"
      aria-hidden
    >
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
        <div className="h-2.5 w-2.5 rounded-full bg-yoga-warm" />
        <div className="h-2.5 w-2.5 rounded-full bg-yoga-secondary/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-primary/40" />
        <span className="ml-2 text-xs font-medium text-muted-foreground">Zenno табло</span>
      </div>
      <div className="grid grid-cols-[88px_1fr] gap-0 sm:grid-cols-[100px_1fr]">
        <div className="space-y-2 border-r border-border bg-primary/5 p-3">
          <div className="flex h-8 items-center gap-1.5 rounded-lg bg-primary/15 px-2 text-[10px] font-semibold text-primary">
            <LayoutDashboard className="h-3 w-3 shrink-0" />
            <span className="truncate">Преглед</span>
          </div>
          <div className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-[10px] text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">Студиа</span>
          </div>
          <div className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-[10px] text-muted-foreground">
            <Users className="h-3 w-3 shrink-0" />
            <span className="truncate">Инструктори</span>
          </div>
          <div className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-[10px] text-muted-foreground">
            <CalendarDays className="h-3 w-3 shrink-0" />
            <span className="truncate">Разписание</span>
          </div>
        </div>
        <div className="space-y-3 p-4">
          <div className="h-3 w-2/3 rounded-full bg-foreground/10" />
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-border bg-background p-2.5">
              <BarChart3 className="mb-1.5 h-3 w-3 text-primary" />
              <div className="font-display text-sm font-bold text-foreground">1 240 лв.</div>
              <div className="text-[9px] font-medium text-muted-foreground">Приход</div>
            </div>
            <div className="rounded-xl border border-border bg-background p-2.5">
              <TrendingDown className="mb-1.5 h-3 w-3 text-muted-foreground" />
              <div className="font-display text-sm font-bold text-foreground">320 лв.</div>
              <div className="text-[9px] font-medium text-muted-foreground">Разход</div>
            </div>
            <div className="rounded-xl border border-border bg-background p-2.5">
              <BarChart3 className="mb-1.5 h-3 w-3 text-primary/70" />
              <div className="font-display text-sm font-bold text-foreground">+18%</div>
              <div className="text-[9px] font-medium text-muted-foreground">Анализи</div>
            </div>
          </div>
          <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3">
            <div className="mb-1 text-[10px] font-semibold text-primary">Ръководство за настройка</div>
            <div className="space-y-1.5">
              <div className="h-2 w-full rounded-full bg-primary/15" />
              <div className="h-2 w-4/5 rounded-full bg-primary/10" />
              <div className="h-2 w-3/5 rounded-full bg-primary/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
