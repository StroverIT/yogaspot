import { Star, UsersRound } from 'lucide-react';
import type { Instructor } from '@/data/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StudioTabEmptyState } from '@/components/studio-detail/studio-tab-empty-state';

export function InstructorsTabContent({ studioInstructors }: { studioInstructors: Instructor[] }) {
  if (studioInstructors.length === 0) {
    return (
      <StudioTabEmptyState
        icon={UsersRound}
        title="Няма добавени инструктори"
        subtitle="Информацията за екипа ще се покаже тук, когато бъде попълнена."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {studioInstructors.map((instr) => (
        <div key={instr.id} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border border-border bg-sage/30">
              {instr.photo ? <AvatarImage src={instr.photo} alt={instr.name} /> : null}
              <AvatarFallback className="bg-sage/30 text-2xl">
                {'\u{1F9D1}\u{200D}\u{1F3EB}'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-display font-semibold text-foreground">{instr.name}</h4>
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                <span>{instr.rating}</span>
                <span className="text-muted-foreground">· {instr.experienceLevel}</span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{instr.bio}</p>
          <div className="mt-3 flex gap-1">
            {instr.yogaStyle.map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
