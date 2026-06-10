import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Абонаменти',
  description: 'Управление на абонаментни планове за студиата ви.',
};

export default function DashboardSubscriptionsLayout({ children }: { children: ReactNode }) {
  return children;
}
