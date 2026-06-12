import { render } from '@react-email/render';
import { FitsysSyncRequestEmail } from '@/emails/fitsys-sync-request-email';
import { describeMailConfigGap, isMailConfigured, sendHtmlEmail } from '@/lib/mailer';

const SUBJECT = 'Заявка за синхронизация със fitsys';

function resolveEmailFromRecipient(): string | undefined {
  const raw = process.env.EMAIL_FROM?.trim();
  if (!raw) return undefined;
  const angle = raw.match(/<([^>]+)>/);
  return (angle ? angle[1] : raw).trim() || undefined;
}

export async function sendFitsysSyncRequestEmail(params: {
  studioName: string;
  studioId: string;
  fitsysUrl: string;
  ownerName: string | null | undefined;
  ownerEmail: string | null | undefined;
  isUpdate: boolean;
}): Promise<void> {
  const to = resolveEmailFromRecipient();
  if (!to) {
    console.warn('[fitsys-sync-email] EMAIL_FROM missing; skipping send');
    return;
  }

  if (!isMailConfigured()) {
    const gap = describeMailConfigGap();
    console.warn('[fitsys-sync-email] Mail not configured; skipping send.', gap.hint, gap);
    return;
  }

  try {
    const html = await render(
      FitsysSyncRequestEmail({
        preview: SUBJECT,
        studioName: params.studioName,
        studioId: params.studioId,
        fitsysUrl: params.fitsysUrl,
        ownerName: params.ownerName?.trim() || '-',
        ownerEmail: params.ownerEmail?.trim() || '',
        isUpdate: params.isUpdate,
      }),
    );
    await sendHtmlEmail({ to, subject: SUBJECT, html });
  } catch (err) {
    console.error('[fitsys-sync-email] failed to send notification', { to, err });
  }
}
