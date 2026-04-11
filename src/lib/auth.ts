import type { NextAuthOptions } from 'next-auth';
import type { Role } from '@prisma/client';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcrypt';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? process.env.CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? process.env.CLIENT_SECRET ?? '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Missing email or password');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          name: user.name ?? undefined,
          email: user.email ?? undefined,
          role: user.role,
        } as any;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      const t: any = token;

      let dbUser: { role: Role; dashboardOnboardingDismissedAt: Date | null } | null = null;
      if (user) {
        const u: any = user;
        t.role = u.role ?? t.role ?? 'client';
        const id = (u.id as string | undefined) ?? (t.sub as string | undefined);
        if (id) {
          dbUser = await prisma.user.findUnique({
            where: { id },
            select: { role: true, dashboardOnboardingDismissedAt: true },
          });
        }
      } else if (t.sub || t.email) {
        dbUser = await prisma.user.findUnique({
          where: t.sub ? { id: t.sub as string } : { email: t.email as string },
          select: { role: true, dashboardOnboardingDismissedAt: true },
        });
      }

      if (dbUser) {
        t.role = dbUser.role;
        t.dashboardOnboardingDismissedAt = dbUser.dashboardOnboardingDismissedAt?.toISOString() ?? null;
      }

      return t;
    },
    async session({ session, token }) {
      const t: any = token;
      if (session.user) {
        (session.user as any).id = t.sub as string;
        (session.user as any).role = t.role ?? 'client';
        (session.user as any).dashboardOnboardingDismissedAt = t.dashboardOnboardingDismissedAt ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

