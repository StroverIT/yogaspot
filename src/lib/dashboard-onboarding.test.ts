import { describe, expect, it } from 'vitest';

import {
  getOnboardingDoneCount,
  getOnboardingTaskTotal,
  getOnboardingTasks,
  isOnboardingComplete,
} from './dashboard-onboarding';

const empty = { studiosCount: 0, instructorsCount: 0, classesCount: 0, scheduleCount: 0 };
const onlineDone = { studiosCount: 1, instructorsCount: 1, classesCount: 1, scheduleCount: 1 };
const physicalPartial = { studiosCount: 1, instructorsCount: 0, classesCount: 0, scheduleCount: 0 };

describe('dashboard-onboarding', () => {
  it('online path skips studio step', () => {
    expect(getOnboardingTaskTotal('online')).toBe(3);
    const tasks = getOnboardingTasks('online', empty);
    expect(tasks.map(t => t.id)).toEqual(['instructor', 'schedule', 'class']);
  });

  it('physical path includes studio first', () => {
    expect(getOnboardingTaskTotal('physical')).toBe(4);
    const tasks = getOnboardingTasks('physical', empty);
    expect(tasks.map(t => t.id)).toEqual(['studio', 'instructor', 'schedule', 'class']);
  });

  it('online complete without studio', () => {
    expect(isOnboardingComplete('online', onlineDone)).toBe(true);
    expect(getOnboardingDoneCount('online', onlineDone)).toBe(3);
  });

  it('physical incomplete without instructor', () => {
    expect(isOnboardingComplete('physical', physicalPartial)).toBe(false);
    expect(getOnboardingDoneCount('physical', physicalPartial)).toBe(1);
  });
});
