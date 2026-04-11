"use client";

import { Suspense } from "react";
import StudioDetail from "@/views/StudioDetail";

export default function StudioDetailPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Зареждане…</div>}>
      <StudioDetail />
    </Suspense>
  );
}

