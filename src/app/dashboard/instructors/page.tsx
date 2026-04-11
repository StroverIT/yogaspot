'use client';

import Link from 'next/link';
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
import type { Instructor } from '@/data/mock-data';
import { InstructorsSection } from '@/views/Dashboard/components/InstructorsSection';
import { InstructorModal, type InstructorModalPayload } from '@/views/Dashboard/components/modals/InstructorModal';
import { deriveDashboardMetrics } from '@/views/Dashboard/dashboardMockData';
import { toastDashboardSaved } from '@/views/Dashboard/dashboardSaveToast';
import { useDashboardWorkspace } from '@/hooks/useDashboardWorkspace';

export default function DashboardInstructorsPage() {
  const ws = useDashboardWorkspace();
  const { myStudios, myInstructors } = deriveDashboardMetrics(ws.studios, ws.classes, ws.instructors);
  const [instructorModalOpen, setInstructorModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [instructorPendingDelete, setInstructorPendingDelete] = useState<Instructor | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const closeModal = () => {
    setInstructorModalOpen(false);
    setEditingInstructor(null);
  };

  const closeDeleteDialog = () => {
    if (deleteInProgress) return;
    setInstructorPendingDelete(null);
  };

  const confirmDeleteInstructor = async () => {
    if (!instructorPendingDelete) return;
    setDeleteInProgress(true);
    try {
      const res = await fetch(`/api/dashboard/instructors/${instructorPendingDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(typeof j.error === 'string' ? j.error : `Неуспешно изтриване (${res.status})`);
        return;
      }
      toast.success('Инструкторът беше изтрит.');
      if (editingInstructor?.id === instructorPendingDelete.id) {
        closeModal();
      }
      setInstructorPendingDelete(null);
      void ws.reload();
    } finally {
      setDeleteInProgress(false);
    }
  };

  const handleSave = async (payload: InstructorModalPayload) => {
    const isEdit = Boolean(payload.id);
    const res = await fetch(
      isEdit ? `/api/dashboard/instructors/${payload.id}` : '/api/dashboard/instructors',
      {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studioId: payload.studioId,
          name: payload.name,
          bio: payload.bio,
          experienceLevel: payload.experienceLevel,
          yogaStyle: payload.yogaStyle,
        }),
      },
    );
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(typeof j.error === 'string' ? j.error : `Неуспешно запазване (${res.status})`);
      return;
    }
    toastDashboardSaved('instructor');
    closeModal();
    void ws.reload();
  };

  if (ws.loading) return <div className="text-muted-foreground">Зареждане…</div>;
  if (ws.error) return <div className="text-destructive">{ws.error}</div>;

  const noStudios = myStudios.length === 0;

  return (
    <>
      <InstructorsSection
        instructors={myInstructors}
        studios={myStudios}
        addDisabled={noStudios}
        addDisabledTooltip="Първо създайте студио в раздел Студиа."
        addDisabledHint={
          <>
            Първо създайте студио в раздел{' '}
            <Link href="/dashboard/studios" className="font-medium text-primary underline-offset-4 hover:underline">
              Студиа
            </Link>
            .
          </>
        }
        onAdd={() => {
          if (myStudios.length === 0) {
            toast.info('Първо създайте студио в раздел Студиа.');
            return;
          }
          setEditingInstructor(null);
          setInstructorModalOpen(true);
        }}
        onEdit={instr => {
          setEditingInstructor(instr);
          setInstructorModalOpen(true);
        }}
        onDelete={instr => setInstructorPendingDelete(instr)}
      />
      <AlertDialog open={instructorPendingDelete !== null} onOpenChange={open => !open && closeDeleteDialog()}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="sm:text-center">
            <AlertDialogTitle className="font-display">Изтриване на инструктор</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Сигурни ли сте, че искате да изтриете{' '}
              <span className="font-medium text-foreground">{instructorPendingDelete?.name}</span>? Това действие
              не може да бъде отменено.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center sm:space-x-2">
            <AlertDialogCancel disabled={deleteInProgress}>Отказ</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteInProgress}
              className="mt-2 sm:mt-0"
              onClick={() => void confirmDeleteInstructor()}
            >
              {deleteInProgress ? 'Изтриване…' : 'Изтрий'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <InstructorModal
        open={instructorModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        studios={myStudios}
        instructorToEdit={editingInstructor}
      />
    </>
  );
}
