'use client';

import { useState } from 'react';

import { ScheduleContent } from '@/components/schedule/schedule-content';
import { ScheduleModal } from '@/views/Dashboard/components/modals/ScheduleModal';
import type { ScheduleEntry } from '@/data/mock-data';
import { deriveDashboardMetrics } from '@/views/Dashboard/dashboardMockData';
import { toastDashboardSaved } from '@/views/Dashboard/dashboardSaveToast';
import { useDashboardWorkspace } from '@/hooks/useDashboardWorkspace';

export default function DashboardSchedulePage() {
  const ws = useDashboardWorkspace();
  const { myStudios, myInstructors } = deriveDashboardMetrics(ws.studios, ws.classes, ws.instructors);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleEntry | null>(null);

  const handleSave = () => {
    toastDashboardSaved('schedule');
    setScheduleModalOpen(false);
    setEditingSchedule(null);
    void ws.reload();
  };

  if (ws.loading) return <div className="text-muted-foreground">Зареждане…</div>;
  if (ws.error) return <div className="text-destructive">{ws.error}</div>;

  return (
    <>
      <ScheduleContent
        variant="admin"
        studios={myStudios}
        schedule={ws.schedule}
        subscriptions={ws.subscriptions}
        instructors={myInstructors}
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
