import { CalendarRange, Clock, Users } from 'lucide-react';
import type { Instructor, TeachingMode, YogaClass } from '@/data/mock-data';
import { MultisportBadge } from '@/components/multisport/multisport-badge';
import { TeachingModePill } from '@/components/studio/teaching-mode-badge';
import {
  formatClassCapacityDisplay,
  formatClassPriceDisplay,
  isClassAtCapacity,
  isUnlimitedClassCapacity,
} from '@/lib/yoga-class-limits';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudioTabEmptyState } from '@/components/studio-detail/studio-tab-empty-state';

export function EventsTabContent({
  studioTeachingMode,
  studioClasses,
  instructors,
  checkoutModalOpen,
  onBookClass,
  isAuthenticated,
  bookedClassIds,
}: {
  studioTeachingMode: TeachingMode;
  studioClasses: YogaClass[];
  instructors: Instructor[];
  checkoutModalOpen: boolean;
  onBookClass: (classId: string) => void;
  isAuthenticated: boolean;
  bookedClassIds: string[];
}) {
  return (
    <div className="space-y-4">
      {studioClasses.length === 0 && (
        <StudioTabEmptyState
          icon={CalendarRange}
          title="Няма предстоящи събития"
          subtitle="Когато студиото публикува класове, те ще се появят тук."
        />
      )}
      {studioClasses.map((cls) => {
        const instructor = instructors.find((i) => i.id === cls.instructorId);
        const isFull = isClassAtCapacity(cls.enrolled, cls.maxCapacity);
        const bookingInFlight = checkoutModalOpen;
        const alreadyBooked = isAuthenticated && bookedClassIds.includes(cls.id);
        const capacityLabel = formatClassCapacityDisplay(cls.enrolled, cls.maxCapacity);
        return (
          <div
            key={cls.id}
            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
          >
            <div className="min-w-0 flex-1">
              <h4 className="font-display text-lg font-semibold text-foreground">{cls.name}</h4>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  {cls.date} | {cls.startTime}–{cls.endTime}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  {isUnlimitedClassCapacity(cls.maxCapacity) ? capacityLabel : `${capacityLabel} места`}
                </span>
                <span className="font-semibold text-foreground">{formatClassPriceDisplay(cls.price)}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{cls.yogaType}</Badge>
                <Badge variant="outline">{cls.difficulty}</Badge>
                {cls.acceptsMultisport ? <MultisportBadge size="sm" /> : null}
                {studioTeachingMode === 'online' ? <TeachingModePill mode="online" /> : null}
                {instructor && <span className="text-sm text-muted-foreground">с {instructor.name}</span>}
              </div>
            </div>
            <Button
              className="w-full sm:w-auto sm:self-end"
              onClick={() => onBookClass(cls.id)}
              variant={alreadyBooked || isFull ? 'outline' : 'default'}
              disabled={bookingInFlight || alreadyBooked}
            >
              {alreadyBooked
                ? 'Вече сте записани'
                : isFull
                  ? 'Списък за изчакване'
                  : 'Запиши се'}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
