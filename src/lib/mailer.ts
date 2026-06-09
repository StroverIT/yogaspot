import nodemailer from 'nodemailer';

/**
 * Outbound mail (nodemailer). **If `SMTP_HOST` is set, SMTP is used** (even when Google OAuth
 * env vars exist for NextAuth) so login credentials do not accidentally hijack mail transport.
 *
 * **SMTP** - when `SMTP_HOST` + `EMAIL_FROM` are set:
 * - `SMTP_PORT` (default 587), `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`
 *
 * **Gmail / Google Workspace (OAuth2)** - only when `SMTP_HOST` is **not** set and all of:
 * - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `REFRESH_TOKEN` (refresh token must include a
 *   Gmail send scope, e.g. `https://mail.google.com/`)
 * - `EMAIL_FROM` - From header; mailbox address must match the Google account for `REFRESH_TOKEN`
 *
 * Gmail sends obtain a fresh access token via Google’s token endpoint (more reliable than
 * relying on nodemailer’s implicit refresh alone).
 */

function mailboxFromEmailFrom(): string | null {
  const raw = process.env.EMAIL_FROM?.trim();
  if (!raw) return null;
  const angle = raw.match(/<([^>]+)>/);
  const addr = (angle ? angle[1] : raw).trim();
  return addr || null;
}

function useSmtpTransport(): boolean {
  return Boolean(process.env.SMTP_HOST?.trim());
}

function isGoogleMailOAuthConfigured(): boolean {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const refreshToken = process.env.REFRESH_TOKEN?.trim();
  const user = mailboxFromEmailFrom();
  return Boolean(clientId && clientSecret && refreshToken && user);
}

export function isMailConfigured(): boolean {
  if (!process.env.EMAIL_FROM?.trim()) return false;
  if (useSmtpTransport()) return true;
  return isGoogleMailOAuthConfigured();
}

/** Why mail is disabled (no secrets / PII). Use in logs when skipping send. */
export function describeMailConfigGap(): {
  ready: boolean;
  hasEmailFrom: boolean;
  useSmtp: boolean;
  oauthComplete: boolean;
  hint: string;
} {
  const hasEmailFrom = Boolean(process.env.EMAIL_FROM?.trim());
  const useSmtp = useSmtpTransport();
  const oauthComplete = isGoogleMailOAuthConfigured();
  const ready = isMailConfigured();
  if (ready) {
    return { ready: true, hasEmailFrom, useSmtp, oauthComplete, hint: '' };
  }
  if (!hasEmailFrom) {
    return {
      ready: false,
      hasEmailFrom,
      useSmtp,
      oauthComplete,
      hint: 'Set EMAIL_FROM (From address for outgoing mail).',
    };
  }
  return {
    ready: false,
    hasEmailFrom,
    useSmtp,
    oauthComplete,
    hint:
      'Set SMTP_HOST for SMTP, or leave SMTP_HOST unset and set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET + REFRESH_TOKEN (Gmail send scope) for OAuth.',
  };
}

async function refreshGoogleAccessToken(): Promise<string> {
  const client_id = process.env.GOOGLE_CLIENT_ID?.trim();
  const client_secret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const refresh_token = process.env.REFRESH_TOKEN?.trim();
  if (!client_id || !client_secret || !refresh_token) {
    throw new Error('Gmail OAuth: missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or REFRESH_TOKEN');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id,
      client_secret,
      refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  const json = (await res.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!res.ok || !json.access_token) {
    const detail = json.error_description || json.error || JSON.stringify(json);
    throw new Error(`Gmail OAuth token refresh failed (${res.status}): ${detail}`);
  }

  return json.access_token;
}

async function createGoogleOAuthTransport() {
  const user = mailboxFromEmailFrom();
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const refreshToken = process.env.REFRESH_TOKEN?.trim();
  if (!user || !clientId || !clientSecret || !refreshToken) {
    throw new Error('Gmail OAuth mail: set EMAIL_FROM (mailbox), GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REFRESH_TOKEN');
  }

  const accessToken = await refreshGoogleAccessToken();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user,
      clientId,
      clientSecret,
      refreshToken,
      accessToken,
    },
  });
}

function createSmtpTransport() {
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

async function createTransportFromEnv() {
  if (useSmtpTransport()) {
    return createSmtpTransport();
  }
  if (isGoogleMailOAuthConfigured()) {
    return createGoogleOAuthTransport();
  }
  throw new Error(
    '[mailer] No transport: set SMTP_HOST, or set EMAIL_FROM + GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET + REFRESH_TOKEN (without SMTP_HOST for Gmail OAuth)',
  );
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

  if (!isMailConfigured()) {
    console.warn(
      '[mailer] Mail not configured: set EMAIL_FROM and SMTP_HOST, or EMAIL_FROM + GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET + REFRESH_TOKEN (Gmail; leave SMTP_HOST unset)',
    );
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
