'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Church, Users, LayoutDashboard, FileBarChart2, Menu, X, UserPlus, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/members',   label: 'Members',   icon: Users,           exact: false },
  { href: '/reports',   label: 'Reports',   icon: FileBarChart2,   exact: true },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/login');
      router.refresh();
    }
  }

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold/0 via-gold to-gold/0 z-50" />

      <header className={cn(
        'fixed top-0.5 left-0 right-0 z-40 transition-shadow duration-300',
        scrolled ? 'shadow-md shadow-black/10' : ''
      )}>
        <nav className="bg-primary-deep/97 backdrop-blur-sm border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">

              {/* Logo */}
              <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
                <div className="w-7 h-7 rounded-lg bg-gold/15 flex items-center justify-center group-hover:bg-gold/25 transition-colors">
                  <Church className="w-4 h-4 text-gold" />
                </div>
                <div className="leading-tight hidden sm:block">
                  <p className="text-[11px] font-bold text-white/90 uppercase tracking-widest leading-none">
                    Church of Christ
                  </p>
                  <p className="text-[9px] text-gold/70 uppercase tracking-widest leading-none mt-0.5">
                    at Redcross
                  </p>
                </div>
              </Link>

              {/* Desktop nav links */}
              <div className="hidden md:flex items-center gap-1">
                {NAV_LINKS.map(({ href, label, icon: Icon, exact }) => (
                  <Link key={href} href={href}
                    className={cn(
                      'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                      isActive(href, exact)
                        ? 'bg-gold/15 text-gold'
                        : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                    )}>
                    <Icon className="w-3.5 h-3.5" />{label}
                  </Link>
                ))}
              </div>

              {/* Desktop right */}
              <div className="hidden md:flex items-center gap-2">
                <Button asChild size="sm"
                  className="bg-gold hover:bg-amber text-primary-deep font-semibold text-xs h-8 gap-1.5">
                  <Link href="/members/new">
                    <UserPlus className="w-3.5 h-3.5" />Add Member
                  </Link>
                </Button>
                <Button variant="ghost" size="sm"
                  onClick={handleSignOut} disabled={signingOut}
                  className="text-white/40 hover:text-white/80 hover:bg-white/5 h-8 w-8 p-0"
                  title="Sign out">
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Mobile toggle */}
              <button className="md:hidden p-2 text-white/60 hover:text-white transition-colors"
                onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div className="h-[calc(0.5rem+3.5rem)]" />

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-[calc(0.5rem+3.5rem)] left-0 right-0 bg-primary-deep border-b border-white/10 shadow-xl px-4 py-4 space-y-1">
            {NAV_LINKS.map(({ href, label, icon: Icon, exact }, idx) => (
              <Link key={href} href={href}
                style={{ animationDelay: `${idx * 40}ms` }}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  'animate-in fade-in slide-in-from-top-2',
                  isActive(href, exact)
                    ? 'bg-gold/15 text-gold'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                )}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-white/10 space-y-2">
              <Button asChild className="w-full bg-gold hover:bg-amber text-primary-deep font-semibold gap-2">
                <Link href="/members/new"><UserPlus className="w-4 h-4" />Add Member</Link>
              </Button>
              <Button variant="ghost" onClick={handleSignOut} disabled={signingOut}
                className="w-full text-white/50 hover:text-white hover:bg-white/5 gap-2">
                <LogOut className="w-4 h-4" />Sign out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}