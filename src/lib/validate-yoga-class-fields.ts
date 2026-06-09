import type { TeachingModeDto } from '@/lib/teaching-mode';
import { isUnlimitedClassCapacity, UNLIMITED_CLASS_CAPACITY } from '@/lib/yoga-class-limits';

export function validateYogaClassMaxCapacity(
  maxCapacity: number,
  teachingMode: TeachingModeDto,
): string | null {
  if (!Number.isFinite(maxCapacity)) return 'Invalid maxCapacity';
  if (teachingMode === 'online') {
    if (isUnlimitedClassCapacity(maxCapacity) || maxCapacity > 0) return null;
    return 'Invalid maxCapacity';
  }
  if (maxCapacity <= 0 || isUnlimitedClassCapacity(maxCapacity)) return 'Invalid maxCapacity';
  return null;
}

export function validateYogaClassPrice(price: number, _teachingMode?: TeachingModeDto): string | null {
  if (!Number.isFinite(price) || price < 0) return 'Invalid price';
  return null;
}

export { UNLIMITED_CLASS_CAPACITY };
