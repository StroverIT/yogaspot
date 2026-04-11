"use client";

import { AddStudioCtaButton } from "@/components/home/add-studio-cta-button";
import { ArrowRight } from "lucide-react";

export default function ForStudiosCTA() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-sage/15 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-4xl mx-auto">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              Притежаваш йога студио?
            </h2>
            <p className="text-muted-foreground max-w-md">
              Покажи пространството си на хиляди йога ентусиасти. Управлявай разписание, инструктори и резервации —
              всичко от едно табло.
            </p>
          </div>
          <AddStudioCtaButton size="lg" className="text-base px-8 py-6 rounded-xl shrink-0">
            Добави студио безплатно <ArrowRight className="ml-2 h-5 w-5" />
          </AddStudioCtaButton>
        </div>
      </div>
    </section>
  );
}
