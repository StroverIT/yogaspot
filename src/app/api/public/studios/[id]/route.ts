import { NextResponse } from 'next/server';
import { getPublicStudioPayload } from '@/lib/get-public-studio';
import { jsonError } from '@/lib/api-auth';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const payload = await getPublicStudioPayload(id, { trackView: true });

  if (!payload) {
    return jsonError('Not found', 404);
  }

  return NextResponse.json(payload);
}
