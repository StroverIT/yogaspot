import { CalendarDays, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { mockInstructors, WEEKDAYS } from '@/data/mock-data';
import type { ScheduleEntry, StudioSubscription } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DifficultyBadge } from '@/components/studio-detail/difficulty-badge';

export function ScheduleTabContent({
  studioSchedule,
  subscription,
  isAuthenticated,
}: {
  studioSchedule: ScheduleEntry[];
  subscription: StudioSubscription | undefined;
  isAuthenticated: boolean;
}) {
  return (
    <div className="space-y-6">
      {subscription?.hasMonthlySubscription && (
        <div id="studio-subscription" className="scroll-mt-24 rounded-xl border-2 border-primary bg-primary/5 p-5">
          <div className="flex items-start gap-4">
            <div className="shrink-0 rounded-xl bg-primary/10 p-2.5">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold text-foreground">Месечен абонамент</h3>
              <p className="mt-1 text-sm text-muted-foreground">{subscription.subscriptionNote}</p>
              <p className="mt-2 text-2xl font-bold text-primary">
                {subscription.monthlyPrice} лв.
                <span className="text-sm font-normal text-muted-foreground">/месец</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {WEEKDAYS.map((day) => {
          const entries = studioSchedule.filter((s) => s.day === day);
          if (entries.length === 0) return null;
          return (
            <div key={day} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="border-b border-border px-4 py-2.5 bg-primary/74 text-white">
                <h4 className="text-sm font-bold text-white">{day}</h4>
              </div>
              <div className="divide-y divide-border">
                {entries
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((entry) => {
                    const instructor = mockInstructors.find((i) => i.id === entry.instructorId);
                    return (
                      <div key={entry.id} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="min-w-[50px] text-center">
                            <p className="text-sm font-bold text-foreground">{entry.startTime}</p>
                            <p className="text-xs text-muted-foreground">{entry.endTime}</p>
                          </div>
                          <Separator orientation="vertical" className="h-8" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{entry.className}</p>
                            <div className="mt-0.5 flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {entry.yogaType}
                              </Badge>
                              <DifficultyBadge difficulty={entry.difficulty} />
                              {instructor && (
                                <span className="text-xs text-muted-foreground">с {instructor.name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-semibold text-foreground">{entry.price} лв.</p>
                            <p className="text-xs text-muted-foreground">{entry.maxCapacity} места</p>
                          </div>
                          <Button
                            size="sm"
                            className="rounded-lg"
                            onClick={() => {
                              if (!isAuthenticated) {
                                toast.error('Моля, влезте, за да се запишете.');
                                return;
                              }
                              toast.success(`Записахте се за ${entry.className}!`);
                            }}
                          >
                            Запиши се
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
        {studioSchedule.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <CalendarDays className="mx-auto mb-3 h-10 w-10 opacity-40" />
            <p>Няма добавено разписание за това студио.</p>
          </div>
        )}
      </div>
    </div>
  );
}
