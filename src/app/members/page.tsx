// app/members/page.tsx

import { Suspense } from 'react';
import { getAllMembers, getDistinctHomeCells, getDistinctDistricts } from '@/lib/queries';
import { MembersTable } from '@/components/tables/MembersTable';
import { Users, Church, Heart, Home } from 'lucide-react';
import type { Metadata } from 'next';
import type { Member } from '@/types';

export const metadata: Metadata = {
  title: 'Members',
};

export const revalidate = 60;

// ─── Stat card ────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-surface bg-primary-warm px-5 py-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-caption font-medium uppercase tracking-wide truncate">{label}</p>
        <p className="text-2xl font-serif text-heading leading-tight">{value}</p>
        {sub && <p className="text-xs text-caption mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Stats derived from member list ──────────────────────────

function MemberStats({ members }: { members: Member[] }) {
  const total      = members.length;
  const baptised   = members.filter((m) => m.baptism_known).length;
  const married    = members.filter((m) => m.marital_status === 'Married').length;
  const inHomeCell = members.filter((m) => m.home_cell_known).length;

  const pct = (n: number) =>
    total > 0 ? `${Math.round((n / total) * 100)}% of members` : '—';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        icon={Users}
        label="Total Members"
        value={total}
        color="bg-primary-deep/10 text-primary-deep"
      />
      <StatCard
        icon={Church}
        label="Baptised"
        value={baptised}
        sub={pct(baptised)}
        color="bg-gold/15 text-gold"
      />
      <StatCard
        icon={Heart}
        label="Married"
        value={married}
        sub={pct(married)}
        color="bg-terracotta/10 text-terracotta"
      />
      <StatCard
        icon={Home}
        label="In Home Cell"
        value={inHomeCell}
        sub={pct(inHomeCell)}
        color="bg-forest-green/10 text-forest-green"
      />
    </div>
  );
}

// ─── Content (fetches data) ───────────────────────────────────

async function MembersContent() {
  const [members, homeCells, districts] = await Promise.all([
    getAllMembers(),
    getDistinctHomeCells(),
    getDistinctDistricts(),
  ]);

  return (
    <>
      <MemberStats members={members} />
      <MembersTable
        initialMembers={members}
        homeCells={homeCells}
        districts={districts}
      />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default function MembersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-heading">Members Directory</h1>
        <p className="text-caption text-sm mt-1">
          Church of Christ at Redcross — member records
        </p>
      </div>

      <div className="h-px bg-gradient-to-r from-gold/40 via-gold/20 to-transparent" />

      <Suspense fallback={<PageSkeleton />}>
        <MembersContent />
      </Suspense>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-neutral-surface bg-primary-warm px-5 py-4 h-20" />
        ))}
      </div>
      {/* Table */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="h-9 bg-neutral-surface rounded-lg flex-1 max-w-sm" />
          <div className="h-9 bg-neutral-surface rounded-lg w-24" />
          <div className="h-9 bg-neutral-surface rounded-lg w-24" />
        </div>
        <div className="rounded-xl border border-neutral-surface overflow-hidden">
          <div className="h-10 bg-background border-b border-neutral-surface" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 border-b border-neutral-surface/50 flex items-center px-4 gap-4">
              <div className="w-8 h-8 rounded-full bg-neutral-surface" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-neutral-surface rounded w-40" />
                <div className="h-2.5 bg-neutral-surface/60 rounded w-24" />
              </div>
              <div className="h-3 bg-neutral-surface rounded w-32 hidden md:block" />
              <div className="h-5 bg-neutral-surface rounded-full w-16 hidden sm:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}