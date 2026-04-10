import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { mockInstructors, mockSchedule, mockStudios, mockSubscriptions, WEEKDAYS, type ScheduleEntry, type Weekday } from '@/data/mock-data';
import { CalendarDays, CreditCard, Edit, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DifficultyBadge } from './DifficultyBadge';

export function ScheduleSection({
  studios,
  onAdd,
  onEdit,
}: {
  studios: typeof mockStudios;
  onAdd: () => void;
  onEdit: (entry: ScheduleEntry) => void;
}) {
  const [selectedStudio, setSelectedStudio] = useState<string>(studios[0]?.id || '');
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');

  const studioSchedule = mockSchedule.filter(s => s.studioId === selectedStudio);
  const subscription = mockSubscriptions.find(s => s.studioId === selectedStudio);

  const scheduleByDay = WEEKDAYS.reduce((acc, day) => {
    acc[day] = studioSchedule.filter(s => s.day === day);
    return acc;
  }, {} as Record<Weekday, ScheduleEntry[]>);

  const handleDelete = (entry: ScheduleEntry) => {
    toast.success(`"${entry.className}" беше изтрит от разписанието.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Разписание</h1>
          <p className="text-muted-foreground text-sm mt-1">Управлявайте седмичното разписание на вашите студиа</p>
        </div>
        <Button onClick={onAdd} className="gap-2"><Plus className="h-4 w-4" /> Добави час</Button>
      </div>

      {/* Studio selector + view toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Select value={selectedStudio} onValueChange={setSelectedStudio}>
          <SelectTrigger className="w-[250px] rounded-xl">
            <SelectValue placeholder="Изберете студио" />
          </SelectTrigger>
          <SelectContent>
            {studios.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex rounded-lg bg-muted p-1">
          {(['weekly', 'monthly'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === mode ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground/70'
                }`}
            >
              <span>{mode === 'weekly' ? 'Седмично' : 'Месечно'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Subscription info */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Месечен абонамент</h3>
              {subscription?.hasMonthlySubscription ? (
                <>
                  <p className="text-sm text-muted-foreground mt-0.5">{subscription.subscriptionNote}</p>
                  <p className="text-lg font-bold text-primary mt-1">{subscription.monthlyPrice} лв./мес.</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground mt-0.5">Не е активиран за това студио</p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-lg shrink-0"
            onClick={() => toast.info('За активиране на абонамент, моля свържете се с нас на admin@Zenno.bg')}
          >
            <MessageSquare className="h-4 w-4" />
            {subscription?.hasMonthlySubscription ? 'Промени' : 'Заявка'}
          </Button>
        </div>
      </div>

      {/* Weekly schedule grid */}
      {viewMode === 'weekly' && (
        <div className="space-y-4">
          {WEEKDAYS.map(day => {
            const entries = scheduleByDay[day];
            if (entries.length === 0) return null;
            return (
              <div
                key={day}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                <div className="px-5 py-3 bg-muted/50 border-b border-border">
                  <h3 className="font-semibold text-foreground text-sm">{day}</h3>
                </div>
                <div className="divide-y divide-border">
                  {entries.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(entry => {
                    const instructor = mockInstructors.find(i => i.id === entry.instructorId);
                    return (
                      <div key={entry.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[56px]">
                            <p className="text-sm font-bold text-foreground">{entry.startTime}</p>
                            <p className="text-xs text-muted-foreground">{entry.endTime}</p>
                          </div>
                          <Separator orientation="vertical" className="h-10" />
                          <div>
                            <p className="font-medium text-foreground">{entry.className}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">{entry.yogaType}</Badge>
                              <DifficultyBadge difficulty={entry.difficulty} />
                              {instructor && <span className="text-xs text-muted-foreground">с {instructor.name}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-foreground">{entry.price} лв.</p>
                            <p className="text-xs text-muted-foreground">{entry.maxCapacity} места</p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(entry)}><Edit className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(entry)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {studioSchedule.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Няма добавени часове</p>
              <p className="text-sm mt-1">Добавете първия час в разписанието</p>
            </div>
          )}
        </div>
      )}

      {/* Monthly view - calendar-like */}
      {viewMode === 'monthly' && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-7 bg-muted/50 border-b border-border">
            {WEEKDAYS.map(day => (
              <div key={day} className="p-3 text-center text-xs font-semibold text-muted-foreground border-r border-border last:border-r-0">
                {day.slice(0, 3)}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-[200px]">
            {WEEKDAYS.map(day => {
              const entries = scheduleByDay[day];
              return (
                <div key={day} className="border-r border-border last:border-r-0 p-2 min-h-[120px]">
                  {entries.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(entry => (
                    <button
                      key={entry.id}
                      onClick={() => onEdit(entry)}
                      className="w-full text-left mb-1.5 p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                    >
                      <p className="text-xs font-semibold text-primary">{entry.startTime}</p>
                      <p className="text-xs text-foreground truncate">{entry.className}</p>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

