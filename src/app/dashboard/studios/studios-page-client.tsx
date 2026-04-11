'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { DashboardStudioListItem } from '@/lib/dashboard-studios-data';
import { StudiosSection } from '@/views/Dashboard/components/StudiosSection';
import { StudioModal } from '@/views/Dashboard/components/modals/StudioModal';
import { toastDashboardSaved } from '@/views/Dashboard/dashboardSaveToast';

type DashboardStudiosPageClientProps = {
  studios: DashboardStudioListItem[];
};

export default function DashboardStudiosPageClient({ studios }: DashboardStudiosPageClientProps) {
  const router = useRouter();
  const [studioModalOpen, setStudioModalOpen] = useState(false);
  const [editingStudio, setEditingStudio] = useState<DashboardStudioListItem | null>(null);

  const handleSave = () => {
    toastDashboardSaved('studio');
    setStudioModalOpen(false);
    setEditingStudio(null);
    router.refresh();
  };

  const closeModal = () => {
    setStudioModalOpen(false);
    setEditingStudio(null);
  };

  return (
    <>
      <StudiosSection
        studios={studios}
        onAdd={() => {
          setEditingStudio(null);
          setStudioModalOpen(true);
        }}
        onEdit={(studio) => {
          setEditingStudio(studio);
          setStudioModalOpen(true);
        }}
      />
      <StudioModal open={studioModalOpen} onClose={closeModal} onSave={handleSave} initialStudio={editingStudio} />
    </>
  );
}
