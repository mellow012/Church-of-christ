// app/(app)/layout.tsx — AUTHENTICATED layout
// Only wraps: /dashboard, /members, /reports
// The (app) folder name is a Next.js route group — it does NOT
// affect URLs. /dashboard is still /dashboard, not /(app)/dashboard.

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/NavBar';

function decodeJwtPayload(token: string): { exp?: number; sub?: string } | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const json = Buffer.from(
      base64.replace(/-/g, '+').replace(/_/g, '/'),
      'base64'
    ).toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isTokenValid(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp || !payload?.sub) return false;
  return payload.exp > Math.floor(Date.now() / 1000);
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const accessToken  = cookieStore.get('sb-access-token')?.value;
  const refreshToken = cookieStore.get('sb-refresh-token')?.value;

  const hasValidSession =
    (accessToken && isTokenValid(accessToken)) || !!refreshToken;

  if (!hasValidSession) {
    redirect('/login');
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}