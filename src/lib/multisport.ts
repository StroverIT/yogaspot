import type { ScheduleEntry, Studio, YogaClass } from '@/data/mock-data';

export function studioAcceptsMultisport(
  studio: Pick<Studio, 'teachingMode'>,
  schedule: Pick<ScheduleEntry, 'acceptsMultisport'>[],
  classes: Pick<YogaClass, 'acceptsMultisport'>[] = [],
): boolean {
  if (studio.teachingMode === 'online') return false;
  return (
    schedule.some(entry => entry.acceptsMultisport === true)
    || classes.some(cls => cls.acceptsMultisport === true)
  );
}
