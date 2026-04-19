import { Badge } from '@/components/ui/badge';
import type { HomeRetreat } from '@/lib/home/home-data';

export function RetreatDetailContent({ retreat }: { retreat: HomeRetreat }) {
  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-3xl border border-border bg-background p-5">
        <h2 className="font-display text-xl font-semibold text-foreground">Описание</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{retreat.description}</p>
      </section>

      <section className="space-y-3 rounded-3xl border border-border bg-background p-5">
        <h2 className="font-display text-xl font-semibold text-foreground">Какво включва</h2>
        <div className="flex flex-wrap gap-2">
          {retreat.activities.map((activity) => (
            <Badge key={activity} variant="outline">
              {activity}
            </Badge>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-3xl border border-border bg-background p-5">
        <h2 className="font-display text-xl font-semibold text-foreground">Локация</h2>
        <p className="text-sm text-muted-foreground">{retreat.address}</p>
        <p className="text-xs text-muted-foreground">
          Координати: {retreat.lat.toFixed(6)}, {retreat.lng.toFixed(6)}
        </p>
      </section>
    </div>
  );
}
