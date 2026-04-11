'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DASHBOARD_PATHS } from '@/views/Dashboard/dashboardTypes';

const steps = [
  {
    title: 'Студиа',
    href: DASHBOARD_PATHS.studios,
    body: 'Първо добавете студиото си — адрес, снимки и удобства. Без студио не може да се добавят инструктори, класове и разписание.',
  },
  {
    title: 'Инструктори',
    href: DASHBOARD_PATHS.instructors,
    body: 'Създайте профили на инструкторите, които водят часове във вашите студиа.',
  },
  {
    title: 'Класове',
    href: DASHBOARD_PATHS.classes,
    body: 'Добавете класове с дата, час, тип йога, цена и капацитет.',
  },
  {
    title: 'Разписание',
    href: DASHBOARD_PATHS.schedule,
    body: 'Задайте седмично повтарящи се часове в разписанието. Там също управлявате заявка за месечен абонамент: попълвате формата, а след одобрение от администратор абонаментът се показва публично.',
  },
] as const;

export function DashboardOnboardingModal({
  open,
  confirming,
  onConfirm,
}: {
  open: boolean;
  confirming: boolean;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto [&>button.absolute]:hidden sm:max-w-xl"
        onPointerDownOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-left">Добре дошли в бизнес таблото</DialogTitle>
          <DialogDescription className="text-left">
            Кратък ред на стъпките — след като ги прегледате, няма да ви показваме този прозорец отново.
          </DialogDescription>
        </DialogHeader>

        <ol className="list-decimal space-y-4 pl-5 text-sm text-foreground">
          {steps.map(step => (
            <li key={step.href} className="marker:font-semibold">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                <span className="font-medium">{step.title}</span>
                <Link
                  href={step.href}
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline shrink-0"
                >
                  Отвори раздела
                </Link>
              </div>
              <p className="mt-1 text-muted-foreground leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>

        <DialogFooter className="sm:justify-end">
          <Button type="button" className="rounded-xl" disabled={confirming} onClick={() => void onConfirm()}>
            {confirming ? 'Записване…' : 'Разбрах'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
