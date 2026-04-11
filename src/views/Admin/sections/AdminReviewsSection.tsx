'use client';

import { useMemo, useState, useEffect } from 'react';
import type { Review } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Star, Trash2 } from 'lucide-react';

export function AdminReviewsSection() {
  const [search, setSearch] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetch('/api/admin/reviews')
      .then((r) => (r.ok ? r.json() : { reviews: [] }))
      .then((j: { reviews: Review[] }) => setReviews(j.reviews ?? []));
  }, []);

  const filteredReviews = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter(r => {
      const email = (r.userEmail ?? '').toLowerCase();
      return r.userName.toLowerCase().includes(q) || email.includes(q);
    });
  }, [search, reviews]);

  return (
    <div>
      <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-md">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Търси по име или имейл..."
              className="pl-10 rounded-xl bg-white"
              type="search"
              autoComplete="off"
            />
          </div>
        </div>
        <div className="divide-y divide-border">
          {filteredReviews.length === 0 ? (
            <p className="text-sm text-muted-foreground px-5 py-8 text-center">Няма ревюта за това търсене.</p>
          ) : (
            filteredReviews.map(review => (
              <div
                key={review.id}
                className="flex items-start justify-between gap-4 px-5 py-5"
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
                    {review.userEmail && (
                      <p className="text-xs text-muted-foreground mb-1">{review.userEmail}</p>
                    )}
                    <p className="text-sm text-foreground/80">{review.text}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">{review.date}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive shrink-0 rounded-lg">
                  <Trash2 className="h-4 w-4 mr-1.5" /> Премахни
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
