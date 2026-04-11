import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Instructor, Studio, YogaClass } from '@/data/mock-data';
import { formatPriceDualFromBgn } from '@/lib/eur-bgn';
import { AlertCircle, Building2, Clock, Edit, GraduationCap, Plus, Trash2 } from 'lucide-react';

import { dashboardCardClass } from '../dashboardUi';
import { DashboardOccupancyBar } from './DashboardOccupancyBar';
import { DashboardPageHeader } from './DashboardPageHeader';
import { DifficultyBadge } from './DifficultyBadge';

export function ClassesSection({
  classes,
  studios,
  instructors,
  onAdd,
  onEdit,
  onDelete,
  addDisabled = false,
  addDisabledHint,
  addDisabledTooltip,
}: {
  classes: YogaClass[];
  studios: Studio[];
  instructors: Instructor[];
  onAdd: () => void;
  onEdit: (cls: YogaClass) => void;
  onDelete: (cls: YogaClass) => void;
  addDisabled?: boolean;
  addDisabledHint?: ReactNode;
  addDisabledTooltip?: string;
}) {
  const addButton = (
    <Button
      type="button"
      disabled={addDisabled}
      onClick={onAdd}
      className="gap-2 shadow-sm shadow-primary/20"
    >
      <Plus className="h-4 w-4" /> Добави клас
    </Button>
  );

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Класове"
        description={`${classes.length} класа — цени, ниво и заетост на един екран.`}
        actions={
          <div className="flex max-w-md flex-col items-stretch gap-2 sm:items-end">
            {addDisabled && addDisabledTooltip ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex justify-end">{addButton}</span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>{addDisabledTooltip}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              addButton
            )}
            {addDisabled && addDisabledHint ? (
              <p className="text-right text-xs leading-relaxed text-muted-foreground">{addDisabledHint}</p>
            ) : null}
          </div>
        }
      />
      <div className="space-y-4">
        {classes.map((cls) => {
          const instr = instructors.find(ins => ins.id === cls.instructorId);
          const studio = studios.find(s => s.id === cls.studioId);
          const isFull = cls.enrolled >= cls.maxCapacity;

          return (
            <div key={cls.id} className={`group ${dashboardCardClass} p-5`}>
              <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-5">
                {/* Date block — desktop sidebar */}
                <div className="hidden min-w-[72px] shrink-0 flex-col items-center justify-center self-start rounded-xl border border-primary/15 bg-linear-to-b from-primary/12 to-primary/5 p-3 md:flex">
                  <span className="text-xs font-semibold uppercase tracking-wide text-yoga-secondary-deep">
                    {new Date(cls.date).toLocaleDateString('bg-BG', { month: 'short' })}
                  </span>
                  <span className="text-xl font-bold leading-tight text-primary">
                    {new Date(cls.date).getDate()}
                  </span>
                </div>

                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                  {/* Mobile: date + actions row */}
                  <div className="mb-3 flex items-center justify-between gap-3 md:hidden">
                    <div className="flex items-center gap-2 rounded-xl border border-primary/15 bg-linear-to-b from-primary/12 to-primary/5 px-3 py-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-yoga-secondary-deep">
                        {new Date(cls.date).toLocaleDateString('bg-BG', { month: 'short' })}
                      </span>
                      <span className="text-lg font-bold tabular-nums leading-none text-primary">
                        {new Date(cls.date).getDate()}
                      </span>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onEdit(cls)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => onDelete(cls)}
                        aria-label={`Изтриване на ${cls.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex flex-col gap-3 min-[480px]:flex-row min-[480px]:items-start min-[480px]:justify-between md:gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-lg font-semibold leading-snug text-foreground">{cls.name}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            {cls.startTime} – {cls.endTime}
                          </span>
                          {instr && (
                            <span className="flex min-w-0 items-center gap-1">
                              <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{instr.name}</span>
                            </span>
                          )}
                          {studio && (
                            <span className="flex min-w-0 items-center gap-1">
                              <Building2 className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{studio.name}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 min-[480px]:text-right">
                        <span className="font-display text-lg font-bold tabular-nums text-primary md:text-xl">
                          {formatPriceDualFromBgn(cls.price)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {cls.yogaType}
                      </Badge>
                      <DifficultyBadge difficulty={cls.difficulty} />
                      {isFull && (
                        <Badge variant="destructive" className="gap-1 text-xs">
                          <AlertCircle className="h-3 w-3" /> Пълен
                        </Badge>
                      )}
                    </div>

                    <div className="mt-auto flex items-center gap-3 border-t border-border/40 pt-3">
                      <DashboardOccupancyBar
                        percent={
                          cls.maxCapacity > 0
                            ? (cls.enrolled / cls.maxCapacity) * 100
                            : 0
                        }
                        ariaLabel={`Заетост: ${cls.enrolled} от ${cls.maxCapacity} места`}
                        ariaValueNow={cls.enrolled}
                        ariaValueMax={cls.maxCapacity}
                      />
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {cls.enrolled}/{cls.maxCapacity}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hidden shrink-0 flex-col gap-1 self-start border-l border-border/50 pl-4 pt-0.5 md:flex">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(cls)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDelete(cls)}
                    aria-label={`Изтриване на ${cls.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

