import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Instructor, Studio, YogaClass } from '@/data/mock-data';
import type { AttendedClass } from '@/components/profile/profile-mock-data';
import { ProfileAttendedClassCard } from '@/components/profile/profile-attended-class-card';

interface ProfileHistoryTabProps {
  attendedClasses: AttendedClass[];
  totalClasses: number;
  classes: YogaClass[];
  instructors: Instructor[];
  studios: Studio[];
  onSelectClass: (classId: string) => void;
}

export const ProfileHistoryTab = ({
  attendedClasses,
  totalClasses,
  classes,
  instructors,
  studios,
  onSelectClass,
}: ProfileHistoryTabProps) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-muted-foreground">{totalClasses} посетени класа</p>
    </div>

    {attendedClasses.length === 0 ? (
      <div className="text-center py-16">
        <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="font-display text-xl font-semibold text-foreground mb-2">Няма посетени класове</h3>
        <p className="text-muted-foreground mb-6">Запишете се за клас и той ще се появи тук след посещение.</p>
        <Button asChild variant="outline">
          <Link href="/discover">Открий студио</Link>
        </Button>
      </div>
    ) : (
      attendedClasses.map((attended) => {
        const cls = classes.find((c) => c.id === attended.classId);
        if (!cls) return null;
        const instructor = instructors.find((i) => i.id === cls.instructorId);
        const studio = studios.find((s) => s.id === cls.studioId);

        return (
          <ProfileAttendedClassCard
            key={`${attended.classId}-${attended.attendedDate}`}
            attended={attended}
            cls={cls}
            instructor={instructor}
            studio={studio}
            onSelect={onSelectClass}
          />
        );
      })
    )}
  </div>
);
