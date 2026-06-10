'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { DifficultyBadge } from '@/components/studio-detail/difficulty-badge';
import { MultisportBadge } from '@/components/multisport/multisport-badge';
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
import Link from 'next/link';
import { CalendarDays, CreditCard, Edit, Plus, Trash2 } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatPriceDualFromBgn, formatSubscriptionDualFromBgn } from '@/lib/eur-bgn';
import {
  formatClassCapacityDisplay,
  formatClassPriceDisplay,
  isClassAtCapacity,
  isUnlimitedClassCapacity,
} from '@/lib/yoga-class-limits';
import { StudioTabEmptyState } from '@/components/studio-detail/studio-tab-empty-state';
import { TeachingModePill } from '@/components/studio/teaching-mode-badge';
import type { TeachingMode } from '@/data/mock-data';

export type AdminProps = {
  variant: 'admin';
  studios: Studio[];
  schedule: ScheduleEntry[];
  instructors: Instructor[];
  onAdd: () => void;
  onEdit: (entry: ScheduleEntry) => void;
  onDelete: (entry: ScheduleEntry) => void;
};

type UserProps = {
  variant: 'user';
  studioSchedule: ScheduleEntry[];
  subscription: StudioSubscription | undefined;
  instructors: Instructor[];
  isAuthenticated: boolean;
  checkoutModalOpen: boolean;
  onRequestScheduleBook: (entry: ScheduleEntry) => void;
  bookedScheduleEntryIds: string[];
  studioTeachingMode?: TeachingMode;
};

export type ScheduleContentProps = AdminProps | UserProps;

export function ScheduleContent(props: ScheduleContentProps) {
  if (props.variant === 'admin') {
    return (
      <AdminScheduleContent
        studios={props.studios}
        schedule={props.schedule}
        instructors={props.instructors}
        onAdd={props.onAdd}
        onEdit={props.onEdit}
        onDelete={props.onDelete}
      />
    );
  }
  return (
    <UserScheduleContent
      studioSchedule={props.studioSchedule}
      subscription={props.subscription}
      instructors={props.instructors}
      isAuthenticated={props.isAuthenticated}
      checkoutModalOpen={props.checkoutModalOpen}
      onRequestScheduleBook={props.onRequestScheduleBook}
      bookedScheduleEntryIds={props.bookedScheduleEntryIds}
      studioTeachingMode={props.studioTeachingMode}
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
  studioTeachingMode,
}: {
  scheduleByDay: Record<Weekday, ScheduleEntry[]>;
  instructors: Instructor[];
  renderTrailing: (entry: ScheduleEntry) => ReactNode;
  emptyState: { title: string; subtitle?: string };
  studioTeachingMode?: TeachingMode;
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
                      className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/25 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <div className="flex min-w-0 items-center gap-4">
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
                            {entry.acceptsMultisport ? <MultisportBadge size="sm" /> : null}
                            {studioTeachingMode === 'online' ? (
                              <TeachingModePill mode="online" />
                            ) : null}
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
        <StudioTabEmptyState icon={CalendarDays} title={emptyState.title} subtitle={emptyState.subtitle} />
      )}
    </div>
  );
}

