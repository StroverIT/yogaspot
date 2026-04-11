'use client';

import { Building2, Calendar, Star, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Review, Studio, YogaClass } from '@/data/mock-data';
import { StatCard } from '../components/StatCard';

const LIST_LIMIT = 5;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('bg-BG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

type EnrollmentRow = {
  id: string;
  userName: string;
  className: string;
  studioName: string;
  enrolledAt: string;
};

export function AdminOverview() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [classes, setClasses] = useState<YogaClass[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/studios').then((r) => (r.ok ? r.json() : { studios: [] })),
      fetch('/api/public/studios').then((r) => (r.ok ? r.json() : { classes: [] })),
      fetch('/api/admin/reviews').then((r) => (r.ok ? r.json() : { reviews: [] })),
      fetch('/api/admin/recent-enrollments').then((r) => (r.ok ? r.json() : { enrollments: [] })),
      fetch('/api/admin/users').then((r) => (r.ok ? r.json() : { users: [] })),
    ]).then(([stRes, pubRes, revRes, enrRes, usersRes]) => {
      setStudios(stRes.studios ?? []);
      setClasses(pubRes.classes ?? []);
      setReviews(revRes.reviews ?? []);
      setEnrollments(enrRes.enrollments ?? []);
      setUserCount((usersRes.users as unknown[] | undefined)?.length ?? 0);
    });
  }, []);

  const totalEnrollments = classes.reduce((s, c) => s + c.enrolled, 0);

  const recentStudios = useMemo(
    () => [...studios].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, LIST_LIMIT),
    [studios],
  );
  const recentEnrollments = useMemo(
    () => [...enrollments].sort((a, b) => b.enrolledAt.localeCompare(a.enrolledAt)).slice(0, LIST_LIMIT),
    [enrollments],
  );
  const recentReviews = useMemo(
    () => [...reviews].sort((a, b) => b.date.localeCompare(a.date)).slice(0, LIST_LIMIT),
    [reviews],
  );

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard icon={<Users className="h-5 w-5 text-primary" />} label="Потребители" value={String(userCount)} trend="от базата" tint="primary" />
        <StatCard icon={<Building2 className="h-5 w-5 text-accent" />} label="Студиа" value={studios.length} trend="+2 нови" tint="accent" />
        <StatCard icon={<Calendar className="h-5 w-5 text-sage-foreground" />} label="Записвания" value={totalEnrollments} trend="+8% тази седмица" tint="sage" />
        <StatCard icon={<Star className="h-5 w-5 text-accent" />} label="Ревюта" value={reviews.length} tint="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-md">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Последно създадени студиа</h3>
          <div className="space-y-3">
            {recentStudios.map(studio => (
              <div key={studio.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">🧘</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{studio.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{studio.address}</p>
                  <p className="text-[11px] text-muted-foreground/90 mt-0.5">Създадено {formatDate(studio.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                  <span className="text-sm font-semibold text-foreground">{studio.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-md">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Последните 5 записвания</h3>
          <div className="space-y-3">
            {recentEnrollments.map(row => (
              <div key={row.id} className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-medium text-foreground text-sm">{row.userName}</span>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">{formatDateTime(row.enrolledAt)}</span>
                </div>
                <p className="text-sm text-foreground/90">{row.className}</p>
                <p className="text-xs text-muted-foreground truncate">{row.studioName}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-md">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Последните 5 създадени ревюта</h3>
          <div className="space-y-3">
            {recentReviews.map(review => (
              <div key={review.id} className="p-3 rounded-xl bg-muted/50">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium text-foreground text-sm truncate">{review.userName}</span>
                  <span className="text-[11px] text-muted-foreground shrink-0">{formatDate(review.date)}</span>
                </div>
                <div className="flex mb-1">{Array.from({ length: review.rating }).map((_, j) => <Star key={j} className="h-3 w-3 fill-accent text-accent" />)}</div>
                <p className="text-sm text-muted-foreground line-clamp-2">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
