import { describe, expect, it } from 'vitest';

import {
  formatClassCapacityDisplay,
  formatClassPriceDisplay,
  isClassAtCapacity,
  isUnlimitedClassCapacity,
  UNLIMITED_CLASS_CAPACITY,
} from './yoga-class-limits';

describe('yoga-class-limits', () => {
  it('treats sentinel as unlimited', () => {
    expect(isUnlimitedClassCapacity(UNLIMITED_CLASS_CAPACITY)).toBe(true);
    expect(isClassAtCapacity(100, UNLIMITED_CLASS_CAPACITY)).toBe(false);
    expect(formatClassCapacityDisplay(5, UNLIMITED_CLASS_CAPACITY)).toBe('5 · неограничено');
    expect(formatClassCapacityDisplay(0, UNLIMITED_CLASS_CAPACITY)).toBe('неограничено');
  });

  it('formats free price', () => {
    expect(formatClassPriceDisplay(0)).toBe('Безплатно');
  });

  it('detects full classes with finite capacity', () => {
    expect(isClassAtCapacity(10, 10)).toBe(true);
    expect(isClassAtCapacity(9, 10)).toBe(false);
  });
});
