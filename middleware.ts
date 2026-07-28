import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!token.emailVerified && pathname !== '/verify') {
    return NextResponse.redirect(new URL('/verify', req.url));
  }

  if (token.emailVerified && !token.onboarded && pathname !== '/onboarding' && pathname !== '/verify') {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/discover/:path*',
    '/matches/:path*',
    '/profile/:path*',
    '/onboarding/:path*',
    '/verify/:path*',
  ],
};
