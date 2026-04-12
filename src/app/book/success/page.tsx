import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Search = { session_id?: string | string[] };

export default async function BookSuccessPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const sessionId = typeof sp.session_id === 'string' ? sp.session_id : undefined;

  return (
    <div className="container mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-semibold text-foreground">Плащането е успешно</h1>
      <p className="mt-3 text-muted-foreground">
        Записът ви за класа е потвърден. Ще получите имейл от Stripe с бележката за плащане.
      </p>
      {sessionId ? (
        <p className="mt-2 text-xs text-muted-foreground break-all">Референция: {sessionId}</p>
      ) : null}
      <Button asChild className="mt-8">
        <Link href="/discover">Към търсене</Link>
      </Button>
    </div>
  );
}
