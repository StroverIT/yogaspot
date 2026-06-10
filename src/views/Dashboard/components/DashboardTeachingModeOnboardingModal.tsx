'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Video } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { preventDialogOutsideClose } from '@/views/Dashboard/components/preventDialogOutsideClose';
import type { TeachingModeDto } from '@/lib/teaching-mode';
import { getOnboardingFirstStepHref } from '@/lib/dashboard-onboarding';
import { cn } from '@/lib/utils';

export function DashboardTeachingModeOnboardingModal({
  open,
  saving,
  onChoose,
}: {
  open: boolean;
  saving: boolean;
  onChoose: (mode: TeachingModeDto) => void | Promise<void>;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<TeachingModeDto>('online');

  const handleContinue = async () => {
    await onChoose(selected);
    router.push(getOnboardingFirstStepHref(selected));
  };

  return (
    <Dialog open={open} onOpenChange={() => { }}>
      <DialogContent
        {...preventDialogOutsideClose}
        className="max-w-lg gap-0 overflow-hidden p-0 [&>button.absolute]:hidden"
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogHeader className="space-y-2 px-6 pt-6 text-center sm:text-center">
          <DialogTitle className="font-display text-2xl">Как преподавате?</DialogTitle>
          <DialogDescription className="text-base">
            Изберете формата си - ще ви водим стъпка по стъпка през настройката.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5">
          <div
            className="inline-flex w-full rounded-2xl border border-border bg-muted/40 p-1.5"
            role="tablist"
            aria-label="Формат на преподаване"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selected === 'physical'}
              disabled={saving}
              onClick={() => setSelected('physical')}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-2 rounded-xl px-4 py-4 text-sm font-semibold transition-all',
                selected === 'physical'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
                saving && 'pointer-events-none opacity-70',
              )}
            >
              <Building2 className="h-5 w-5 shrink-0" />
              <span>В студио</span>
              <span className="text-xs font-normal text-muted-foreground">Зала с адрес</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={selected === 'online'}
              disabled={saving}
              onClick={() => setSelected('online')}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-2 rounded-xl px-4 py-4 text-sm font-semibold transition-all',
                selected === 'online'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
                saving && 'pointer-events-none opacity-70',
              )}
            >
              <Video className="h-5 w-5 shrink-0" />
              <span>Онлайн</span>
              <span className="text-xs font-normal text-muted-foreground">Zoom и календар</span>
            </button>
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {selected === 'online'
              ? 'Ще създадете инструктор с Zoom линк - отделно студио не е нужно.'
              : 'Ще добавите студио с адрес, после инструктори и разписание.'}
          </p>
        </div>

        <DialogFooter className="border-t border-border/80 px-6 py-4 sm:justify-center">
          <Button type="button" className="min-w-[10rem]" disabled={saving} onClick={() => void handleContinue()}>
            {saving ? 'Запазване…' : 'Продължи'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
