// app/api/auth/logout/route.ts

import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0, // immediate expiry = delete
  };

  response.cookies.set({ name: 'sb-access-token',  value: '', ...cookieOptions });
  response.cookies.set({ name: 'sb-refresh-token', value: '', ...cookieOptions });

  return response;
}