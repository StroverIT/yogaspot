"use client";

import { useSession } from "next-auth/react";

/** Hero / home: “add your studio” promos — only for guests or business accounts. */
export function useShowAddStudioMarketing(): boolean {
  const { status, data: session } = useSession();
  if (status === "loading") return false;
  if (status === "unauthenticated") return true;
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === "business";
}
