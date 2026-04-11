import { useQuery } from '@tanstack/react-query';
import type { ProfileHistoryPayload } from '@/lib/profile-history';

async function fetchProfileHistory(): Promise<ProfileHistoryPayload> {
  const res = await fetch('/api/profile/history');
  if (!res.ok) throw new Error('Failed to load profile history');
  return res.json() as Promise<ProfileHistoryPayload>;
}

export function useProfileHistory() {
  return useQuery({
    queryKey: ['profile', 'history'],
    queryFn: fetchProfileHistory,
    staleTime: 60_000,
  });
}
