import { useQuery } from '@tanstack/react-query';
import type { ProfileActiveSubscription } from '@/lib/profile-subscriptions';

type ProfileSubscriptionsResponse = {
  subscriptions: ProfileActiveSubscription[];
};

async function fetchProfileSubscriptions(): Promise<ProfileSubscriptionsResponse> {
  const res = await fetch('/api/profile/subscriptions');
  if (!res.ok) throw new Error('Failed to load subscriptions');
  return res.json() as Promise<ProfileSubscriptionsResponse>;
}

export function useProfileSubscriptions() {
  return useQuery({
    queryKey: ['profile', 'subscriptions'],
    queryFn: fetchProfileSubscriptions,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}
