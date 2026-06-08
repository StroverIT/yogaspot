import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { trackServerEvent } from '@/lib/server-analytics';

function safeInternalPath(next: string | null, fallback = '/'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) {
    return fallback;
  }
  return next;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  const roleParam = req.nextUrl.searchParams.get('role');
  const nextRaw = req.nextUrl.searchParams.get('next');
  const next = safeInternalPath(nextRaw, roleParam === 'business' ? '/dashboard' : '/');

  if (roleParam === 'business') {
    const userId = (session.user as { id?: string }).id;
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'business' },
      });
    }
  }

  // Google signup path: record one signup event exactly once per user.
  // We infer "first signup" by checking if a signup event already exists.
  const userId = (session.user as { id?: string }).id;
  let isNewBusinessSignup = false;

  if (userId) {
    const hasSignupEvent = await prisma.analyticsEvent.findFirst({
      where: {
        user_id: userId,
        event_name: { in: ['signup_completed', 'studio_signup_completed'] },
      },
      select: { id: true },
    });

    if (!hasSignupEvent) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      isNewBusinessSignup = user?.role === 'business';

      await trackServerEvent({
        eventName: isNewBusinessSignup ? 'studio_signup_completed' : 'signup_completed',
        userId,
        metadata: {
          source: 'google_oauth',
        },
      });
    }
  }

  const redirectUrl = new URL(next, req.url);
  if (isNewBusinessSignup) {
    redirectUrl.searchParams.set('registered', '1');
  }

  return NextResponse.redirect(redirectUrl);
}
