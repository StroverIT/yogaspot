import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Разписание',
  description: 'Седмично разписание за студиата ти.',
};

export default function DashboardScheduleLayout({ children }: { children: ReactNode }) {
  return children;
}
