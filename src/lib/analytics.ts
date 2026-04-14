import type { AnalyticsEventName } from '@/lib/analytics-events';

export type TrackEventInput = {
  event: AnalyticsEventName;
  userId?: string | null;
  studioId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function trackEvent({ event, userId, studioId, metadata }: TrackEventInput) {
  return fetch('/api/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event_name: event,
      user_id: userId,
      studio_id: studioId,
      metadata,
    }),
  });
}
