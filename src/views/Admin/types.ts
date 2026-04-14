export const ADMIN_SECTION_KEYS = ['analytics', 'overview', 'studios', 'users', 'reviews', 'requests'] as const;
export type AdminSectionKey = (typeof ADMIN_SECTION_KEYS)[number];

export function isAdminSectionKey(value: string): value is AdminSectionKey {
  return (ADMIN_SECTION_KEYS as readonly string[]).includes(value);
}
