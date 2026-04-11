export type ModalType = 'studio' | 'instructor' | 'class' | 'schedule' | null;

export type Section = 'overview' | 'studios' | 'instructors' | 'classes' | 'schedule';

export const DASHBOARD_PATHS: Record<Section, string> = {
  overview: '/dashboard',
  studios: '/dashboard/studios',
  instructors: '/dashboard/instructors',
  classes: '/dashboard/classes',
  schedule: '/dashboard/schedule',
};

export function getActiveSection(pathname: string): Section {
  const normalized = pathname.replace(/\/$/, '') || '/dashboard';
  if (normalized === '/dashboard') return 'overview';
  const sub = normalized.replace(/^\/dashboard\/?/, '');
  if (sub === 'studios') return 'studios';
  if (sub === 'instructors') return 'instructors';
  if (sub === 'classes') return 'classes';
  if (sub === 'schedule') return 'schedule';
  return 'overview';
}

