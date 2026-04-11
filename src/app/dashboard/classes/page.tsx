'use client';

import { useState } from 'react';

import { ClassesSection } from '@/views/Dashboard/components/ClassesSection';
import { ClassModal } from '@/views/Dashboard/components/modals/ClassModal';
import { deriveDashboardMetrics } from '@/views/Dashboard/dashboardMockData';
import { toastDashboardSaved } from '@/views/Dashboard/dashboardSaveToast';
import { useDashboardWorkspace } from '@/hooks/useDashboardWorkspace';

export default function DashboardClassesPage() {
  const ws = useDashboardWorkspace();
  const { myStudios, myClasses, myInstructors } = deriveDashboardMetrics(ws.studios, ws.classes, ws.instructors);
  const [classModalOpen, setClassModalOpen] = useState(false);

  const handleSave = () => {
    toastDashboardSaved('class');
    setClassModalOpen(false);
    void ws.reload();
  };

  if (ws.loading) return <div className="text-muted-foreground">Зареждане…</div>;
  if (ws.error) return <div className="text-destructive">{ws.error}</div>;

  return (
    <div>
      <ClassesSection
        classes={myClasses}
        studios={myStudios}
        instructors={myInstructors}
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
    </div>
  );
}
