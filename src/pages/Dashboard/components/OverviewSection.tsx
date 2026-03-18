import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockStudios, mockClasses, mockInstructors } from '@/data/mock-data';
import { BarChart3, Calendar, Eye, MapPin, Star, TrendingUp, Users } from 'lucide-react';

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
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Преглед</h1>
        <p className="text-muted-foreground text-sm mt-1">Обобщена информация за вашия бизнес</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: 'Среден рейтинг', value: avgRating, sub: `от ${myStudios.reduce((s, st) => s + st.reviewCount, 0)} ревюта`, color: 'text-accent' },
          { icon: Users, label: 'Общо записвания', value: totalEnrolled, sub: `от ${totalCapacity} места`, color: 'text-primary' },
          { icon: Calendar, label: 'Активни класове', value: myClasses.length, sub: `${myInstructors.length} инструктора`, color: 'text-primary' },
          { icon: BarChart3, label: 'Приход', value: `${revenue} лв.`, sub: 'от записвания', color: 'text-accent' },
        ].map((card, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <card.icon className={`h-5 w-5 ${card.color}`} />
              <Eye className="h-3.5 w-3.5 text-muted-foreground/40" />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Occupancy bar */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-foreground">Заетост на класовете</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{totalEnrolled} от {totalCapacity} места заети</p>
          </div>
          <span className="text-2xl font-bold text-primary">{occupancyRate}%</span>
        </div>
        <Progress value={occupancyRate} className="h-3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {myClasses.map(cls => {
            const fill = Math.round((cls.enrolled / cls.maxCapacity) * 100);
            const isFull = cls.enrolled >= cls.maxCapacity;
            return (
              <div key={cls.id} className="rounded-xl bg-muted/40 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground truncate pr-2">{cls.name}</p>
                  {isFull && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Пълен</Badge>}
                </div>
                <Progress value={fill} className="h-2 mb-1.5" />
                <p className="text-xs text-muted-foreground">{cls.enrolled}/{cls.maxCapacity} записани</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display font-semibold text-foreground mb-4">Студиа</h3>
        <div className="space-y-3">
          {myStudios.map(studio => (
            <div key={studio.id} className="flex items-center gap-4 rounded-xl bg-muted/30 p-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl shrink-0">🧘</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{studio.name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{studio.address}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" />
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

