import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/api-auth';
import { getAdminAnalytics } from '@/lib/admin-analytics';

export const runtime = 'nodejs';

function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function GET(request: Request) {
  const gate = await requireRole('admin');
  if (!gate.ok) return gate.response;

  const url = new URL(request.url);
  const from = parseDate(url.searchParams.get('from'));
  const to = parseDate(url.searchParams.get('to'));
  const studioId = url.searchParams.get('studio_id')?.trim() || undefined;

  if ((from && !to) || (!from && to)) {
    return NextResponse.json({ error: 'Both from and to are required when filtering by date range' }, { status: 400 });
  }

  if (from && to && from > to) {
    return NextResponse.json({ error: '"from" must be before "to"' }, { status: 400 });
  }

  const analytics = await getAdminAnalytics({
    studioId,
    from,
    to,
  });

  return NextResponse.json(analytics);
}
