import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'fitsys',
  description: 'Заявете синхронизация на разписанието от fitsys към Zenno.',
};

export default function DashboardFitsysLayout({ children }: { children: ReactNode }) {
  return children;
}
