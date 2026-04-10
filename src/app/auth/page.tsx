"use client";

import { Suspense } from "react";
import Auth from "@/views/Auth";
import { Spinner } from "@/components/ui/spinner";

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[85vh] items-center justify-center">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      }
    >
      <Auth />
    </Suspense>
  );
}

