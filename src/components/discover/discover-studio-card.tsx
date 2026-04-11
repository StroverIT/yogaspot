import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";
import type { DiscoverStudio } from "@/types/studio-discovery";

interface DiscoverStudioCardProps {
  studio: DiscoverStudio;
  /** First grid cells: set so LCP image is loaded eagerly (Next.js recommendation). */
  priority?: boolean;
}

export function DiscoverStudioCard({ studio, priority = false }: DiscoverStudioCardProps) {
  return (
    <Link href={`/studio/${studio.id}`}>
      <Card className="group overflow-hidden bg-yoga-surface border-yoga-accent-soft hover:border-yoga-accent hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
        <div className="relative h-48 overflow-hidden">
          <img
            src={studio.image}
            alt={studio.name}
            className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            {...(priority ? { fetchPriority: "high" as const } : {})}
          />
          <div className="absolute top-3 right-3">
            <Badge className="bg-yoga-surface/95 text-yoga-text border-none gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              {studio.rating.toFixed(1)}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-serif text-lg font-semibold text-yoga-text group-hover:text-yoga-accent transition-colors">
            {studio.name}
          </h3>

          <div className="mt-2 flex items-center gap-1 text-yoga-text-soft text-sm">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{studio.location}</span>
            {studio.distance && (
              <span className="ml-1 text-yoga-secondary font-medium flex-shrink-0">
                • {studio.distance}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {studio.styles.slice(0, 3).map((style) => (
              <Badge
                key={style}
                variant="secondary"
                className="bg-yoga-accent-soft text-yoga-accent border-none text-xs"
              >
                {style}
              </Badge>
            ))}
          </div>

          <p className="mt-3 text-xs text-yoga-text-soft">{studio.reviewCount} отзива</p>
        </CardContent>
      </Card>
    </Link>
  );
}
