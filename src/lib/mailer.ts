import nodemailer from 'nodemailer';

/**
 * SMTP (nodemailer): SMTP_HOST, SMTP_PORT (default 587), SMTP_USER, SMTP_PASS,
 * SMTP_SECURE ("true" for 465), EMAIL_FROM (From: address).
 * Toggle `ONLINE_PAYMENTS` and Stripe env vars are documented in stripe-server.ts and payment-settings.ts.
 */
export function isMailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST?.trim() && process.env.EMAIL_FROM?.trim());
}

function createTransport() {
  const host = process.env.SMTP_HOST?.trim();
  const port = parseInt(process.env.SMTP_PORT?.trim() || '587', 10);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const secure =
    process.env.SMTP_SECURE?.trim().toLowerCase() === 'true' || port === 465;

  if (!host) {
    throw new Error('SMTP_HOST is not set');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });
}

export async function sendHtmlEmail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  const from = process.env.EMAIL_FROM?.trim();
  if (!from) {
    console.warn('[mailer] EMAIL_FROM missing; skipping send');
    return;
  }

  const transport = createTransport();
  await transport.sendMail({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
}
