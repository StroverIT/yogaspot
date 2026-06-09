import type { TeachingModeDto } from '@/lib/teaching-mode';
import type { Section } from '@/views/Dashboard/dashboardTypes';
import { DASHBOARD_PATHS } from '@/views/Dashboard/dashboardTypes';

export type OnboardingCounts = {
  studiosCount: number;
  instructorsCount: number;
  classesCount: number;
  scheduleCount: number;
};

export type OnboardingTaskDef = {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  done: boolean;
};

export function getOnboardingTaskTotal(mode: TeachingModeDto): number {
  return mode === 'online' ? 3 : 4;
}

export function isOnboardingComplete(mode: TeachingModeDto, counts: OnboardingCounts): boolean {
  const { studiosCount, instructorsCount, classesCount, scheduleCount } = counts;
  if (mode === 'online') {
    return instructorsCount >= 1 && scheduleCount >= 1 && classesCount >= 1;
  }
  return studiosCount >= 1 && instructorsCount >= 1 && scheduleCount >= 1 && classesCount >= 1;
}

export function getOnboardingDoneCount(mode: TeachingModeDto, counts: OnboardingCounts): number {
  let n = 0;
  if (mode !== 'online' && counts.studiosCount >= 1) n += 1;
  if (counts.instructorsCount >= 1) n += 1;
  if (counts.scheduleCount >= 1) n += 1;
  if (counts.classesCount >= 1) n += 1;
  return n;
}

export function getOnboardingTasks(mode: TeachingModeDto, counts: OnboardingCounts): OnboardingTaskDef[] {
  const tasks: OnboardingTaskDef[] = [
    {
      id: 'instructor',
      title: 'Добавете инструктор',
      description:
        mode === 'online'
          ? 'Създайте онлайн профил с име, описание и Zoom линк - студио не е нужно.'
          : 'Добавете поне един инструктор и го свържете със студиото си.',
      href: DASHBOARD_PATHS.instructors,
      cta: 'Към инструктори',
      done: counts.instructorsCount >= 1,
    },
  ];

  if (mode === 'physical') {
    tasks.unshift({
      id: 'studio',
      title: 'Създайте студио',
      description: 'Добавете адрес, снимки и удобства за преподаване в зала.',
      href: DASHBOARD_PATHS.studios,
      cta: 'Към студиа',
      done: counts.studiosCount >= 1,
    });
  }

  tasks.push(
    {
      id: 'schedule',
      title: 'Добавете час в разписание',
      description:
        mode === 'online'
          ? 'Задайте поне един час. Zoom линкът идва от профила на инструктора.'
          : 'Задайте поне един час в седмичното разписание.',
      href: DASHBOARD_PATHS.schedule,
      cta: 'Към разписание',
      done: counts.scheduleCount >= 1,
    },
    {
      id: 'class',
      title: 'Създайте клас',
      description: 'Добавете поне един клас с дата, час и капацитет.',
      href: DASHBOARD_PATHS.classes,
      cta: 'Към класове',
      done: counts.classesCount >= 1,
    },
  );

  return tasks;
}

export function getOnboardingSectionHints(
  mode: TeachingModeDto,
  counts: OnboardingCounts,
): Partial<Record<Section, boolean>> {
  const hints: Partial<Record<Section, boolean>> = {
    instructors: counts.instructorsCount < 1,
    classes: counts.classesCount < 1,
    schedule: counts.scheduleCount < 1,
  };
  if (mode === 'physical') {
    hints.studios = counts.studiosCount < 1;
  }
  return hints;
}

export function getOnboardingFirstStepHref(mode: TeachingModeDto): string {
  return mode === 'online' ? DASHBOARD_PATHS.instructors : DASHBOARD_PATHS.studios;
}
