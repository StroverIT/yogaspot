import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MultisportBadge } from '@/components/multisport/multisport-badge';
import type { Studio } from '@/data/mock-data';

export const STUDIO_AMENITY_LABELS: Record<string, string> = {
  parking: '\u{1F17F}\uFE0F Паркинг',
  shower: '\u{1F6BF} Душ',
  changingRoom: '\u{1F454} Съблекалня',
  equipmentRental: '\u{1F9D8} Оборудване под наем',
};

export function StudioDetailSummary({
  studio,
  showMultisport = false,
}: {
  studio: Studio;
  showMultisport?: boolean;
}) {
  return (
    <>
      <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">{studio.name}</h1>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Star className="h-5 w-5 fill-accent text-accent" />
          <span className="text-lg font-semibold">{studio.rating}</span>
          <span className="text-muted-foreground">({studio.reviewCount} ревюта)</span>
        </div>
      </div>

      {showMultisport ? (
        <div className="mt-4">
          <MultisportBadge size="xl" />
        </div>
      ) : null}

      <p className="mt-6 leading-relaxed text-foreground/80">{studio.description}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {Object.entries(studio.amenities)
          .filter(([, v]) => v)
          .map(([key]) => (
            <Badge key={key} variant="default" className="rounded-full px-3 py-1 text-sm">
              {STUDIO_AMENITY_LABELS[key]}
            </Badge>
          ))}
      </div>
    </>
  );
}
