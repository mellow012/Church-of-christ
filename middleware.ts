// middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PROTECTED_PREFIXES = ['/dashboard', '/members', '/reports'];
const AUTH_ONLY_ROUTES   = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken  = request.cookies.get('sb-access-token')?.value;
  const refreshToken = request.cookies.get('sb-refresh-token')?.value;

  let isAuthenticated = false;
  let newAccessToken: string | null = null;
  let newExpiresIn: number | null = null;

  if (accessToken) {
    // Verify the token by calling Supabase getUser — this is the only safe check
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    isAuthenticated = !!user && !error;

    // If access token expired but we have a refresh token, try to renew
    if (!isAuthenticated && refreshToken) {
      const { data, error: refreshError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (!refreshError && data.session) {
        isAuthenticated = true;
        newAccessToken = data.session.access_token;
        newExpiresIn   = data.session.expires_in;
      }
    }
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r));

  // Authenticated → redirect away from /login
  if (isAuthenticated && isAuthOnly) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Unauthenticated → redirect to /login
  if (!isAuthenticated && isProtected) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next({ request });

  // Write refreshed access token if we renewed it
  if (newAccessToken && newExpiresIn) {
    response.cookies.set({
      name: 'sb-access-token',
      value: newAccessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: newExpiresIn,
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};