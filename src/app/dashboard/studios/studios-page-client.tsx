'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
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
  const [studioToDelete, setStudioToDelete] = useState<DashboardStudioListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const confirmDeleteStudio = async () => {
    if (!studioToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/studios/${studioToDelete.id}`, { method: 'DELETE' });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(body.error ?? 'Изтриването на студиото не успя.');
        return;
      }
      toast.success('Студиото беше изтрито.');
      setStudioToDelete(null);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
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
        onDelete={(studio) => setStudioToDelete(studio)}
      />
      <StudioModal open={studioModalOpen} onClose={closeModal} onSave={handleSave} initialStudio={editingStudio} />
      <AlertDialog open={studioToDelete != null} onOpenChange={(open) => !open && !isDeleting && setStudioToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Изтриване на студио?</AlertDialogTitle>
            <AlertDialogDescription>
              Сигурни ли сте, че искате да изтриете „{studioToDelete?.name}“? Това действие е необратимо и ще премахне
              свързаните класове, инструктори и разписание.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отказ</AlertDialogCancel>
            <Button variant="destructive" disabled={isDeleting} onClick={() => void confirmDeleteStudio()}>
              {isDeleting ? 'Изтриване…' : 'Изтрий'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
