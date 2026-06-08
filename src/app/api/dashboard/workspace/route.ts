import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/api-auth';
import { getDashboardWorkspaceData } from '@/lib/dashboard-workspace-data';

export const runtime = 'nodejs';

/** Aggregated dashboard payload for the logged-in business (or all studios for admin). */
export async function GET() {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const data = await getDashboardWorkspaceData(gate.user);
  return NextResponse.json(data);
}
