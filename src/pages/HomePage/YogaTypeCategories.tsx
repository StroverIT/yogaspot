"use client";

import Link from "next/link";
import { YOGA_TYPES } from "@/data/mock-data";
import { ChevronRight } from "lucide-react";

export default function YogaTypeCategories() {
  return (
    <section className="py-10 bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-sm font-medium text-muted-foreground shrink-0">Популярни:</span>
          {YOGA_TYPES.slice(0, 8).map((type) => (
            <Link
              key={type}
              href={`/discover?type=${type}`}
              className="shrink-0 px-4 py-2 rounded-full border border-border bg-background text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-all"
            >
              {type}
            </Link>
          ))}
          <Link
            href="/discover"
            className="shrink-0 flex items-center gap-1 px-4 py-2 text-sm font-medium text-primary hover:underline"
          >
            Виж всички <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
