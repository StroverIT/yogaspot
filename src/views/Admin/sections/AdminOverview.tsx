import { mockStudios, mockClasses, mockReviews } from '@/data/mock-data';
import { Building2, Calendar, Star, Users } from 'lucide-react';
import { StatCard } from '../components/StatCard';

export function AdminOverview() {
  const totalEnrollments = mockClasses.reduce((s, c) => s + c.enrolled, 0);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard icon={<Users className="h-5 w-5 text-primary" />} label="Потребители" value="1,245" trend="+12% този месец" tint="primary" />
        <StatCard icon={<Building2 className="h-5 w-5 text-accent" />} label="Студиа" value={mockStudios.length} trend="+2 нови" tint="accent" />
        <StatCard icon={<Calendar className="h-5 w-5 text-sage-foreground" />} label="Записвания" value={totalEnrollments} trend="+8% тази седмица" tint="sage" />
        <StatCard icon={<Star className="h-5 w-5 text-accent" />} label="Ревюта" value={mockReviews.length} tint="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Последни студиа</h3>
          <div className="space-y-3">
            {mockStudios.slice(0, 3).map(studio => (
              <div key={studio.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">🧘</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{studio.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{studio.address}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                  <span className="text-sm font-semibold text-foreground">{studio.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Последни ревюта</h3>
          <div className="space-y-3">
            {mockReviews.map(review => (
              <div key={review.id} className="p-3 rounded-xl bg-muted/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground text-sm">{review.userName}</span>
                  <div className="flex">{Array.from({ length: review.rating }).map((_, j) => <Star key={j} className="h-3 w-3 fill-accent text-accent" />)}</div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
