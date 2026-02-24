'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function LoginForm() {
  // useSearchParams must be inside Suspense
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Invalid email or password.');
        return;
      }

      // ── IMPORTANT ────────────────────────────────────────────────────────
      // Use a HARD navigation (window.location) NOT router.push().
      // router.push() is client-side and the new page renders before the
      // browser has committed the Set-Cookie headers from the API response,
      // so the middleware sees no cookie and redirects back to /login.
      // A full page load guarantees cookies are written before the next
      // request hits the middleware.
      // ─────────────────────────────────────────────────────────────────────
      window.location.href = next;

    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
    // Note: don't setLoading(false) on success — page is navigating away
  }

  return (
    <div className="bg-primary-warm border border-neutral-surface rounded-2xl p-8 shadow-lg shadow-primary-deep/10">
      <div className="mb-6">
        <h2 className="font-bold text-xl text-heading tracking-tight">Sign in</h2>
        <p className="text-xs text-caption mt-1">Enter your credentials to access the directory</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-heading">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-caption" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="pl-10 bg-background border-neutral-surface focus:border-gold focus:ring-gold/20 h-11"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-heading">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-caption" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="pl-10 bg-background border-neutral-surface focus:border-gold focus:ring-gold/20 h-11"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-terracotta/10 border border-terracotta/25 text-terracotta text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gold hover:bg-amber text-primary-deep font-bold h-11 mt-2 shadow-md shadow-gold/20 text-sm"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</>
            : 'Sign in'
          }
        </Button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-gold/8 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-primary-deep/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-5 rounded-full overflow-hidden ring-4 ring-gold/40 shadow-xl shadow-gold/20">
            <Image
              src="/coc-logo.jpg"
              alt="Church of Christ at Redcross"
              width={96}
              height={96}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <h1 className="font-bold text-2xl text-heading leading-tight tracking-tight">
            Church of Christ
          </h1>
          <p className="text-sm text-caption mt-1 font-medium">at Redcross — Member Directory</p>
        </div>

        {/* LoginForm must be in Suspense because it calls useSearchParams() */}
        <Suspense fallback={
          <div className="bg-primary-warm border border-neutral-surface rounded-2xl p-8 shadow-sm animate-pulse">
            <div className="space-y-4">
              <div className="h-5 bg-neutral-surface rounded w-20" />
              <div className="h-11 bg-neutral-surface rounded" />
              <div className="h-11 bg-neutral-surface rounded" />
              <div className="h-11 bg-gold/20 rounded" />
            </div>
          </div>
        }>
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-caption/60 mt-6">
          Contact your administrator if you need access.
        </p>
      </div>
    </div>
  );
}