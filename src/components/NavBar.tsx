'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Users, LayoutDashboard, FileBarChart2, Menu, X, UserPlus, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/members',   label: 'Members',   icon: Users,           exact: false },
  { href: '/reports',   label: 'Reports',   icon: FileBarChart2,   exact: true },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      // ── HARD navigation — same reason as login ─────────────────────────
      // router.push('/login') is client-side: the page renders before the
      // browser commits the cookie-clearing Set-Cookie headers, so the
      // middleware still sees the old cookies and lets the user stay in.
      // window.location.href forces a full browser request so the cookies
      // are cleared before the middleware runs on the next page load.
      // ───────────────────────────────────────────────────────────────────
      window.location.href = '/login';
    }
  }

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <>
      {/* Top gold accent line */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold/0 via-gold to-gold/0 z-50" />

      <header className={cn(
        'fixed top-0.5 left-0 right-0 z-40 transition-shadow duration-300',
        scrolled ? 'shadow-lg shadow-black/15' : ''
      )}>
        <nav className="bg-primary-deep backdrop-blur-sm border-b border-gold/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">

              {/* ── Logo ──────────────────────────────────────── */}
              <Link href="/dashboard" className="flex items-center gap-3 shrink-0 group">
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gold/40 group-hover:ring-gold/70 transition-all duration-200 shrink-0 bg-white">
                  <Image
                    src="/coc-logo.jpg"
                    alt="Church of Christ at Redcross"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
                <div className="leading-tight hidden sm:block">
                  <p className="text-[12px] font-bold text-gold uppercase tracking-widest leading-none">
                    Church of Christ
                  </p>
                  <p className="text-[10px] text-gold/60 uppercase tracking-widest leading-none mt-0.5">
                    at Redcross
                  </p>
                </div>
              </Link>

              {/* ── Desktop nav links ─────────────────────────── */}
              <div className="hidden md:flex items-center gap-1">
                {NAV_LINKS.map(({ href, label, icon: Icon, exact }) => (
                  <Link key={href} href={href}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150',
                      isActive(href, exact)
                        ? 'bg-gold/20 text-gold border border-gold/30'
                        : 'text-white/60 hover:text-gold/80 hover:bg-gold/10'
                    )}>
                    <Icon className="w-3.5 h-3.5" />{label}
                  </Link>
                ))}
              </div>

              {/* ── Desktop right ─────────────────────────────── */}
              <div className="hidden md:flex items-center gap-2">
                <Button asChild size="sm"
                  className="bg-gold hover:bg-amber text-primary-deep font-bold text-xs h-8 gap-1.5 shadow-md shadow-gold/20">
                  <Link href="/members/new">
                    <UserPlus className="w-3.5 h-3.5" />Add Member
                  </Link>
                </Button>
                <Button variant="ghost" size="sm"
                  onClick={handleSignOut} disabled={signingOut}
                  className="text-white/40 hover:text-gold/80 hover:bg-gold/10 h-8 w-8 p-0"
                  title="Sign out">
                  {signingOut
                    ? <span className="w-3.5 h-3.5 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
                    : <LogOut className="w-3.5 h-3.5" />
                  }
                </Button>
              </div>

              {/* ── Mobile toggle ─────────────────────────────── */}
              <button
                className="md:hidden p-2 text-white/60 hover:text-gold transition-colors"
                onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Spacer */}
      <div className="h-[calc(0.5rem+4rem)]" />

      {/* ── Mobile drawer ─────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-[calc(0.5rem+4rem)] left-0 right-0 bg-primary-deep border-b border-gold/20 shadow-xl px-4 py-4 space-y-1">
            <div className="flex items-center gap-3 px-4 py-3 mb-2 border-b border-gold/15">
              <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-gold/40">
                <Image src="/coc-logo.jpg" alt="COC Redcross" width={36} height={36} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-xs font-bold text-gold">Church of Christ</p>
                <p className="text-[10px] text-gold/50">at Redcross</p>
              </div>
            </div>

            {NAV_LINKS.map(({ href, label, icon: Icon, exact }, idx) => (
              <Link key={href} href={href}
                style={{ animationDelay: `${idx * 40}ms` }}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
                  'animate-in fade-in slide-in-from-top-2',
                  isActive(href, exact)
                    ? 'bg-gold/20 text-gold border border-gold/25'
                    : 'text-white/70 hover:text-gold/80 hover:bg-gold/10'
                )}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            ))}

            <div className="pt-3 mt-3 border-t border-gold/15 space-y-2">
              <Button asChild className="w-full bg-gold hover:bg-amber text-primary-deep font-bold gap-2">
                <Link href="/members/new"><UserPlus className="w-4 h-4" />Add Member</Link>
              </Button>
              <Button variant="ghost" onClick={handleSignOut} disabled={signingOut}
                className="w-full text-white/50 hover:text-gold/80 hover:bg-gold/10 gap-2">
                <LogOut className="w-4 h-4" />
                {signingOut ? 'Signing out...' : 'Sign out'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}