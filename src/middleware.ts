import { withAuth } from 'next-auth/middleware';
import type { NextRequest } from 'next/server';

export default withAuth(
  function middleware(_req: NextRequest) {
    // Custom logic can go here if needed.
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;

        if (pathname.startsWith('/admin')) {
          if (!token) return false;
          return (token as { role?: string }).role === 'admin';
        }

        return true;
      },
    },
  },
);

export const config = {
  matcher: ['/admin', '/admin/:path*', '/dashboard', '/dashboard/:path*', '/profile', '/profile/:path*'],
};

