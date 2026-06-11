import { render } from '@react-email/render';
import { StudioSubscriptionBuyerEmail } from '@/emails/studio-subscription-buyer-email';
import { StudioSubscriptionOwnerEmail } from '@/emails/studio-subscription-owner-email';
import { formatSubscriptionDualFromBgn } from '@/lib/eur-bgn';
import { describeMailConfigGap, isMailConfigured, sendHtmlEmail } from '@/lib/mailer';
import { calculateFinalCustomerAmount } from '@/lib/payments';
import { getPublicAppBaseUrl } from '@/lib/stripe-server';

export async function sendStudioSubscriptionEmails(params: {
  buyerEmail: string | null | undefined;
  buyerName: string | null | undefined;
  studioEmail: string | null | undefined;
  ownerEmail: string | null | undefined;
  studioId: string;
  studioName: string;
  planName: string;
  monthlyPriceBgn: number | null | undefined;
  durationMonths: number | null | undefined;
}): Promise<void> {
  if (!isMailConfigured()) {
    const gap = describeMailConfigGap();
    console.warn('[studio-subscription-email] Mail not configured; skipping send.', gap.hint, gap);
    return;
  }

  const buyerName = params.buyerName?.trim() || 'Клиент';
  const planName = params.planName.trim() || 'Абонамент';
  const studioName = params.studioName.trim() || 'Студио';
  const durationMonths = params.durationMonths ?? 1;
  const priceDual =
    typeof params.monthlyPriceBgn === 'number' && params.monthlyPriceBgn > 0
      ? formatSubscriptionDualFromBgn(calculateFinalCustomerAmount(params.monthlyPriceBgn), durationMonths)
      : null;

  const appUrl = getPublicAppBaseUrl();
  const studioUrl = appUrl
    ? `${appUrl}/studio/${encodeURIComponent(params.studioId)}?tab=schedule`
    : undefined;

  const subjectBuyer = `Абонаментът ви за ${studioName} е активен`;
  const buyerLines = [`План: ${planName}`, `Студио: ${studioName}`];

  const buyerToOriginal = params.buyerEmail?.trim() ?? '';
  const buyerTo = buyerToOriginal.toLowerCase();
  const studioToRaw = params.studioEmail?.trim() || params.ownerEmail?.trim() || '';
  const studioTo = studioToRaw.toLowerCase();

  if (buyerToOriginal) {
    try {
      const htmlBuyer = await render(
        <StudioSubscriptionBuyerEmail
          preview={subjectBuyer}
          headline={subjectBuyer}
          lines={buyerLines}
          studioUrl={studioUrl}
          priceDual={priceDual}
        />,
      );
      await sendHtmlEmail({ to: buyerToOriginal, subject: subjectBuyer, html: htmlBuyer });
    } catch (err) {
      console.error('[studio-subscription-email] failed to send buyer confirmation', {
        to: buyerToOriginal,
        err,
      });
    }
  }

  const studioSubject = `Нов абонат за ${studioName}`;
  const buyerToDisplay = buyerToOriginal || 'няма имейл';
  const ownerLines = [`План: ${planName}`, `Студио: ${studioName}`];

  if (studioToRaw && studioTo !== buyerTo) {
    try {
      const htmlStudio = await render(
        <StudioSubscriptionOwnerEmail
          preview={studioSubject}
          buyerLine={`${buyerName} (${buyerToDisplay}) се абонира за ${planName}.`}
          lines={ownerLines}
          priceDual={priceDual}
        />,
      );
      await sendHtmlEmail({ to: studioToRaw, subject: studioSubject, html: htmlStudio });
    } catch (err) {
      console.error('[studio-subscription-email] failed to send studio notification', {
        to: studioToRaw,
        err,
      });
    }
  } else if (!studioToRaw) {
    console.warn(
      '[studio-subscription-email] no studio email (Studio.email or owner); skipping studio notification',
    );
  }
}
