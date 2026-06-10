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
import type { YogaClass } from '@/data/mock-data';
import { ClassesSection } from '@/views/Dashboard/components/ClassesSection';
import { ClassModal, type ClassModalPayload } from '@/views/Dashboard/components/modals/ClassModal';
import {
  InstructorModal,
  type InstructorModalPayload,
} from '@/views/Dashboard/components/modals/InstructorModal';
import { deriveDashboardMetrics } from '@/views/Dashboard/dashboardMockData';
import { toastDashboardSaved } from '@/views/Dashboard/dashboardSaveToast';
import { useDashboardWorkspaceContext } from '@/contexts/DashboardWorkspaceContext';
import { StripeOnlinePaymentsBanner } from '@/views/Dashboard/components/StripeOnlinePaymentsBanner';

export default function DashboardClassesPage() {
  const ws = useDashboardWorkspaceContext();
  const { myStudios, myClasses, myInstructors } = deriveDashboardMetrics(ws.studios, ws.classes, ws.instructors);
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<YogaClass | null>(null);
  const [classPendingDelete, setClassPendingDelete] = useState<YogaClass | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [instructorModalOpen, setInstructorModalOpen] = useState(false);
  const [instructorDefaultStudioId, setInstructorDefaultStudioId] = useState<string | null>(null);
  const [preselectInstructorId, setPreselectInstructorId] = useState<string | null>(null);

  const closeModal = () => {
    setClassModalOpen(false);
    setEditingClass(null);
    setPreselectInstructorId(null);
  };

  const closeInstructorModal = () => {
    setInstructorModalOpen(false);
    setInstructorDefaultStudioId(null);
  };

  const handleInstructorSave = async (payload: InstructorModalPayload) => {
    const res = await fetch('/api/dashboard/instructors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studioId: payload.studioId,
        teachingMode: payload.teachingMode,
        zoomMeetingUrl: payload.zoomMeetingUrl,
        name: payload.name,
        bio: payload.bio,
        experienceLevel: payload.experienceLevel,
        yogaStyle: payload.yogaStyle,
        photo: payload.photo ?? '',
      }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(typeof j.error === 'string' ? j.error : `Неуспешно запазване (${res.status})`);
      return;
    }
    const j = (await res.json()) as { instructor?: { id?: string } };
    closeInstructorModal();
    await ws.reload();
    if (typeof j.instructor?.id === 'string') {
      setPreselectInstructorId(j.instructor.id);
    }
    toastDashboardSaved('instructor');
  };

  const closeDeleteDialog = () => {
    if (deleteInProgress) return;
    setClassPendingDelete(null);
  };

  const handleSave = async (payload: ClassModalPayload) => {
    const isEdit = Boolean(payload.id);
    const res = await fetch(isEdit ? `/api/dashboard/classes/${payload.id}` : '/api/dashboard/classes', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studioId: payload.studioId,
        instructorId: payload.instructorId,
        name: payload.name,
        date: payload.date,
        startTime: payload.startTime,
        endTime: payload.endTime,
        maxCapacity: payload.maxCapacity,
        price: payload.price,
        yogaType: payload.yogaType,
        difficulty: payload.difficulty,
        cancellationPolicy: payload.cancellationPolicy,
        ...(isEdit && payload.waitingList !== undefined ? { waitingList: payload.waitingList } : {}),
        acceptsMultisport: payload.acceptsMultisport === true,
        paymentMode: payload.paymentMode,
        ...(!isEdit ? { enrolled: 0 } : {}),
      }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(typeof j.error === 'string' ? j.error : `Неуспешно запазване (${res.status})`);
      return;
    }
    toastDashboardSaved('class');
    closeModal();
    void ws.reload();
  };

  const confirmDeleteClass = async () => {
    if (!classPendingDelete) return;
    setDeleteInProgress(true);
    try {
      const res = await fetch(`/api/dashboard/classes/${classPendingDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(typeof j.error === 'string' ? j.error : `Неуспешно изтриване (${res.status})`);
        return;
      }
      toast.success('Класът беше изтрит.');
      if (editingClass?.id === classPendingDelete.id) {
        closeModal();
      }
      setClassPendingDelete(null);
      void ws.reload();
    } finally {
      setDeleteInProgress(false);
    }
  };

  if (ws.loading) return <div className="text-muted-foreground">Зареждане…</div>;
  if (ws.error) return <div className="text-destructive">{ws.error}</div>;

  const noInstructors = myInstructors.length === 0;
  const addClassDisabled = noInstructors;

  return (
    <div className="space-y-6">
      <StripeOnlinePaymentsBanner stripeConnect={ws.stripeConnect} />
      <ClassesSection
        classes={myClasses}
        studios={myStudios}
        instructors={myInstructors}
        addDisabled={addClassDisabled}
        addDisabledTooltip="Добавете поне един инструктор преди да създавате класове."
        addDisabledHint={
          <>
            Добавете инструктор в раздел{' '}
            <Link
              href="/dashboard/instructors"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Инструктори
            </Link>
            {' '}
            - за онлайн не е нужно отделно студио.
          </>
        }
        onAdd={() => {
          if (myInstructors.length === 0) {
            toast.info('Добавете поне един инструктор преди да създавате класове.');
            return;
          }
          setEditingClass(null);
          setClassModalOpen(true);
        }}
        onEdit={cls => {
          setEditingClass(cls);
          setClassModalOpen(true);
        }}
        onDelete={cls => setClassPendingDelete(cls)}
      />
      <AlertDialog open={classPendingDelete !== null} onOpenChange={open => !open && closeDeleteDialog()}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="sm:text-center">
            <AlertDialogTitle className="font-display">Изтриване на клас</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Сигурни ли сте, че искате да изтриете{' '}
              <span className="font-medium text-foreground">{classPendingDelete?.name}</span>? Това действие не
              може да бъде отменено.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center sm:space-x-2">
            <AlertDialogCancel disabled={deleteInProgress}>Отказ</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteInProgress}
              className="mt-2 sm:mt-0"
              onClick={() => void confirmDeleteClass()}
            >
              {deleteInProgress ? 'Изтриване…' : 'Изтрий'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ClassModal
        open={classModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        studios={myStudios}
        instructors={myInstructors}
        classToEdit={editingClass}
        onCreateInstructor={studioId => {
          setInstructorDefaultStudioId(studioId);
          setInstructorModalOpen(true);
        }}
        preselectInstructorId={preselectInstructorId}
        stripeConnect={ws.stripeConnect}
      />
      <InstructorModal
        open={instructorModalOpen}
        onClose={closeInstructorModal}
        onSave={handleInstructorSave}
        studios={myStudios}
        defaultStudioId={instructorDefaultStudioId}
      />
    </div>
  );
}
