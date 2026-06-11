import nodemailer from 'nodemailer';
import { google } from 'googleapis';

/**
 * Outbound mail (nodemailer). **If `SMTP_HOST` is set, SMTP is used** (even when Google OAuth
 * env vars exist for NextAuth) so login credentials do not accidentally hijack mail transport.
 *
 * **SMTP** - when `SMTP_HOST` + From address are set:
 * - `SMTP_PORT` (default 587), `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`
 * - `SMTP_FROM` or `EMAIL_FROM` for the From header
 *
 * **Gmail OAuth2** (DigiStart-style, via `googleapis`) - when `SMTP_HOST` is **not** set:
 * - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` (or legacy `REFRESH_TOKEN`)
 * - `REDIRECT_URI` (e.g. `https://developers.google.com/oauthplayground` when using OAuth Playground)
 * - Gmail user: `GOOGLE_EMAIL_USER`, `GMAIL_USER`, `SMTP_USER`, `NEXT_PUBLIC_EMAIL_SEND`, or `EMAIL_FROM`
 * - From: `SMTP_FROM` or `EMAIL_FROM` or `Zenno <gmail-user>`
 *
 * Refresh token must include Gmail send scope (`https://mail.google.com/`).
 */

function extractEmailAddress(raw: string): string {
  const trimmed = raw.trim();
  const angle = trimmed.match(/<([^>]+)>/);
  return (angle ? angle[1] : trimmed).trim();
}

/** Same candidate order as DigiStart order-emails / newsletter. */
export function resolveGmailUser(): string | undefined {
  const candidates = [
    process.env.GOOGLE_EMAIL_USER,
    process.env.GMAIL_USER,
    process.env.SMTP_USER,
    process.env.NEXT_PUBLIC_EMAIL_SEND,
    process.env.EMAIL_FROM,
  ] as const;

  for (const raw of candidates) {
    const value = raw?.trim();
    if (!value) continue;
    const addr = extractEmailAddress(value);
    if (addr) return addr;
  }
  return undefined;
}

export function resolveGoogleRefreshToken(): string | undefined {
  return process.env.GOOGLE_REFRESH_TOKEN?.trim() || process.env.REFRESH_TOKEN?.trim() || undefined;
}

export function resolveFromAddress(): string | undefined {
  const explicit = process.env.SMTP_FROM?.trim() || process.env.EMAIL_FROM?.trim();
  if (explicit) return explicit;
  const gmailUser = resolveGmailUser();
  return gmailUser ? `Zenno <${gmailUser}>` : undefined;
}

function useSmtpTransport(): boolean {
  return Boolean(process.env.SMTP_HOST?.trim());
}

export function isGoogleMailOAuthConfigured(): boolean {
  return Boolean(
    resolveGmailUser() &&
      process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim() &&
      resolveGoogleRefreshToken() &&
      process.env.REDIRECT_URI?.trim(),
  );
}

export function isMailConfigured(): boolean {
  if (!resolveFromAddress()) return false;
  if (useSmtpTransport()) return true;
  return isGoogleMailOAuthConfigured();
}

/** Why mail is disabled (no secrets / PII). Use in logs when skipping send. */
export function describeMailConfigGap(): {
  ready: boolean;
  hasFrom: boolean;
  useSmtp: boolean;
  oauthComplete: boolean;
  hint: string;
} {
  const hasFrom = Boolean(resolveFromAddress());
  const useSmtp = useSmtpTransport();
  const oauthComplete = isGoogleMailOAuthConfigured();
  const ready = isMailConfigured();
  if (ready) {
    return { ready: true, hasFrom, useSmtp, oauthComplete, hint: '' };
  }
  if (!hasFrom) {
    return {
      ready: false,
      hasFrom,
      useSmtp,
      oauthComplete,
      hint: 'Set SMTP_FROM or EMAIL_FROM (From address for outgoing mail).',
    };
  }
  return {
    ready: false,
    hasFrom,
    useSmtp,
    oauthComplete,
    hint:
      'Set SMTP_HOST for SMTP, or set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET + GOOGLE_REFRESH_TOKEN + REDIRECT_URI + Gmail user for OAuth.',
  };
}

async function createGoogleOAuthTransport(): Promise<nodemailer.Transporter> {
  const gmailUser = resolveGmailUser();
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const googleRefreshToken = resolveGoogleRefreshToken();
  const redirectUri = process.env.REDIRECT_URI?.trim();

  if (!gmailUser || !googleClientId || !googleClientSecret || !googleRefreshToken || !redirectUri) {
    const missing: string[] = [];
    if (!gmailUser) missing.push('GOOGLE_EMAIL_USER|GMAIL_USER|SMTP_USER|NEXT_PUBLIC_EMAIL_SEND|EMAIL_FROM');
    if (!googleClientId) missing.push('GOOGLE_CLIENT_ID');
    if (!googleClientSecret) missing.push('GOOGLE_CLIENT_SECRET');
    if (!googleRefreshToken) missing.push('GOOGLE_REFRESH_TOKEN|REFRESH_TOKEN');
    if (!redirectUri) missing.push('REDIRECT_URI');
    throw new Error(`Gmail OAuth mail not configured: ${missing.join(', ')}`);
  }

  const oauth2Client = new google.auth.OAuth2(googleClientId, googleClientSecret, redirectUri);
  oauth2Client.setCredentials({ refresh_token: googleRefreshToken });

  let accessToken: string | null | undefined;
  try {
    const tokenResponse = await oauth2Client.getAccessToken();
    accessToken = tokenResponse.token;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (/invalid_grant/i.test(errMsg)) {
      throw new Error(
        `Gmail OAuth refresh token is invalid or expired (invalid_grant). ` +
          `Set GOOGLE_REFRESH_TOKEN (or REFRESH_TOKEN) from OAuth Playground with scope https://mail.google.com/, ` +
          `same GOOGLE_CLIENT_ID/SECRET, REDIRECT_URI=${redirectUri}, and account ${gmailUser}.`,
      );
    }
    throw err;
  }

  if (!accessToken) {
    throw new Error('Gmail OAuth: failed to obtain access token');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: gmailUser,
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      refreshToken: googleRefreshToken,
      accessToken,
    },
  });
}

function createSmtpTransport(): nodemailer.Transporter {
  const host = process.env.SMTP_HOST?.trim();
  const port = parseInt(process.env.SMTP_PORT?.trim() || '587', 10);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim() || process.env.SMTP_PASSWORD?.trim();
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

async function createTransportFromEnv(): Promise<nodemailer.Transporter> {
  if (useSmtpTransport()) {
    return createSmtpTransport();
  }
  if (isGoogleMailOAuthConfigured()) {
    return createGoogleOAuthTransport();
  }
  throw new Error(
    '[mailer] No transport: set SMTP_HOST, or Gmail OAuth (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, REDIRECT_URI, Gmail user).',
  );
}

export async function sendHtmlEmail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  const from = resolveFromAddress();
  if (!from) {
    console.warn('[mailer] From address missing; skipping send');
    return;
  }

  if (!isMailConfigured()) {
    const gap = describeMailConfigGap();
    console.warn('[mailer] Mail not configured:', gap.hint);
    return;
  }

  let transport: nodemailer.Transporter;
  try {
    transport = await createTransportFromEnv();
  } catch (err) {
    console.error('[mailer] createTransport failed:', err);
    throw err;
  }

  try {
    const info = await transport.sendMail({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
    console.info('[mailer] sent', { to: params.to, messageId: info.messageId });
  } catch (err) {
    console.error('[mailer] sendMail failed:', { to: params.to, subject: params.subject, err });
    throw err;
  }
}
