'use client';

import { useState } from 'react';

import { StudiosSection } from '@/views/Dashboard/components/StudiosSection';
import { StudioModal } from '@/views/Dashboard/components/modals/StudioModal';
import { toastDashboardSaved } from '@/views/Dashboard/dashboardSaveToast';

export default function DashboardStudiosPage() {
  const [studiosRefreshKey, setStudiosRefreshKey] = useState(0);
  const [studioModalOpen, setStudioModalOpen] = useState(false);

  const handleSave = () => {
    toastDashboardSaved('studio');
    setStudioModalOpen(false);
    setStudiosRefreshKey((k) => k + 1);
  };

  return (
    <>
      <StudiosSection
        refreshKey={studiosRefreshKey}
        onAdd={() => setStudioModalOpen(true)}
        onEdit={() => setStudioModalOpen(true)}
      />
      <StudioModal open={studioModalOpen} onClose={() => setStudioModalOpen(false)} onSave={handleSave} />
    </>
  );
}
