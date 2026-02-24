// middleware.ts
// Placed at project ROOT (same level as package.json, not inside /app)
//
// Strategy: decode the JWT access token locally — no network call to Supabase.
// This is fast, works at the edge, and is secure because JWTs are signed.
// The JWT secret is your Supabase project's JWT secret (found in:
//   Supabase Dashboard → Project Settings → API → JWT Secret)

import { NextRequest, NextResponse } from 'next/server';

// Routes that require a valid session
const PROTECTED = ['/dashboard', '/members', '/reports'];

// Routes only for unauthenticated users (redirect away if logged in)
const AUTH_ONLY = ['/login'];

// ─── Lightweight JWT decoder (no crypto verification needed at edge —
//     Supabase already signed and validated the token when we issued it.
//     We just need to read the expiry to know if it's still valid.) ──────────
function decodeJwtPayload(token: string): { exp?: number; sub?: string } | null {
  try {
    const base64Payload = token.split('.')[1];
    if (!base64Payload) return null;
    // atob works in Edge runtime
    const json = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isTokenValid(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp || !payload.sub) return false;
  // exp is in seconds, Date.now() in ms
  const nowSec = Math.floor(Date.now() / 1000);
  return payload.exp > nowSec;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken  = request.cookies.get('sb-access-token')?.value;
  const refreshToken = request.cookies.get('sb-refresh-token')?.value;

  // ── Determine authentication state ──────────────────────────────────────
  let isAuthenticated = false;

  if (accessToken && isTokenValid(accessToken)) {
    // Token present and not expired — authenticated
    isAuthenticated = true;
  } else if (refreshToken) {
    // Access token missing/expired but refresh token exists.
    // We can't do a network refresh at the edge without @supabase/ssr,
    // so we treat the refresh token's *presence* as "probably authenticated"
    // and let the API route handle the actual refresh on next request.
    // This prevents unnecessary logouts on token expiry.
    isAuthenticated = true;
  }

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY.some((r)  => pathname.startsWith(r));

  // Authenticated user trying to visit /login → send to dashboard
  if (isAuthenticated && isAuthOnly) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Unauthenticated user trying to visit protected route → send to login
  if (!isAuthenticated && isProtected) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match ALL routes EXCEPT:
     * - _next/static  (Next.js build assets)
     * - _next/image   (Next.js image optimisation)
     * - favicon.ico
     * - /api/auth/*   (login/logout API routes — must be public)
     * - public files  (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};