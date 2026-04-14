export const USER_ANALYTICS_EVENTS = [
  'signup_completed',
  'search_performed',
  'studio_view',
  'schedule_view',
  'booking_started',
  'booking_completed',
] as const;

export const STUDIO_ANALYTICS_EVENTS = [
  'studio_signup_completed',
  'studio_profile_completed',
  'studio_first_class_created',
  'studio_first_event_published',
] as const;

export const ANALYTICS_EVENTS = [...USER_ANALYTICS_EVENTS, ...STUDIO_ANALYTICS_EVENTS] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];
