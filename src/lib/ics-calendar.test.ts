import { describe, expect, it } from 'vitest';
import { buildIcsCalendarEvent } from '@/lib/ics-calendar';

describe('buildIcsCalendarEvent', () => {
  it('includes VALARM triggers for one day and one hour before', () => {
    const ics = buildIcsCalendarEvent({
      title: 'Test Class',
      description: 'Online yoga',
      location: 'https://zoom.us/j/123',
      dateYmd: '2026-06-15',
      startHm: '09:00',
      endHm: '10:00',
      uidSeed: 'booking-1',
    });

    expect(ics).toContain('BEGIN:VALARM');
    expect(ics).toContain('TRIGGER:-P1D');
    expect(ics).toContain('TRIGGER:-PT1H');
    expect(ics).toContain('LOCATION:https://zoom.us/j/123');
    expect(ics).toContain('DTSTART;TZID=Europe/Sofia:20260615T090000');
  });
});
