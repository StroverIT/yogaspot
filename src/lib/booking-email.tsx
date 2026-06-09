import { render } from '@react-email/render';
import { BookingBuyerEmail } from '@/emails/booking-buyer-email';
import { BookingOwnerEmail } from '@/emails/booking-owner-email';
import {
  googleCalendarUrlForScheduleEntry,
  googleCalendarUrlForYogaClass,
  nextCalendarDateForWeekdayBg,
} from '@/lib/google-calendar-link';
import {
  icsCalendarDataUrl,
  icsForScheduleEntryBooking,
  icsForYogaClassBooking,
} from '@/lib/ics-calendar';
import { describeMailConfigGap, isMailConfigured, sendHtmlEmail } from '@/lib/mailer';
import { eurToBgn, formatPriceDualFromBgn } from '@/lib/eur-bgn';
import { isOnlineTeachingMode, type TeachingModeDto } from '@/lib/teaching-mode';

export type BookingEmailKind = 'class' | 'schedule';

export type ClassEmailDetail = {
  name: string;
  date: Date;
  startTime: string;
  endTime: string;
  /** BGN list price - offline emails use this as the end amount (на място). */
  basePriceBgn?: number;
};

export type ScheduleEmailDetail = {
  className: string;
  day: string;
  startTime: string;
  endTime: string;
  /** BGN list price - offline emails use this as the end amount (на място). */
  basePriceBgn?: number;
};

/**
 * Sends up to two messages: one to the customer, one to the studio (public `studioEmail`, else owner).
 */
