'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
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
  type SubscriptionRequestDto,
  type Weekday,
} from '@/data/mock-data';
import Link from 'next/link';
import { CalendarDays, CreditCard, Edit, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatMonthlyDualFromBgn, formatPriceDualFromBgn } from '@/lib/eur-bgn';
import { SubscriptionRequestDetailsModal } from '@/views/Dashboard/components/modals/SubscriptionRequestDetailsModal';
import { SubscriptionRequestFormModal } from '@/views/Dashboard/components/modals/SubscriptionRequestFormModal';
import { SubscriptionRequestStatusModal } from '@/views/Dashboard/components/modals/SubscriptionRequestStatusModal';
import { StudioTabEmptyState } from '@/components/studio-detail/studio-tab-empty-state';

export type AdminProps = {
  variant: 'admin';
  studios: Studio[];
  schedule: ScheduleEntry[];
  subscriptions: StudioSubscription[];
  subscriptionRequests: SubscriptionRequestDto[];
  onWorkspaceReload: () => void | Promise<void>;
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
};

export type ScheduleContentProps = AdminProps | UserProps;

export function ScheduleContent(props: ScheduleContentProps) {
  if (props.variant === 'admin') {
    return (
      <AdminScheduleContent
        studios={props.studios}
        schedule={props.schedule}
        subscriptions={props.subscriptions}
        subscriptionRequests={props.subscriptionRequests}
        onWorkspaceReload={props.onWorkspaceReload}
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
        <StudioTabEmptyState icon={CalendarDays} title={emptyState.title} subtitle={emptyState.subtitle} />
      )}
    </div>
  );
}

function AdminScheduleContent({
  studios,
  schedule,
  subscriptions,
  subscriptionRequests,
  onWorkspaceReload,
  instructors,
  onAdd,
  onEdit,
  onDelete,
}: {
  studios: Studio[];
  schedule: ScheduleEntry[];
  subscriptions: StudioSubscription[];
  subscriptionRequests: SubscriptionRequestDto[];
  onWorkspaceReload: () => void | Promise<void>;
  instructors: Instructor[];
  onAdd: () => void;
  onEdit: (entry: ScheduleEntry) => void;
  onDelete: (entry: ScheduleEntry) => void;
}) {
  const [selectedStudio, setSelectedStudio] = useState<string>(studios[0]?.id || '');
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

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

  useEffect(() => {
    setFormModalOpen(false);
    setStatusModalOpen(false);
    setDetailsModalOpen(false);
  }, [selectedStudio]);

  const studioSchedule = schedule.filter(s => s.studioId === selectedStudio);
  const subscription = subscriptions.find(s => s.studioId === selectedStudio);
  const selectedStudioName = studios.find(s => s.id === selectedStudio)?.name ?? '';
  const latestRequest = useMemo(() => {
    const forStudio = subscriptionRequests.filter(r => r.studioId === selectedStudio);
    if (forStudio.length === 0) return null;
    return [...forStudio].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  }, [subscriptionRequests, selectedStudio]);
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
        description="Управлявайте седмичното разписание на вашите студиа и абонаментите към тях."
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

      <div className={`${dashboardCardClass} p-5`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <div className="rounded-xl bg-secondary/15 p-2.5 ring-1 ring-secondary/25 shrink-0">
              <CreditCard className="h-5 w-5 text-secondary" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-foreground">Месечен абонамент</h3>
                {latestRequest?.status === 'PENDING' ? (
                  <Badge variant="secondary" className="text-xs">
                    Заявка: изчаква одобрение
                  </Badge>
                ) : null}
              </div>
              {subscription?.hasMonthlySubscription ? (
                <>
                  <p className="mt-0.5 text-sm text-muted-foreground">{subscription.subscriptionNote}</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-primary">
                    {formatMonthlyDualFromBgn(subscription.monthlyPrice)}
                  </p>
                </>
              ) : (
                <p className="mt-0.5 text-sm text-muted-foreground">Не е активиран за това студио</p>
              )}
              {!subscription?.hasMonthlySubscription && latestRequest && latestRequest.status !== 'PENDING' ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Последна заявка:{' '}
                  {latestRequest.status === 'ACCEPTED' ? 'одобрена.' : 'отказана от администратор.'}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
            {!subscription?.hasMonthlySubscription && latestRequest?.status === 'PENDING' ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl border-primary/20 hover:bg-primary/5"
                onClick={() => setStatusModalOpen(true)}
              >
                <MessageSquare className="h-4 w-4" />
                Преглед на заявката
              </Button>
            ) : null}
            {!subscription?.hasMonthlySubscription &&
            latestRequest &&
            latestRequest.status !== 'PENDING' ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl border-primary/20 hover:bg-primary/5"
                onClick={() => setDetailsModalOpen(true)}
              >
                Пълни детайли
              </Button>
            ) : null}
            {!subscription?.hasMonthlySubscription && (!latestRequest || latestRequest.status !== 'PENDING') ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl border-primary/20 hover:bg-primary/5"
                onClick={() => setFormModalOpen(true)}
              >
                <MessageSquare className="h-4 w-4" />
                Заявка
              </Button>
            ) : null}
            {subscription?.hasMonthlySubscription ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl border-primary/20 hover:bg-primary/5"
                onClick={() => toast.info('За промяна на абонамент, моля свържете се с нас на admin@Zenno.bg')}
              >
                <MessageSquare className="h-4 w-4" />
                Промени
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <SubscriptionRequestFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        studioId={selectedStudio}
        studioName={selectedStudioName}
        onSuccess={onWorkspaceReload}
      />
      <SubscriptionRequestStatusModal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        request={latestRequest}
        studioName={selectedStudioName}
        onOpenFullDetails={() => setDetailsModalOpen(true)}
      />
      <SubscriptionRequestDetailsModal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        request={latestRequest}
        studioName={selectedStudioName}
      />

      {viewMode === 'weekly' && (
        <WeeklyScheduleList
          scheduleByDay={scheduleByDay}
          instructors={instructors}
          renderTrailing={entry => (
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">{formatPriceDualFromBgn(entry.price)}</p>
                <p className="text-xs text-muted-foreground">{entry.maxCapacity} места</p>
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
}: {
  studioSchedule: ScheduleEntry[];
  subscription: StudioSubscription | undefined;
  instructors: Instructor[];
  isAuthenticated: boolean;
  checkoutModalOpen: boolean;
  onRequestScheduleBook: (entry: ScheduleEntry) => void;
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
              <p className="text-lg font-bold text-primary mt-1">{formatMonthlyDualFromBgn(subscription.monthlyPrice)}</p>
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
              <p className="text-sm font-semibold text-foreground">{formatPriceDualFromBgn(entry.price)}</p>
              <p className="text-xs text-muted-foreground">
                {entry.enrolled}/{entry.maxCapacity} места
              </p>
            </div>
            <Button
              size="sm"
              className="rounded-lg shrink-0"
              disabled={checkoutModalOpen || entry.enrolled >= entry.maxCapacity}
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error('Моля, влезте, за да се запишете.');
                  return;
                }
                if (entry.enrolled >= entry.maxCapacity) {
                  toast.info('Този час е пълен.');
                  return;
                }
                onRequestScheduleBook(entry);
              }}
            >
              {entry.enrolled >= entry.maxCapacity ? 'Пълен' : 'Запиши се'}
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
