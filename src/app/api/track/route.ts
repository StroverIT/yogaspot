import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ANALYTICS_EVENTS } from '@/lib/analytics-events';
import { trackServerEvent } from '@/lib/server-analytics';

export const runtime = 'nodejs';

const trackEventSchema = z.object({
  event_name: z.enum(ANALYTICS_EVENTS),
  user_id: z.string().trim().min(1).optional().nullable(),
  studio_id: z.string().trim().min(1).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = trackEventSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid analytics payload',
        issues: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  await trackServerEvent({
    eventName: parsed.data.event_name,
    userId: parsed.data.user_id,
    studioId: parsed.data.studio_id,
    metadata: parsed.data.metadata,
  });

  return NextResponse.json({ success: true });
}