export async function sendBookingConfirmationEmails(params: {
  kind: BookingEmailKind;
  paymentMode: 'online' | 'offline';
  bookingId: string;
  buyerEmail: string | null | undefined;
  buyerName: string | null | undefined;
  /** Studio inbox from `Studio.email` */
  studioEmail: string | null | undefined;
  /** Fallback if studio has no public email */
  ownerEmail: string | null | undefined;
  studioName: string;
  studioAddress: string;
  studioTeachingMode: TeachingModeDto;
  zoomMeetingUrl?: string | null;
  amountMinor: number;
  currency: string;
  classDetail?: ClassEmailDetail;
  scheduleDetail?: ScheduleEmailDetail;
}): Promise<void> {
  if (!isMailConfigured()) {
    const gap = describeMailConfigGap();
    console.warn('[booking-email] Mail not configured; skipping send.', gap.hint, gap);
    return;
  }

  const buyerName = params.buyerName?.trim() || 'Клиент';
  const isOnlineStudio = isOnlineTeachingMode(params.studioTeachingMode);
  const zoom = params.zoomMeetingUrl?.trim() || null;

  let calendarUrl: string | undefined;
  let icsUrl: string | undefined;
  let subjectBuyer = '';
  let buyerLines: string[] = [];
  let ownerLines: string[] = [];

  if (params.kind === 'class' && params.classDetail) {
    const c = params.classDetail;
    subjectBuyer = `Потвърдена резервация: ${c.name}`;
    calendarUrl = googleCalendarUrlForYogaClass({
      className: c.name,
      studioName: params.studioName,
      address: params.studioAddress,
      zoomMeetingUrl: zoom,
      isOnline: isOnlineStudio,
      classDate: c.date,
      startTime: c.startTime,
      endTime: c.endTime,
    });
    if (isOnlineStudio && zoom) {
      icsUrl = icsCalendarDataUrl(
        icsForYogaClassBooking({
          className: c.name,
          studioName: params.studioName,
          classDate: c.date,
          startTime: c.startTime,
          endTime: c.endTime,
          zoomMeetingUrl: zoom,
          bookingId: params.bookingId,
        }),
      );
    }
    buyerLines = [
      `Клас: ${c.name}`,
      `Дата: ${c.date.toISOString().slice(0, 10)}, ${c.startTime}–${c.endTime}`,
      `Студио: ${params.studioName}`,
      ...(isOnlineStudio && zoom ? [`Zoom: ${zoom}`] : []),
    ];
    ownerLines = [
      `Клас: ${c.name}`,
      `Дата: ${c.date.toISOString().slice(0, 10)}, ${c.startTime}–${c.endTime}`,
      `Студио: ${params.studioName}`,
    ];
  } else if (params.kind === 'schedule' && params.scheduleDetail) {
    const s = params.scheduleDetail;
    const dateYmd = nextCalendarDateForWeekdayBg(s.day);
    subjectBuyer = `Потвърдена резервация: ${s.className}`;
    calendarUrl = googleCalendarUrlForScheduleEntry({
      className: s.className,
      dayLabel: s.day,
      startTime: s.startTime,
      endTime: s.endTime,
      studioName: params.studioName,
      address: params.studioAddress,
      zoomMeetingUrl: zoom,
      isOnline: isOnlineStudio,
    });
    if (isOnlineStudio && zoom) {
      icsUrl = icsCalendarDataUrl(
        icsForScheduleEntryBooking({
          className: s.className,
          dayLabel: s.day,
          studioName: params.studioName,
          dateYmd,
          startTime: s.startTime,
          endTime: s.endTime,
          zoomMeetingUrl: zoom,
          bookingId: params.bookingId,
        }),
      );
    }
    buyerLines = [
      `Час от разписание: ${s.className}`,
      `Ден: ${s.day}, ${s.startTime}–${s.endTime}`,
      `Студио: ${params.studioName}`,
      ...(isOnlineStudio && zoom ? [`Zoom: ${zoom}`] : []),
    ];
    ownerLines = [
      `Разписание: ${s.className}`,
      `Ден: ${s.day}, ${s.startTime}–${s.endTime}`,
      `Студио: ${params.studioName}`,
    ];
  } else {
    console.warn('[booking-email] missing detail payload');
    return;
  }

  const buyerTo = params.buyerEmail?.trim().toLowerCase() ?? '';
  const buyerToOriginal = params.buyerEmail?.trim() ?? '';
  const studioToRaw = params.studioEmail?.trim() || params.ownerEmail?.trim() || '';
  const studioTo = studioToRaw.toLowerCase();

  const baseBgn =
    params.kind === 'class' ? params.classDetail?.basePriceBgn : params.scheduleDetail?.basePriceBgn;
  const endPriceDual =
    params.paymentMode === 'online' && params.amountMinor > 0
      ? formatPriceDualFromBgn(eurToBgn(params.amountMinor / 100))
      : params.paymentMode === 'offline' && typeof baseBgn === 'number' && baseBgn > 0
        ? formatPriceDualFromBgn(baseBgn)
        : null;

  if (buyerToOriginal && subjectBuyer) {
    try {
      const htmlBuyer = await render(
        <BookingBuyerEmail
          preview={subjectBuyer}
          headline={subjectBuyer}
          lines={buyerLines}
          calendarUrl={calendarUrl}
          icsCalendarUrl={icsUrl}
          paymentMode={params.paymentMode}
          endPriceDual={endPriceDual}
        />,
      );
      await sendHtmlEmail({ to: buyerToOriginal, subject: subjectBuyer, html: htmlBuyer });
    } catch (err) {
      console.error('[booking-email] failed to send customer confirmation', { to: buyerToOriginal, err });
    }
  }

  const studioSubject = `Нова резервация - ${params.studioName}`;
  const buyerToDisplay = buyerToOriginal || 'няма имейл';
  if (studioToRaw && studioTo !== buyerTo) {
    try {
      const htmlStudio = await render(
        <BookingOwnerEmail
          preview={studioSubject}
          buyerLine={`${buyerName} (${buyerToDisplay}) се записа.`}
          lines={ownerLines}
          paymentMode={params.paymentMode}
          endPriceDual={endPriceDual}
        />,
      );
      await sendHtmlEmail({ to: studioToRaw, subject: studioSubject, html: htmlStudio });
    } catch (err) {
      console.error('[booking-email] failed to send studio notification', { to: studioToRaw, err });
    }
  } else if (!studioToRaw) {
    console.warn('[booking-email] no studio email (Studio.email or owner); skipping studio notification');
  }
}
