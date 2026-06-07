import { NextResponse } from 'next/server';
import { getPublicStudioExtras } from '@/lib/get-public-studio';
import { jsonError } from '@/lib/api-auth';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const extras = await getPublicStudioExtras(id);

  if (!extras) {
    return jsonError('Not found', 404);
  }

  return NextResponse.json(extras);
}
