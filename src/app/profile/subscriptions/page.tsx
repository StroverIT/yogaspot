import type { Metadata } from 'next';
import { Suspense } from 'react';

import ProfileSubscriptionsPage from '@/views/Profile/ProfileSubscriptionsPage';

export const metadata: Metadata = {
  title: 'Абонаменти',
  description: 'Активни абонаменти към студиа.',
};

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Зареждане…</div>}>
      <ProfileSubscriptionsPage />
    </Suspense>
  );
}
