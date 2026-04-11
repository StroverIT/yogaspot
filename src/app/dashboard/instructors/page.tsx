'use client';

import { useState } from 'react';

import { InstructorsSection } from '@/views/Dashboard/components/InstructorsSection';
import { InstructorModal } from '@/views/Dashboard/components/modals/InstructorModal';
import { getDashboardMockData } from '@/views/Dashboard/dashboardMockData';
import { toastDashboardSaved } from '@/views/Dashboard/dashboardSaveToast';

export default function DashboardInstructorsPage() {
  const { myStudios, myInstructors } = getDashboardMockData();
  const [instructorModalOpen, setInstructorModalOpen] = useState(false);

  const handleSave = () => {
    toastDashboardSaved('instructor');
    setInstructorModalOpen(false);
  };

  return (
    <>
      <InstructorsSection
        instructors={myInstructors}
        onAdd={() => setInstructorModalOpen(true)}
        onEdit={() => setInstructorModalOpen(true)}
      />
      <InstructorModal
        open={instructorModalOpen}
        onClose={() => setInstructorModalOpen(false)}
        onSave={handleSave}
        studios={myStudios}
      />
    </>
  );
}
