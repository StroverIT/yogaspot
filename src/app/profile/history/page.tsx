import { Suspense } from 'react';
import ProfileHistoryPage from '@/views/Profile/ProfileHistoryPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="text-muted-foreground p-6">Зареждане…</div>}>
      <ProfileHistoryPage />
    </Suspense>
  );
}
