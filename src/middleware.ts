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
        const role = (token as any)?.role as string | undefined;

        // if (!token) return false;

        // if (pathname.startsWith('/admin')) {
        //   return role === 'admin';
        // }

        // if (pathname.startsWith('/dashboard')) {
        //   return role === 'business';
        // }

        return true;
      },
    },
  },
);

export const config = {
  matcher: ['/admin/:path*', '/dashboard', '/dashboard/:path*'],
};

