import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockStudios, mockClasses, mockInstructors } from '@/data/mock-data';
import { BarChart3, Calendar, MapPin, Star, TrendingUp, Users } from 'lucide-react';

import { dashboardCardClass, dashboardInsetClass } from '../dashboardUi';
import { DashboardPageHeader } from './DashboardPageHeader';

export function OverviewSection({
  avgRating,
  totalEnrolled,
  totalCapacity,
  occupancyRate,
  myStudios,
  myClasses,
  myInstructors,
  revenue,
}: {
  avgRating: string;
  totalEnrolled: number;
  totalCapacity: number;
  occupancyRate: number;
  myStudios: typeof mockStudios;
  myClasses: typeof mockClasses;
  myInstructors: typeof mockInstructors;
  revenue: number;
}) {
  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Преглед"
        description="Обобщена информация за вашия бизнес — рейтинг, записвания, класове и приход."
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            icon: TrendingUp,
            label: 'Среден рейтинг',
            value: avgRating,
            sub: `от ${myStudios.reduce((s, st) => s + st.reviewCount, 0)} ревюта`,
            iconWrap: 'bg-yoga-tertiary/35 text-primary',
          },
          {
            icon: Users,
            label: 'Общо записвания',
            value: totalEnrolled,
            sub: `от ${totalCapacity} места`,
            iconWrap: 'bg-secondary/20 text-secondary',
          },
          {
            icon: Calendar,
            label: 'Активни класове',
            value: myClasses.length,
            sub: `${myInstructors.length} инструктора`,
            iconWrap: 'bg-primary/12 text-primary',
          },
          {
            icon: BarChart3,
            label: 'Приход',
            value: `${revenue} лв.`,
            sub: 'от записвания',
            iconWrap: 'bg-muted text-yoga-secondary-deep',
          },
        ].map((card, i) => (
          <div key={i} className={`${dashboardCardClass} p-5`}>
            <div className="mb-4 flex items-start justify-between gap-2">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconWrap}`}
              >
                <card.icon className="h-5 w-5" aria-hidden />
              </span>
            </div>
            <p className="font-display text-2xl font-bold tracking-tight text-foreground">{card.value}</p>
            <p className="mt-1 text-xs font-medium text-foreground/80">{card.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Occupancy bar */}
      <div className={`${dashboardCardClass} p-6`}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-semibold text-foreground">Заетост на класовете</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {totalEnrolled} от {totalCapacity} места заети
            </p>
          </div>
          <span className="rounded-xl bg-primary/10 px-3 py-1.5 text-2xl font-bold tabular-nums text-primary">
            {occupancyRate}%
          </span>
        </div>
        <Progress value={occupancyRate} className="h-3" />
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {myClasses.map(cls => {
            const fill = Math.round((cls.enrolled / cls.maxCapacity) * 100);
            const isFull = cls.enrolled >= cls.maxCapacity;
            return (
              <div key={cls.id} className={`${dashboardInsetClass} p-4`}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="truncate pr-2 text-sm font-medium text-foreground">{cls.name}</p>
                  {isFull && (
                    <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
                      Пълен
                    </Badge>
                  )}
                </div>
                <Progress value={fill} className="mb-1.5 h-2" />
                <p className="text-xs text-muted-foreground">
                  {cls.enrolled}/{cls.maxCapacity} записани
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className={`${dashboardCardClass} p-6`}>
        <h3 className="font-display mb-4 font-semibold text-foreground">Студиа</h3>
        <div className="space-y-3">
          {myStudios.map(studio => (
            <div
              key={studio.id}
              className={`flex items-center gap-4 p-4 ${dashboardInsetClass} transition-colors hover:bg-muted/30`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/25 via-secondary/15 to-yoga-tertiary/30 text-2xl">
                🧘
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">{studio.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0 text-secondary" />
                  {studio.address}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Star className="h-3.5 w-3.5 fill-yoga-tertiary text-primary" />
                  <span className="font-semibold text-foreground">{studio.rating}</span>
                </div>
                <p className="text-xs text-muted-foreground">{studio.reviewCount} ревюта</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

