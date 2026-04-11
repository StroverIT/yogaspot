import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function safeInternalPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) {
    return '/';
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
  const next = safeInternalPath(nextRaw);

  if (roleParam === 'business') {
    const userId = (session.user as { id?: string }).id;
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'business' },
      });
    }
  }

  return NextResponse.redirect(new URL(next, req.url));
}
