import { toast } from 'sonner';

const LABELS = {
  studio: 'Студиото',
  instructor: 'Инструкторът',
  class: 'Класът',
  schedule: 'Разписанието',
} as const;

export function toastDashboardSaved(kind: keyof typeof LABELS) {
  toast.success(`${LABELS[kind]} беше запазен успешно!`);
}