function AdminScheduleContent({
  studios,
  schedule,
  instructors,
  onAdd,
  onEdit,
  onDelete,
}: {
  studios: Studio[];
  schedule: ScheduleEntry[];
  instructors: Instructor[];
  onAdd: () => void;
  onEdit: (entry: ScheduleEntry) => void;
  onDelete: (entry: ScheduleEntry) => void;
}) {
  const [selectedStudio, setSelectedStudio] = useState<string>(studios[0]?.id || '');
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    if (studios.length === 0) {
      setSelectedStudio('');
      return;
    }
    setSelectedStudio(prev => {
      if (prev && studios.some(s => s.id === prev)) return prev;
      return studios[0].id;
    });
  }, [studios]);

  const studioSchedule = schedule.filter(s => s.studioId === selectedStudio);
  const scheduleByDay = buildScheduleByDay(studioSchedule);

  const instructorsForStudio = instructors.filter(i => i.studioId === selectedStudio);
  const addScheduleDisabled = studios.length === 0 || instructorsForStudio.length === 0;
  const addScheduleTooltip =
    studios.length === 0
      ? 'Първо създайте студио в раздел Студиа.'
      : 'Добавете поне един инструктор за избраното студио.';
  const addScheduleHint =
    studios.length === 0 ? (
      <>
        Първо създайте студио в раздел{' '}
        <Link href="/dashboard/studios" className="font-medium text-primary underline-offset-4 hover:underline">
          Студиа
        </Link>
        .
      </>
    ) : (
      <>
        Добавете поне един инструктор за избраното студио в раздел{' '}
        <Link
          href="/dashboard/instructors"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Инструктори
        </Link>
        .
      </>
    );

  const addScheduleButton = (
    <Button
      type="button"
      disabled={addScheduleDisabled}
      onClick={onAdd}
      className="gap-2 shadow-sm shadow-primary/20"
    >
      <Plus className="h-4 w-4" /> Добави час
    </Button>
  );

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Разписание"
        description="Управлявайте седмичното разписание на вашите студиа."
        actions={
          <div className="flex max-w-md flex-col items-stretch gap-2 sm:items-end">
            {addScheduleDisabled ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex justify-end">{addScheduleButton}</span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>{addScheduleTooltip}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              addScheduleButton
            )}
            {addScheduleDisabled ? (
              <p className="text-right text-xs leading-relaxed text-muted-foreground">{addScheduleHint}</p>
            ) : null}
          </div>
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

      {viewMode === 'weekly' && (
        <WeeklyScheduleList
          scheduleByDay={scheduleByDay}
          instructors={instructors}
          renderTrailing={entry => (
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">{formatPriceDualFromBgn(entry.price)}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.maxCapacity} места
                </p>
                {entry.acceptsMultisport ? (
                  <div className="mt-1.5 flex justify-end">
                    <MultisportBadge size="sm" />
                  </div>
                ) : null}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(entry)}>
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onDelete(entry)}
                  aria-label={`Изтриване на ${entry.className}`}
                >
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
  checkoutModalOpen,
  onRequestScheduleBook,
  bookedScheduleEntryIds,
  studioTeachingMode,
}: {
  studioSchedule: ScheduleEntry[];
  subscription: StudioSubscription | undefined;
  instructors: Instructor[];
  isAuthenticated: boolean;
  checkoutModalOpen: boolean;
  onRequestScheduleBook: (entry: ScheduleEntry) => void;
  bookedScheduleEntryIds: string[];
  studioTeachingMode?: TeachingMode;
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
              <h3 className="font-semibold text-foreground">
                {subscription.name ?? 'Абонамент'}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {subscription.includes ?? subscription.subscriptionNote}
              </p>
              <p className="text-lg font-bold text-primary mt-1">
                {formatSubscriptionDualFromBgn(
                  subscription.monthlyPrice ?? 0,
                  subscription.durationMonths ?? 1,
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <WeeklyScheduleList
        scheduleByDay={scheduleByDay}
        instructors={instructors}
        studioTeachingMode={studioTeachingMode}
        renderTrailing={entry => {
          const alreadyBooked = isAuthenticated && bookedScheduleEntryIds.includes(entry.id);
          const isFull = isClassAtCapacity(entry.enrolled, entry.maxCapacity);
          const capacityLabel = formatClassCapacityDisplay(entry.enrolled, entry.maxCapacity);
          return (
            <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:shrink-0 sm:justify-end">
              <div className="min-w-0 text-left sm:text-right">
                <p className="text-sm font-semibold text-foreground">{formatClassPriceDisplay(entry.price)}</p>
                <p className="text-xs text-muted-foreground">
                  {isUnlimitedClassCapacity(entry.maxCapacity) ? capacityLabel : `${capacityLabel} места`}
                </p>
              </div>
              <Button
                size="sm"
                className="shrink-0 rounded-lg"
                variant={alreadyBooked ? 'outline' : 'default'}
                disabled={checkoutModalOpen || isFull || alreadyBooked}
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error('Моля, влезте, за да се запишете.');
                    return;
                  }
                  if (alreadyBooked) {
                    return;
                  }
                  if (isFull) {
                    toast.info('Този час е пълен.');
                    return;
                  }
                  onRequestScheduleBook(entry);
                }}
              >
                {alreadyBooked ? 'Вече сте записани' : isFull ? 'Пълен' : 'Запиши се'}
              </Button>
            </div>
          );
        }}
        emptyState={{
          title: 'Няма добавено разписание за това студио.',
        }}
      />
    </div>
  );
}
