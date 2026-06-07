import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock3, MapPin } from 'lucide-react';
import { RetreatSignupButton } from '@/components/retreats/RetreatSignupButton';
import type { RetreatCatalogRow } from '@/lib/retreats-catalog';

function formatPrice(price: number) {
  return price === 0 ? 'Безплатно' : `${price.toFixed(2)} лв.`;
}

export function RetreatCatalogCard({
  retreat,
  priority = false,
  showDistance = false,
}: {
  retreat: RetreatCatalogRow;
  priority?: boolean;
  showDistance?: boolean;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-background">
      <Link href={`/retreats/${retreat.id}`} prefetch={priority} className="block">
        <div className="relative aspect-[16/10] bg-muted">
          {retreat.image ? (
            <img
              src={retreat.image}
              alt={retreat.title}
              className="h-full w-full object-cover"
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              {...(priority ? { fetchPriority: 'high' as const } : {})}
            />
          ) : null}
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <Link
          href={`/retreats/${retreat.id}`}
          prefetch={priority}
          className="font-display text-lg font-semibold text-foreground hover:text-primary"
        >
          {retreat.title}
        </Link>
        <p className="line-clamp-2 text-sm text-muted-foreground">{retreat.descriptionPreview}</p>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {new Date(retreat.startDate).toLocaleDateString('bg-BG')} -{' '}
            {new Date(retreat.endDate).toLocaleDateString('bg-BG')}
          </p>
          <p className="flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            {retreat.duration}
          </p>
          <p className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {retreat.address}
          </p>
          {showDistance && retreat.distanceKm != null && Number.isFinite(retreat.distanceKm) ? (
            <p className="text-xs text-primary">На {retreat.distanceKm.toFixed(1)} км от теб</p>
          ) : null}
          <p className="text-xs">
            Записани: {retreat.enrolled} / {retreat.maxCapacity}
          </p>
          <p className="text-xs">
            Свободни места: {Math.max(retreat.maxCapacity - retreat.enrolled, 0)}
          </p>
          <p className="text-sm font-medium text-foreground">{formatPrice(retreat.price)}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {retreat.activities.slice(0, 3).map((activity) => (
            <Badge key={activity} variant="outline">
              {activity}
            </Badge>
          ))}
        </div>
        <RetreatSignupButton
          retreatId={retreat.id}
          enrolled={retreat.enrolled}
          maxCapacity={retreat.maxCapacity}
          isEnrolled={retreat.isEnrolled}
        />
      </div>
    </article>
  );
}
