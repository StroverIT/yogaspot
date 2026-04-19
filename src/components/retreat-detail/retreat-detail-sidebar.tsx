import { CalendarDays, Clock3, ExternalLink, Mail, MapPin, Phone, UserRound, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { HomeRetreat } from '@/lib/home/home-data';
import { RetreatSignupButton } from '@/components/retreats/RetreatSignupButton';

export function RetreatDetailSidebar({ retreat }: { retreat: HomeRetreat }) {
  return (
    <aside className="space-y-5 rounded-3xl border border-border bg-background p-5">
      <div className="space-y-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <UserRound className="h-4 w-4" />
          Организатор: {retreat.studioName}
        </p>
        <p className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          {new Date(retreat.startDate).toLocaleDateString('bg-BG')} - {new Date(retreat.endDate).toLocaleDateString('bg-BG')}
        </p>
        <p className="flex items-center gap-2">
          <Clock3 className="h-4 w-4" />
          {retreat.duration}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {retreat.address}
        </p>
        <p className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Записани: {retreat.enrolled} / {retreat.maxCapacity}
        </p>
        <p>Свободни места: {Math.max(retreat.maxCapacity - retreat.enrolled, 0)}</p>
        <p className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          {retreat.contactPhone}
        </p>
        <p className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          {retreat.contactEmail}
        </p>
      </div>

      <p className="text-lg font-semibold text-foreground">
        {retreat.price === 0 ? 'Безплатно' : `${retreat.price.toFixed(2)} лв.`}
      </p>

      <RetreatSignupButton
        retreatId={retreat.id}
        enrolled={retreat.enrolled}
        maxCapacity={retreat.maxCapacity}
        isEnrolled={retreat.isEnrolled}
      />

      <Button asChild variant="outline" className="w-full">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${retreat.lat},${retreat.lng}`)}`}
          target="_blank"
          rel="noreferrer"
        >
          Отвори в Google Maps <ExternalLink className="ml-1 h-4 w-4" />
        </a>
      </Button>
    </aside>
  );
}
