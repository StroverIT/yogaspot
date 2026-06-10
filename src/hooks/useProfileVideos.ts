import { useQuery } from '@tanstack/react-query';
import type { AccessibleSubscriptionVideo } from '@/lib/subscription-videos-access';

type ProfileVideosResponse = {
  videos: AccessibleSubscriptionVideo[];
};

async function fetchProfileVideos(): Promise<ProfileVideosResponse> {
  const res = await fetch('/api/profile/videos');
  if (!res.ok) throw new Error('Failed to load videos');
  return res.json() as Promise<ProfileVideosResponse>;
}

export function useProfileVideos() {
  return useQuery({
    queryKey: ['profile', 'videos'],
    queryFn: fetchProfileVideos,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}
