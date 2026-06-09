export type TeachingModeDto = 'physical' | 'online';

export function teachingModeFromPrisma(value: string): TeachingModeDto {
  return value === 'ONLINE' ? 'online' : 'physical';
}

export function teachingModeToPrisma(value: string | null | undefined): 'PHYSICAL' | 'ONLINE' {
  return value === 'online' ? 'ONLINE' : 'PHYSICAL';
}

export function isOnlineTeachingMode(mode: TeachingModeDto): boolean {
  return mode === 'online';
}

export function isValidZoomMeetingUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function onlineStudioMissingZoom(params: {
  teachingMode: TeachingModeDto;
  zoomMeetingUrl: string | null | undefined;
}): boolean {
  return (
    isOnlineTeachingMode(params.teachingMode) &&
    !isValidZoomMeetingUrl(params.zoomMeetingUrl ?? '')
  );
}
