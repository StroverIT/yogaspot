import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sessionToNavUser } from '@/lib/nav-user';
import ProfileShell from '@/views/Profile/ProfileShell';

export default async function ProfileLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const navUser = sessionToNavUser(session);
  if (!navUser) {
    redirect('/auth');
  }

  return <ProfileShell serverUser={navUser}>{children}</ProfileShell>;
}
