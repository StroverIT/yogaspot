const TZ = 'Europe/Sofia';

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function foldIcsLine(line: string): string {
  const max = 75;
  if (line.length <= max) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, max));
  rest = rest.slice(max);
  while (rest.length > 0) {
    parts.push(` ${rest.slice(0, max - 1)}`);
    rest = rest.slice(max - 1);
  }
  return parts.join('\r\n');
}

function formatIcsLocalDateTime(ymd: string, hm: string): string {
  const [y, m, d] = ymd.split('-');
  const [h, min = '0'] = hm.split(':');
  return `${y}${m}${d}T${h.padStart(2, '0')}${min.padStart(2, '0')}00`;
}

function uidFromParts(parts: string[]): string {
  return `${parts.join('-')}@zenno.app`;
}

export type IcsCalendarEventParams = {
  title: string;
  description: string;
  location?: string;
  dateYmd: string;
  startHm: string;
  endHm: string;
  uidSeed: string;
};

export function buildIcsCalendarEvent(params: IcsCalendarEventParams): string {
  const dtStart = formatIcsLocalDateTime(params.dateYmd, params.startHm);
  const dtEnd = formatIcsLocalDateTime(params.dateYmd, params.endHm);
  const uid = uidFromParts([params.uidSeed, params.dateYmd, params.startHm]);
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Zenno//BG//',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=${TZ}:${dtStart}`,
    `DTEND;TZID=${TZ}:${dtEnd}`,
    foldIcsLine(`SUMMARY:${escapeIcsText(params.title)}`),
    foldIcsLine(`DESCRIPTION:${escapeIcsText(params.description)}`),
  ];

  if (params.location?.trim()) {
    lines.push(foldIcsLine(`LOCATION:${escapeIcsText(params.location.trim())}`));
  }

  lines.push(
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Напомняне за йога клас',
    'TRIGGER:-P1D',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Напомняне за йога клас',
    'TRIGGER:-PT1H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  );

  return `${lines.join('\r\n')}\r\n`;
}

export function icsCalendarDataUrl(ics: string): string {
  const base64 =
    typeof Buffer !== 'undefined'
      ? Buffer.from(ics, 'utf-8').toString('base64')
      : btoa(unescape(encodeURIComponent(ics)));
  return `data:text/calendar;charset=utf-8;base64,${base64}`;
}

export function icsForYogaClassBooking(params: {
  className: string;
  studioName: string;
  classDate: Date;
  startTime: string;
  endTime: string;
  zoomMeetingUrl?: string | null;
  bookingId: string;
}): string {
  const ymd = params.classDate.toISOString().slice(0, 10);
  const zoom = params.zoomMeetingUrl?.trim();
  return buildIcsCalendarEvent({
    title: `${params.className} - ${params.studioName}`,
    description: zoom
      ? `Онлайн йога клас в ${params.studioName}.\n\nZoom: ${zoom}`
      : `Йога клас в ${params.studioName}.`,
    location: zoom || undefined,
    dateYmd: ymd,
    startHm: params.startTime,
    endHm: params.endTime,
    uidSeed: `class-${params.bookingId}`,
  });
}

export function icsForScheduleEntryBooking(params: {
  className: string;
  dayLabel: string;
  studioName: string;
  dateYmd: string;
  startTime: string;
  endTime: string;
  zoomMeetingUrl?: string | null;
  bookingId: string;
}): string {
  const zoom = params.zoomMeetingUrl?.trim();
  return buildIcsCalendarEvent({
    title: `${params.className} (${params.dayLabel}) - ${params.studioName}`,
    description: zoom
      ? `Онлайн час от разписанието на ${params.studioName}.\n\nZoom: ${zoom}`
      : `Седмично разписание: всеки ${params.dayLabel}, ${params.startTime}–${params.endTime}. ${params.studioName}.`,
    location: zoom || undefined,
    dateYmd: params.dateYmd,
    startHm: params.startTime,
    endHm: params.endTime,
    uidSeed: `schedule-${params.bookingId}`,
  });
}
