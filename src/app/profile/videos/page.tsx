import type { Metadata } from 'next';
import { Suspense } from 'react';

import ProfileVideosPage from '@/views/Profile/ProfileVideosPage';

export const metadata: Metadata = {
  title: 'Видеа',
  description: 'YouTube видеа от вашите активни абонаменти.',
};

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Зареждане…</div>}>
      <ProfileVideosPage />
    </Suspense>
  );
}
