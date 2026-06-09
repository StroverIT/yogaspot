import { describe, expect, it } from 'vitest';
import {
  isValidZoomMeetingUrl,
  onlineStudioMissingZoom,
  teachingModeFromPrisma,
  teachingModeToPrisma,
} from '@/lib/teaching-mode';

describe('teachingMode helpers', () => {
  it('maps prisma and dto values', () => {
    expect(teachingModeFromPrisma('ONLINE')).toBe('online');
    expect(teachingModeFromPrisma('PHYSICAL')).toBe('physical');
    expect(teachingModeToPrisma('online')).toBe('ONLINE');
    expect(teachingModeToPrisma('physical')).toBe('PHYSICAL');
  });

  it('validates zoom urls', () => {
    expect(isValidZoomMeetingUrl('https://zoom.us/j/123')).toBe(true);
    expect(isValidZoomMeetingUrl('http://zoom.us/j/123')).toBe(true);
    expect(isValidZoomMeetingUrl('')).toBe(false);
    expect(isValidZoomMeetingUrl('not-a-url')).toBe(false);
  });

  it('requires zoom for online studios before publish', () => {
    expect(
      onlineStudioMissingZoom({ teachingMode: 'physical', zoomMeetingUrl: null }),
    ).toBe(false);
    expect(
      onlineStudioMissingZoom({ teachingMode: 'online', zoomMeetingUrl: 'https://zoom.us/j/1' }),
    ).toBe(false);
    expect(
      onlineStudioMissingZoom({ teachingMode: 'online', zoomMeetingUrl: null }),
    ).toBe(true);
    expect(
      onlineStudioMissingZoom({ teachingMode: 'online', zoomMeetingUrl: 'bad' }),
    ).toBe(true);
  });
});
