'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function RetreatSignupButton({
  retreatId,
  enrolled,
  maxCapacity,
  isEnrolled = false,
  className = 'w-full',
}: {
  retreatId: string;
  enrolled: number;
  maxCapacity: number;
  isEnrolled?: boolean;
  className?: string;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const isFull = enrolled >= maxCapacity;

  const handleSignup = async () => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    setPending(true);
    try {
      const res = await fetch('/api/bookings/retreat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retreatId }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(typeof j.error === 'string' ? j.error : `Неуспешно записване (${res.status})`);
        return;
      }
      toast.success('Успешно записване за рийтрийта.');
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      className={className}
      disabled={isEnrolled || isFull || pending}
      onClick={() => void handleSignup()}
    >
      {isEnrolled ? 'Вече сте записани' : isFull ? 'Няма свободни места' : pending ? 'Записване...' : 'Запиши се'}
    </Button>
  );
}
