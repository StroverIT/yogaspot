import { WEEKDAYS } from '@/data/mock-data';

const TZ_LABEL = 'Europe/Sofia';

/** Google Calendar "floating" local times (no Z suffix) - interpreted in the user's calendar locale. */
function floatingRangeOnDate(ymd: string, startHm: string, endHm: string): string {
  const d = ymd.replace(/-/g, '');
  const [sh, sm = '0'] = startHm.split(':');
  const [eh, em = '0'] = endHm.split(':');
  const pad = (n: string) => n.padStart(2, '0');
  return `${d}T${pad(sh)}${pad(sm)}00/${d}T${pad(eh)}${pad(em)}00`;
}

function ymdFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Next calendar date (local machine TZ) whose Bulgarian weekday label matches `dayLabel`. */
export function nextCalendarDateForWeekdayBg(dayLabel: string, from: Date = new Date()): string {
  const target = dayLabel.trim();
  for (let i = 0; i < 21; i++) {
    const probe = new Date(from);
    probe.setDate(probe.getDate() + i);
    const idx = (probe.getDay() + 6) % 7;
    if (WEEKDAYS[idx] === target) {
      return ymdFromDate(probe);
    }
  }
  return ymdFromDate(from);
}

export function googleCalendarTemplateUrl(params: {
  title: string;
  details: string;
  location?: string;
  /** yyyy-MM-dd */
  dateYmd: string;
  startHm: string;
  endHm: string;
}): string {
  const dates = floatingRangeOnDate(params.dateYmd, params.startHm, params.endHm);
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: params.title,
    details: params.details,
    dates,
    ctz: TZ_LABEL,
  });
  if (params.location) q.set('location', params.location);
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

export function googleCalendarUrlForYogaClass(params: {
  className: string;
  studioName: string;
  address?: string;
  zoomMeetingUrl?: string | null;
  isOnline?: boolean;
  /** Prisma @db.Date */
  classDate: Date;
  startTime: string;
  endTime: string;
}): string {
  const ymd = params.classDate.toISOString().slice(0, 10);
  const zoom = params.zoomMeetingUrl?.trim();
  const online = params.isOnline && !!zoom;
  return googleCalendarTemplateUrl({
    title: `${params.className} - ${params.studioName}`,
    details: online
      ? `Онлайн йога клас в ${params.studioName}.\n\nZoom: ${zoom}`
      : `Йога клас в ${params.studioName}.`,
    location: online ? zoom : params.address,
    dateYmd: ymd,
    startHm: params.startTime,
    endHm: params.endTime,
  });
}

export function googleCalendarUrlForScheduleEntry(params: {
  className: string;
  dayLabel: string;
  startTime: string;
  endTime: string;
  studioName: string;
  address?: string;
  zoomMeetingUrl?: string | null;
  isOnline?: boolean;
}): string {
  const dateYmd = nextCalendarDateForWeekdayBg(params.dayLabel);
  const zoom = params.zoomMeetingUrl?.trim();
  const online = params.isOnline && !!zoom;
  return googleCalendarTemplateUrl({
    title: `${params.className} (${params.dayLabel}) - ${params.studioName}`,
    details: online
      ? `Онлайн час от разписанието на ${params.studioName}.\n\nZoom: ${zoom}`
      : `Седмично разписание: всеки ${params.dayLabel}, ${params.startTime}–${params.endTime}. ${params.studioName}.`,
    location: online ? zoom : params.address,
    dateYmd,
    startHm: params.startTime,
    endHm: params.endTime,
  });
}
