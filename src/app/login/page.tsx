'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Church, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Inner component — reads search params (must be inside Suspense)
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      router.push(next);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-primary-warm border border-neutral-surface rounded-2xl p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="font-serif text-xl text-heading">Sign in</h2>
        <p className="text-xs text-caption mt-1">
          Enter your credentials to access the directory
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-heading">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-caption" />
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required autoComplete="email"
              className="pl-10 bg-background border-neutral-surface focus:border-gold focus:ring-gold/20 h-10" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-heading">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-caption" />
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required autoComplete="current-password"
              className="pl-10 bg-background border-neutral-surface focus:border-gold focus:ring-gold/20 h-10" />
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-terracotta/10 border border-terracotta/25 text-terracotta text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <Button type="submit" disabled={loading}
          className="w-full bg-primary-deep hover:bg-primary-deep/90 text-white font-semibold h-10 mt-2">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</> : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}

// Outer shell — static, safe to prerender. Wraps LoginForm in Suspense.
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold/4 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary-deep/5 blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary-deep flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-deep/20">
            <Church className="w-7 h-7 text-gold" />
          </div>
          <h1 className="font-serif text-2xl text-heading leading-tight">Church of Christ</h1>
          <p className="text-sm text-caption mt-1">at Redcross — Member Directory</p>
        </div>
        <Suspense fallback={
          <div className="bg-primary-warm border border-neutral-surface rounded-2xl p-8 shadow-sm animate-pulse">
            <div className="space-y-4">
              <div className="h-5 bg-neutral-surface rounded w-20" />
              <div className="h-10 bg-neutral-surface rounded" />
              <div className="h-10 bg-neutral-surface rounded" />
              <div className="h-10 bg-primary-deep/20 rounded" />
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