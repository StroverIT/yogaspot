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

  const handleSave = () => {
    toastDashboardSaved('studio');
    setStudioModalOpen(false);
    router.refresh();
  };

  return (
    <>
      <StudiosSection studios={studios} onAdd={() => setStudioModalOpen(true)} onEdit={() => setStudioModalOpen(true)} />
      <StudioModal open={studioModalOpen} onClose={() => setStudioModalOpen(false)} onSave={handleSave} />
    </>
  );
}
