import { NextResponse } from "next/server";
import { getPublicCatalog } from "@/lib/get-public-catalog";
import { getSessionUser } from '@/lib/api-auth';
import { trackServerEvent } from '@/lib/server-analytics';

export const runtime = "nodejs";

/** Public catalog — guests and all roles. Includes flat `classes` for discover/home maps. */
export async function GET() {
  const sessionUser = await getSessionUser();
  const { studios, classes } = await getPublicCatalog();
  await trackServerEvent({
    eventName: 'search_performed',
    userId: sessionUser?.id,
    metadata: {
      resultStudios: studios.length,
      resultClasses: classes.length,
    },
  });
  return NextResponse.json({ studios, classes });
}
