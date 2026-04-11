import { Clock, Users } from 'lucide-react';
import { mockInstructors } from '@/data/mock-data';
import type { YogaClass } from '@/data/mock-data';
import { formatPriceDualFromBgn } from '@/lib/eur-bgn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function EventsTabContent({
  studioClasses,
  onBookClass,
}: {
  studioClasses: YogaClass[];
  onBookClass: (classId: string) => void;
}) {
  return (
    <div className="space-y-4">
      {studioClasses.length === 0 && (
        <p className="text-muted-foreground">Няма предстоящи събития.</p>
      )}
      {studioClasses.map((cls) => {
        const instructor = mockInstructors.find((i) => i.id === cls.instructorId);
        const isFull = cls.enrolled >= cls.maxCapacity;
        return (
          <div
            key={cls.id}
            className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-5 md:flex-row md:items-center"
          >
            <div className="flex-1">
              <h4 className="font-display text-lg font-semibold text-foreground">{cls.name}</h4>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {cls.date} | {cls.startTime}–{cls.endTime}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {cls.enrolled}/{cls.maxCapacity}
                </span>
              </div>
              <div className="mt-2 flex gap-2">
                <Badge variant="outline">{cls.yogaType}</Badge>
                <Badge variant="outline">{cls.difficulty}</Badge>
                {instructor && <span className="text-sm text-muted-foreground">с {instructor.name}</span>}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xl font-semibold text-foreground leading-snug">{formatPriceDualFromBgn(cls.price)}</span>
              <Button onClick={() => onBookClass(cls.id)} variant={isFull ? 'outline' : 'default'}>
                {isFull ? 'Списък за изчакване' : 'Запиши се'}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
