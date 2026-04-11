'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MessageSquareText, Star } from 'lucide-react';
import { toast } from 'sonner';
import type { Review } from '@/data/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { StudioTabEmptyState } from '@/components/studio-detail/studio-tab-empty-state';

function displayInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function StarRatingDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} от 5 звезди`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i < rating ? 'fill-accent text-accent' : 'fill-none text-muted-foreground/40',
          )}
        />
      ))}
    </div>
  );
}

export function ReviewsTabContent({
  studioId,
  studioOwnerUserId,
  studioReviews,
  onReviewSubmitted,
}: {
  studioId: string;
  studioOwnerUserId: string;
  studioReviews: Review[];
  onReviewSubmitted: () => void;
}) {
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOwner = !!(user && studioOwnerUserId && user.id === studioOwnerUserId);
  const canCompose = isAuthenticated && !isOwner;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCompose || rating < 1 || rating > 5) {
      toast.error('Изберете оценка от 1 до 5 звезди.');
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error('Моля, напишете текст на отзива.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/public/studios/${encodeURIComponent(studioId)}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, text: trimmed }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? 'Неуспешно изпращане на отзива.');
        return;
      }
      toast.success('Благодарим за отзива!');
      setRating(0);
      setText('');
      onReviewSubmitted();
    } catch {
      toast.error('Мрежова грешка. Опитайте отново.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {!isAuthenticated && (
        <p className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <Link href="/auth" className="font-medium text-primary underline-offset-4 hover:underline">
            Влезте в акаунта си
          </Link>
          , за да напишете отзив с оценка и текст.
        </p>
      )}
      {isAuthenticated && isOwner && (
        <p className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Като собственик на това студио не можете да публикувате ревю за него.
        </p>
      )}
      {canCompose && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-sm font-medium text-foreground">Вашият отзив</p>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Оценка</p>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => {
                const value = i + 1;
                const active = value <= rating;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="rounded-md p-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`${value} звезди`}
                  >
                    <Star
                      className={cn(
                        'h-8 w-8',
                        active ? 'fill-accent text-accent' : 'fill-none text-muted-foreground/35',
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label htmlFor="review-text" className="mb-2 block text-xs text-muted-foreground">
              Текст
            </label>
            <Textarea
              id="review-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Споделете впечатленията си…"
              rows={4}
              maxLength={2000}
              className="resize-y"
            />
          </div>
          <Button type="submit" disabled={submitting || rating < 1}>
            {submitting ? 'Изпращане…' : 'Публикувай отзив'}
          </Button>
        </form>
      )}

      <div className="space-y-4">
        {studioReviews.length === 0 && (
          <StudioTabEmptyState
            icon={MessageSquareText}
            title="Все още няма ревюта"
            subtitle="Бъдете първият, който споделя впечатления от посещение."
          />
        )}
        {studioReviews.map((review) => (
          <div key={review.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex gap-3">
              <Avatar className="h-11 w-11 shrink-0 border border-border">
                {review.userImage ? (
                  <AvatarImage src={review.userImage} alt="" />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                  {displayInitials(review.userName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-foreground">{review.userName}</span>
                  <StarRatingDisplay rating={review.rating} />
                </div>
                <p className="mt-2 text-foreground/80">{review.text}</p>
                <p className="mt-2 text-xs text-muted-foreground">{review.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
