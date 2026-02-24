// app/dashboard/page.tsx

import { Suspense } from 'react';
import { getDashboardStats } from '@/lib/queries';
import { StatsCards } from '@/components/dashboard/StatsCard';
import { RecentMembersTable } from '@/components/dashboard/RecentMembers';
import { HomeCellDistribution } from '@/components/dashboard/HomeCellDistribution';
import { Church, UserPlus, Users, FileBarChart2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };
export const revalidate = 300;

async function DashboardContent() {
  const stats = await getDashboardStats();
  return (
    <div className="space-y-4">
      <StatsCards stats={stats} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <RecentMembersTable members={stats.recent_members} />
        </div>
        <div className="xl:col-span-1">
          <HomeCellDistribution data={stats.by_home_cell} total={stats.home_cell_members} />
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-primary-warm border border-neutral-surface rounded-2xl p-5 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-neutral-surface" />
            <div className="h-7 bg-neutral-surface rounded w-14" />
            <div className="h-3 bg-neutral-surface rounded w-24" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-primary-warm border border-neutral-surface rounded-2xl h-72" />
        <div className="xl:col-span-1 bg-primary-warm border border-neutral-surface rounded-2xl h-72" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-primary-deep flex items-center justify-center shadow-sm shrink-0">
            <Church className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h1 className="font-serif text-xl md:text-2xl text-heading leading-tight">
              Church of Christ at Redcross
            </h1>
            <p className="text-caption text-xs mt-0.5">{today}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" asChild className="border-neutral-surface text-body hover:border-gold/40 text-xs h-8 gap-1.5">
            <Link href="/reports"><FileBarChart2 className="w-3.5 h-3.5" />Reports</Link>
          </Button>
          <Button variant="outline" asChild className="border-neutral-surface text-body hover:border-gold/40 text-xs h-8 gap-1.5">
            <Link href="/members"><Users className="w-3.5 h-3.5" />Members</Link>
          </Button>
          <Button asChild className="bg-gold hover:bg-amber text-primary-deep font-semibold text-xs h-8 gap-1.5">
            <Link href="/members/new"><UserPlus className="w-3.5 h-3.5" />Add Member</Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}