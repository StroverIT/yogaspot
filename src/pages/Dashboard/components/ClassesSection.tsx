import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockStudios, mockClasses, mockInstructors } from '@/data/mock-data';
import { AlertCircle, Building2, Clock, Edit, GraduationCap, Plus, Trash2 } from 'lucide-react';
import { DifficultyBadge } from './DifficultyBadge';

export function ClassesSection({
  classes,
  onAdd,
  onEdit,
}: {
  classes: typeof mockClasses;
  onAdd: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Класове</h1>
          <p className="text-muted-foreground text-sm mt-1">{classes.length} класа</p>
        </div>
        <Button onClick={onAdd} className="gap-2"><Plus className="h-4 w-4" /> Добави клас</Button>
      </div>
      <div className="space-y-4">
        {classes.map((cls) => {
          const instr = mockInstructors.find(ins => ins.id === cls.instructorId);
          const studio = mockStudios.find(s => s.id === cls.studioId);
          const fill = Math.round((cls.enrolled / cls.maxCapacity) * 100);
          const isFull = cls.enrolled >= cls.maxCapacity;

          return (
            <div
              key={cls.id}
              className="group rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Date block */}
                <div className="hidden md:flex flex-col items-center justify-center min-w-[64px] rounded-xl bg-primary/10 p-3">
                  <span className="text-xs font-medium text-primary uppercase">
                    {new Date(cls.date).toLocaleDateString('bg-BG', { month: 'short' })}
                  </span>
                  <span className="text-xl font-bold text-primary leading-tight">
                    {new Date(cls.date).getDate()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">{cls.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{cls.startTime} – {cls.endTime}</span>
                        {instr && <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />{instr.name}</span>}
                        {studio && <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{studio.name}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="font-display text-lg font-bold text-foreground">{cls.price} лв.</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Badge variant="secondary" className="text-xs">{cls.yogaType}</Badge>
                    <DifficultyBadge difficulty={cls.difficulty} />
                    {isFull && (
                      <Badge variant="destructive" className="text-xs gap-1">
                        <AlertCircle className="h-3 w-3" /> Пълен
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1 max-w-[200px]">
                      <Progress value={fill} className="h-2" />
                    </div>
                    <span className="text-xs text-muted-foreground">{cls.enrolled}/{cls.maxCapacity}</span>
                  </div>
                </div>

                <div className="flex md:flex-col gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

