import { render } from '@react-email/render';
import { BookingBuyerEmail } from '@/emails/booking-buyer-email';
import { BookingOwnerEmail } from '@/emails/booking-owner-email';
import { googleCalendarUrlForScheduleEntry, googleCalendarUrlForYogaClass } from '@/lib/google-calendar-link';
import { isMailConfigured, sendHtmlEmail } from '@/lib/mailer';

export type BookingEmailKind = 'class' | 'schedule';

export type ClassEmailDetail = {
  name: string;
  date: Date;
  startTime: string;
  endTime: string;
};

export type ScheduleEmailDetail = {
  className: string;
  day: string;
  startTime: string;
  endTime: string;
};

export async function sendBookingConfirmationEmails(params: {
  kind: BookingEmailKind;
  paymentMode: 'online' | 'offline';
  buyerEmail: string | null | undefined;
  buyerName: string | null | undefined;
  ownerEmail: string | null | undefined;
  studioName: string;
  studioAddress: string;
  amountMinor: number;
  currency: string;
  classDetail?: ClassEmailDetail;
  scheduleDetail?: ScheduleEmailDetail;
}): Promise<void> {
  if (!isMailConfigured()) {
    console.warn('[booking-email] SMTP_HOST / EMAIL_FROM missing; skipping send');
    return;
  }

  const buyerName = params.buyerName?.trim() || 'Клиент';
  const amountLabel =
    params.amountMinor > 0
      ? `${(params.amountMinor / 100).toFixed(2)} ${params.currency.toUpperCase()}`
      : '';

  let calendarUrl: string | undefined;
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
      classDate: c.date,
      startTime: c.startTime,
      endTime: c.endTime,
    });
    buyerLines = [
      `Клас: ${c.name}`,
      `Дата: ${c.date.toISOString().slice(0, 10)}, ${c.startTime}–${c.endTime}`,
      `Студио: ${params.studioName}`,
    ];
    if (params.paymentMode === 'online' && amountLabel) {
      buyerLines.push(`Платено онлайн: ${amountLabel}`);
    }
    ownerLines = [
      `Клас: ${c.name}`,
      `Дата: ${c.date.toISOString().slice(0, 10)}, ${c.startTime}–${c.endTime}`,
      `Студио: ${params.studioName}`,
    ];
  } else if (params.kind === 'schedule' && params.scheduleDetail) {
    const s = params.scheduleDetail;
    subjectBuyer = `Потвърдена резервация: ${s.className}`;
    calendarUrl = googleCalendarUrlForScheduleEntry({
      className: s.className,
      dayLabel: s.day,
      startTime: s.startTime,
      endTime: s.endTime,
      studioName: params.studioName,
      address: params.studioAddress,
    });
    buyerLines = [
      `Час от разписание: ${s.className}`,
      `Ден: ${s.day}, ${s.startTime}–${s.endTime}`,
      `Студио: ${params.studioName}`,
    ];
    if (params.paymentMode === 'online' && amountLabel) {
      buyerLines.push(`Платено онлайн: ${amountLabel}`);
    }
    ownerLines = [
      `Разписание: ${s.className}`,
      `Ден: ${s.day}, ${s.startTime}–${s.endTime}`,
      `Студио: ${params.studioName}`,
    ];
  } else {
    console.warn('[booking-email] missing detail payload');
    return;
  }

  const buyerTo = params.buyerEmail?.trim();
  if (buyerTo && subjectBuyer) {
    const htmlBuyer = await render(
      <BookingBuyerEmail
        preview={subjectBuyer}
        headline={subjectBuyer}
        lines={buyerLines}
        calendarUrl={calendarUrl}
        paymentMode={params.paymentMode}
      />,
    );
    await sendHtmlEmail({ to: buyerTo, subject: subjectBuyer, html: htmlBuyer });
  }

  const ownerSubject = `Нова резервация — ${params.studioName}`;
  const buyerToDisplay = buyerTo ?? 'няма имейл';
  const htmlOwner = await render(
    <BookingOwnerEmail
      preview={ownerSubject}
      buyerLine={`${buyerName} (${buyerToDisplay}) се записа.`}
      lines={ownerLines}
      paymentMode={params.paymentMode}
      amountLine={params.paymentMode === 'online' && amountLabel ? `Сума (Stripe): ${amountLabel}` : undefined}
    />,
  );
  const ownerTo = params.ownerEmail?.trim();
  if (ownerTo) {
    await sendHtmlEmail({ to: ownerTo, subject: ownerSubject, html: htmlOwner });
  }
}
