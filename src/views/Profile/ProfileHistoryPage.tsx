'use client';

import { useState } from 'react';
import { mockStudios, mockClasses, mockInstructors } from '@/data/mock-data';
import { ProfileHistoryTab } from '@/components/profile/profile-history-tab';
import { ProfileClassDetailDialog } from '@/components/profile/profile-class-detail-dialog';
import { mockAttendedClasses } from '@/components/profile/profile-mock-data';

export default function ProfileHistoryPage() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [showEmptyHistory, setShowEmptyHistory] = useState(false);

  const selected = selectedClass ? mockClasses.find((c) => c.id === selectedClass) ?? null : null;
  const selectedInstructor = selected ? mockInstructors.find((i) => i.id === selected.instructorId) : undefined;
  const selectedStudio = selected ? mockStudios.find((s) => s.id === selected.studioId) : undefined;
  const attendedDate = selectedClass
    ? mockAttendedClasses.find((a) => a.classId === selectedClass)?.attendedDate
    : null;

  const attendedClasses = showEmptyHistory ? [] : mockAttendedClasses;
  const totalClasses = attendedClasses.length;

  return (
    <>
      <ProfileHistoryTab
        attendedClasses={attendedClasses}
        totalClasses={totalClasses}
        showEmptyHistory={showEmptyHistory}
        onToggleEmptyHistory={() => setShowEmptyHistory(!showEmptyHistory)}
        onSelectClass={setSelectedClass}
      />

      <ProfileClassDetailDialog
        open={!!selectedClass}
        onOpenChange={(open) => !open && setSelectedClass(null)}
        selected={selected}
        selectedInstructor={selectedInstructor}
        selectedStudio={selectedStudio}
        attendedDate={attendedDate}
      />
    </>
  );
}
