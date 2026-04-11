'use client';

import { useState } from 'react';

import { ClassesSection } from '@/views/Dashboard/components/ClassesSection';
import { ClassModal } from '@/views/Dashboard/components/modals/ClassModal';
import { getDashboardMockData } from '@/views/Dashboard/dashboardMockData';
import { toastDashboardSaved } from '@/views/Dashboard/dashboardSaveToast';

export default function DashboardClassesPage() {
  const { myStudios, myClasses, myInstructors } = getDashboardMockData();
  const [classModalOpen, setClassModalOpen] = useState(false);

  const handleSave = () => {
    toastDashboardSaved('class');
    setClassModalOpen(false);
  };

  return (
    <>
      <ClassesSection
        classes={myClasses}
        onAdd={() => setClassModalOpen(true)}
        onEdit={() => setClassModalOpen(true)}
      />
      <ClassModal
        open={classModalOpen}
        onClose={() => setClassModalOpen(false)}
        onSave={handleSave}
        studios={myStudios}
        instructors={myInstructors}
      />
    </>
  );
}
