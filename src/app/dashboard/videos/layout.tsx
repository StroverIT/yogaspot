import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Видеа',
  description: 'Управление на YouTube видеа за абонатите ви.',
};

export default function DashboardVideosLayout({ children }: { children: ReactNode }) {
  return children;
}
