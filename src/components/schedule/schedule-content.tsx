'use client';

import { useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { DifficultyBadge } from '@/components/studio-detail/difficulty-badge';
import { DashboardPageHeader } from '@/views/Dashboard/components/DashboardPageHeader';
import { dashboardCardClass } from '@/views/Dashboard/dashboardUi';
import {
  WEEKDAYS,
  type Instructor,
  type ScheduleEntry,
  type Studio,
  type StudioSubscription,
  type Weekday,
} from '@/data/mock-data';
import { CalendarDays, CreditCard, Edit, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type AdminProps = {
  variant: 'admin';
  studios: Studio[];
  schedule: ScheduleEntry[];
  subscriptions: StudioSubscription[];
  instructors: Instructor[];
  onAdd: () => void;
  onEdit: (entry: ScheduleEntry) => void;
};

type UserProps = {
  variant: 'user';
  studioSchedule: ScheduleEntry[];
  subscription: StudioSubscription | undefined;
  instructors: Instructor[];
  isAuthenticated: boolean;
};

export type ScheduleContentProps = AdminProps | UserProps;

export function ScheduleContent(props: ScheduleContentProps) {
  if (props.variant === 'admin') {
    return (
      <AdminScheduleContent
        studios={props.studios}
        schedule={props.schedule}
        subscriptions={props.subscriptions}
        instructors={props.instructors}
        onAdd={props.onAdd}
        onEdit={props.onEdit}
      />
    );
  }
  return (
    <UserScheduleContent
      studioSchedule={props.studioSchedule}
      subscription={props.subscription}
      instructors={props.instructors}
      isAuthenticated={props.isAuthenticated}
    />
  );
}

function buildScheduleByDay(studioSchedule: ScheduleEntry[]) {
  return WEEKDAYS.reduce((acc, day) => {
    acc[day] = studioSchedule.filter(s => s.day === day);
    return acc;
  }, {} as Record<Weekday, ScheduleEntry[]>);
}

function WeeklyScheduleList({
  scheduleByDay,
  instructors,
  renderTrailing,
  emptyState,
}: {
  scheduleByDay: Record<Weekday, ScheduleEntry[]>;
  instructors: Instructor[];
  renderTrailing: (entry: ScheduleEntry) => ReactNode;
  emptyState: { title: string; subtitle?: string };
}) {
  const totalEntries = WEEKDAYS.reduce((n, day) => n + scheduleByDay[day].length, 0);

  return (
    <div className="space-y-4">
      {WEEKDAYS.map(day => {
        const entries = scheduleByDay[day];
        if (entries.length === 0) return null;
        return (
          <div key={day} className={`${dashboardCardClass} overflow-hidden`}>
            <div className="border-b border-border/80 bg-linear-to-r from-primary/8 via-muted/40 to-transparent px-5 py-3">
              <h3 className="text-sm font-semibold text-foreground">{day}</h3>
            </div>
            <div className="divide-y divide-border/70">
              {entries
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map(entry => {
                  const instructor = instructors.find(i => i.id === entry.instructorId);
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/25"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="min-w-[56px] shrink-0 rounded-lg bg-primary/8 px-2 py-1 text-center">
                          <p className="text-sm font-bold tabular-nums text-primary">{entry.startTime}</p>
                          <p className="text-xs text-muted-foreground">{entry.endTime}</p>
                        </div>
                        <Separator orientation="vertical" className="h-10 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">{entry.className}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {entry.yogaType}
                            </Badge>
                            <DifficultyBadge difficulty={entry.difficulty} />
                            {instructor && <span className="text-xs text-muted-foreground">с {instructor.name}</span>}
                          </div>
                        </div>
                      </div>
                      {renderTrailing(entry)}
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
      {totalEntries === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">{emptyState.title}</p>
          {emptyState.subtitle ? <p className="text-sm mt-1">{emptyState.subtitle}</p> : null}
        </div>
      )}
    </div>
  );
}

function AdminScheduleContent({
  studios,
  schedule,
  subscriptions,
  instructors,
  onAdd,
  onEdit,
}: {
  studios: Studio[];
  schedule: ScheduleEntry[];
  subscriptions: StudioSubscription[];
  instructors: Instructor[];
  onAdd: () => void;
  onEdit: (entry: ScheduleEntry) => void;
}) {
  const [selectedStudio, setSelectedStudio] = useState<string>(studios[0]?.id || '');
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');

  const studioSchedule = schedule.filter(s => s.studioId === selectedStudio);
  const subscription = subscriptions.find(s => s.studioId === selectedStudio);
  const scheduleByDay = buildScheduleByDay(studioSchedule);

  const handleDelete = (entry: ScheduleEntry) => {
    toast.success(`"${entry.className}" беше изтрит от разписанието.`);
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Разписание"
        description="Управлявайте седмичното разписание на вашите студиа и абонаментите към тях."
        actions={
          <Button onClick={onAdd} className="gap-2 shadow-sm shadow-primary/20">
            <Plus className="h-4 w-4" /> Добави час
          </Button>
        }
      />

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Select value={selectedStudio} onValueChange={setSelectedStudio}>
          <SelectTrigger className="w-full rounded-xl border-border/80 bg-card sm:w-[250px]">
            <SelectValue placeholder="Изберете студио" />
          </SelectTrigger>
          <SelectContent>
            {studios.map(s => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex rounded-xl border border-border/60 bg-muted/40 p-1">
          {(['weekly', 'monthly'] as const).map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                viewMode === mode
                  ? 'bg-card text-primary shadow-sm ring-1 ring-primary/15'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{mode === 'weekly' ? 'Седмично' : 'Месечно'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={`${dashboardCardClass} p-5`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-secondary/15 p-2.5 ring-1 ring-secondary/25">
              <CreditCard className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Месечен абонамент</h3>
              {subscription?.hasMonthlySubscription ? (
                <>
                  <p className="mt-0.5 text-sm text-muted-foreground">{subscription.subscriptionNote}</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-primary">
                    {subscription.monthlyPrice} лв./мес.
                  </p>
                </>
              ) : (
                <p className="mt-0.5 text-sm text-muted-foreground">Не е активиран за това студио</p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-2 rounded-xl border-primary/20 hover:bg-primary/5"
            onClick={() => toast.info('За активиране на абонамент, моля свържете се с нас на admin@Zenno.bg')}
          >
            <MessageSquare className="h-4 w-4" />
            {subscription?.hasMonthlySubscription ? 'Промени' : 'Заявка'}
          </Button>
        </div>
      </div>

      {viewMode === 'weekly' && (
        <WeeklyScheduleList
          scheduleByDay={scheduleByDay}
          instructors={instructors}
          renderTrailing={entry => (
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">{entry.price} лв.</p>
                <p className="text-xs text-muted-foreground">{entry.maxCapacity} места</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(entry)}>
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(entry)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          )}
          emptyState={{
            title: 'Няма добавени часове',
            subtitle: 'Добавете първия час в разписанието',
          }}
        />
      )}

      {viewMode === 'monthly' && (
        <div className={`${dashboardCardClass} overflow-hidden`}>
          <div className="grid grid-cols-7 border-b border-border/80 bg-linear-to-r from-primary/7 via-muted/35 to-transparent">
            {WEEKDAYS.map(day => (
              <div
                key={day}
                className="border-r border-border/70 p-3 text-center text-xs font-semibold text-yoga-secondary-deep last:border-r-0"
              >
                {day.slice(0, 3)}
              </div>
            ))}
          </div>
          <div className="grid min-h-[200px] grid-cols-7">
            {WEEKDAYS.map(day => {
              const entries = scheduleByDay[day];
              return (
                <div key={day} className="min-h-[120px] border-r border-border/60 p-2 last:border-r-0">
                  {entries
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map(entry => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => onEdit(entry)}
                        className="mb-1.5 w-full rounded-lg border border-primary/10 bg-primary/6 p-2 text-left transition-colors hover:border-primary/25 hover:bg-primary/11"
                      >
                        <p className="text-xs font-semibold tabular-nums text-primary">{entry.startTime}</p>
                        <p className="truncate text-xs text-foreground">{entry.className}</p>
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

function UserScheduleContent({
  studioSchedule,
  subscription,
  instructors,
  isAuthenticated,
}: {
  studioSchedule: ScheduleEntry[];
  subscription: StudioSubscription | undefined;
  instructors: Instructor[];
  isAuthenticated: boolean;
}) {
  const scheduleByDay = buildScheduleByDay(studioSchedule);

  return (
    <div className="space-y-6">
      {subscription?.hasMonthlySubscription && (
        <div id="studio-subscription" className="scroll-mt-24 rounded-xl border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Месечен абонамент</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{subscription.subscriptionNote}</p>
              <p className="text-lg font-bold text-primary mt-1">{subscription.monthlyPrice} лв./мес.</p>
            </div>
          </div>
        </div>
      )}

      <WeeklyScheduleList
        scheduleByDay={scheduleByDay}
        instructors={instructors}
        renderTrailing={entry => (
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-foreground">{entry.price} лв.</p>
              <p className="text-xs text-muted-foreground">{entry.maxCapacity} места</p>
            </div>
            <Button
              size="sm"
              className="rounded-lg shrink-0"
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
        )}
        emptyState={{
          title: 'Няма добавено разписание за това студио.',
        }}
      />
    </div>
  );
}
