import { Calendar, ChevronRight, MapPin, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Instructor, Studio, YogaClass } from '@/data/mock-data';
import type { AttendedClass } from '@/components/profile/profile-mock-data';
import { formatDate, getDifficultyColor } from '@/components/profile/profile-utils';

interface ProfileAttendedClassCardProps {
  attended: AttendedClass;
  cls: YogaClass;
  instructor: Instructor | undefined;
  studio: Studio | undefined;
  onSelect: (classId: string) => void;
}

export const ProfileAttendedClassCard = ({
  attended,
  cls,
  instructor,
  studio,
  onSelect,
}: ProfileAttendedClassCardProps) => (
  <Card
    className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30"
    onClick={() => onSelect(cls.id)}
  >
    <CardContent className="p-5">
      <div className="flex items-start gap-4">
        <div className="hidden sm:flex flex-col items-center justify-center min-w-[56px] rounded-xl bg-primary/10 p-3">
          <span className="text-xs font-medium text-primary uppercase">
            {new Date(attended.attendedDate).toLocaleDateString('bg-BG', { month: 'short' })}
          </span>
          <span className="text-xl font-bold text-primary leading-tight">{new Date(attended.attendedDate).getDate()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-lg font-semibold text-foreground truncate">{cls.name}</h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {studio?.name}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {instructor?.name}
                </span>
                <span className="flex items-center gap-1 sm:hidden">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(attended.attendedDate)}
                </span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0 mt-1" />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="secondary" className="text-xs font-medium">
              {cls.yogaType}
            </Badge>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getDifficultyColor(cls.difficulty)}`}
            >
              {cls.difficulty}
            </span>
            <Badge variant="outline" className="text-xs">
              {cls.startTime} – {cls.endTime}
            </Badge>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
