import { Globe, Mail, MapPin, Navigation, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Studio } from '@/data/mock-data';

function hasStudioCoords(studio: Studio) {
  const { lat, lng } = studio;
  if (lat == null || lng == null) return false;
  if (lat === 0 && lng === 0) return false;
  return true;
}

function googleMapsDirectionsUrl(lat: number, lng: number) {
  const destination = encodeURIComponent(`${lat},${lng}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

export function StudioDetailSidebarInfo({ studio }: { studio: Studio }) {
  const coords = hasStudioCoords(studio) ? { lat: studio.lat, lng: studio.lng } : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Информация</h3>
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>{studio.address}</span>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4 shrink-0 text-primary" />
          <span>{studio.phone}</span>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 shrink-0 text-primary" />
          <span>{studio.email}</span>
        </div>
        {studio.website && (
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 shrink-0 text-primary" />
            <a href={studio.website} target="_blank" className="text-primary hover:underline" rel="noreferrer">
              Уебсайт
            </a>
          </div>
        )}
      </div>
      {coords ? (
        <Button variant="outline" className="mt-4 w-full" asChild>
          <a href={googleMapsDirectionsUrl(coords.lat, coords.lng)} target="_blank" rel="noopener noreferrer">
            <Navigation className="h-4 w-4" />
            Виж на картата
          </a>
        </Button>
      ) : null}
    </div>
  );
}
