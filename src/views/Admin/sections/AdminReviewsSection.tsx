import { mockReviews } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Star, Trash2 } from 'lucide-react';

export function AdminReviewsSection() {
  return (
    <div>
      <div className="space-y-3">
        {mockReviews.map(review => (
          <div
            key={review.id}
            className="rounded-xl border border-border bg-card p-5 flex items-start justify-between gap-4 hover:shadow-md transition-shadow"
          >
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                {review.userName[0]}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground">{review.userName}</span>
                  <div className="flex">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-accent text-accent" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-foreground/80">{review.text}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">{review.date}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive shrink-0 rounded-lg">
              <Trash2 className="h-4 w-4 mr-1.5" /> Премахни
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
