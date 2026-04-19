import { Badge } from '@/components/ui/badge';
import type { HomeRetreat } from '@/lib/home/home-data';

export function RetreatDetailSummary({ retreat }: { retreat: HomeRetreat }) {
  return (
    <div className="space-y-2">
      <Badge variant="secondary">{retreat.studioName}</Badge>
      <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">{retreat.title}</h1>
      <p className="text-sm text-muted-foreground">{retreat.description}</p>
    </div>
  );
}
