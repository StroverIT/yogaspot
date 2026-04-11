'use client';

import { useState } from 'react';

import { ScheduleSection } from '@/views/Dashboard/components/ScheduleSection';
import { ScheduleModal } from '@/views/Dashboard/components/modals/ScheduleModal';
import type { ScheduleEntry } from '@/data/mock-data';
import { getDashboardMockData } from '@/views/Dashboard/dashboardMockData';
import { toastDashboardSaved } from '@/views/Dashboard/dashboardSaveToast';

export default function DashboardSchedulePage() {
  const { myStudios, myInstructors } = getDashboardMockData();
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleEntry | null>(null);

  const handleSave = () => {
    toastDashboardSaved('schedule');
    setScheduleModalOpen(false);
    setEditingSchedule(null);
  };

  return (
    <>
      <ScheduleSection
        studios={myStudios}
        onAdd={() => {
          setEditingSchedule(null);
          setScheduleModalOpen(true);
        }}
        onEdit={(entry) => {
          setEditingSchedule(entry);
          setScheduleModalOpen(true);
        }}
      />
      <ScheduleModal
        open={scheduleModalOpen}
        onClose={() => {
          setScheduleModalOpen(false);
          setEditingSchedule(null);
        }}
        onSave={handleSave}
        studios={myStudios}
        instructors={myInstructors}
        entry={editingSchedule}
      />
    </>
  );
}
