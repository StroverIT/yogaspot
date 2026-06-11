import { render } from '@react-email/render';
import { StudioReviewBuyerEmail } from '@/emails/studio-review-buyer-email';
import { StudioReviewOwnerEmail } from '@/emails/studio-review-owner-email';
import { describeMailConfigGap, isMailConfigured, sendHtmlEmail } from '@/lib/mailer';

function excerptReviewText(text: string, maxLen = 280): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen - 1)}…`;
}

export async function sendStudioReviewEmails(params: {
  buyerEmail: string | null | undefined;
  buyerName: string | null | undefined;
  studioEmail: string | null | undefined;
  ownerEmail: string | null | undefined;
  studioName: string;
  rating: number;
  reviewText: string;
}): Promise<void> {
  if (!isMailConfigured()) {
    const gap = describeMailConfigGap();
    console.warn('[studio-review-email] Mail not configured; skipping send.', gap.hint, gap);
    return;
  }

  const buyerName = params.buyerName?.trim() || 'Клиент';
  const studioName = params.studioName.trim() || 'Студио';
  const excerpt = excerptReviewText(params.reviewText);

  const subjectBuyer = `Благодарим за отзива за ${studioName}`;
  const buyerLines = [
    `Оценка: ${params.rating}/5 звезди`,
    excerpt ? `Вашият отзив: „${excerpt}"` : '',
  ].filter(Boolean);

  const buyerToOriginal = params.buyerEmail?.trim() ?? '';
  const buyerTo = buyerToOriginal.toLowerCase();
  const studioToRaw = params.studioEmail?.trim() || params.ownerEmail?.trim() || '';
  const studioTo = studioToRaw.toLowerCase();

  if (buyerToOriginal) {
    try {
      const htmlBuyer = await render(
        <StudioReviewBuyerEmail preview={subjectBuyer} headline={subjectBuyer} lines={buyerLines} />,
      );
      await sendHtmlEmail({ to: buyerToOriginal, subject: subjectBuyer, html: htmlBuyer });
    } catch (err) {
      console.error('[studio-review-email] failed to send buyer confirmation', { to: buyerToOriginal, err });
    }
  }

  const studioSubject = `Ново ревю за ${studioName}`;
  const buyerToDisplay = buyerToOriginal || 'няма имейл';
  const ownerLines = excerpt ? [`Отзив: „${excerpt}"`] : [];

  if (studioToRaw && studioTo !== buyerTo) {
    try {
      const htmlStudio = await render(
        <StudioReviewOwnerEmail
          preview={studioSubject}
          buyerLine={`${buyerName} (${buyerToDisplay}) остави ${params.rating}/5 звезди.`}
          lines={ownerLines}
        />,
      );
      await sendHtmlEmail({ to: studioToRaw, subject: studioSubject, html: htmlStudio });
    } catch (err) {
      console.error('[studio-review-email] failed to send studio notification', { to: studioToRaw, err });
    }
  } else if (!studioToRaw) {
    console.warn('[studio-review-email] no studio email (Studio.email or owner); skipping studio notification');
  }
}
