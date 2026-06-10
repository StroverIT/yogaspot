import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST() {
  return NextResponse.json(
    {
      error: 'Заявките за абонамент вече не се използват. Управлявайте абонаментите от раздел „Абонаменти“.',
      code: 'subscription_requests_deprecated',
    },
    { status: 410 },
  );
}
