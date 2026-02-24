// app/reports/page.tsx
// Server Component — fetches stats + filter options, renders the reports client

import { getDashboardStats, getDistinctHomeCells, getDistinctDistricts } from '@/lib/queries';
import { ReportsClient } from '@/components/reports/ReportClient';
import { FileBarChart2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reports',
};

export const revalidate = 300;

export default async function ReportsPage() {
  const [stats, homeCells, districts] = await Promise.all([
    getDashboardStats(),
    getDistinctHomeCells(),
    getDistinctDistricts(),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* ── Page header ───────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-deep/10 border border-primary-deep/20 flex items-center justify-center shrink-0">
          <FileBarChart2 className="w-5 h-5 text-primary-deep" />
        </div>
        <div>
          <h1 className="font-serif text-2xl text-heading leading-tight">Reports</h1>
          <p className="text-caption text-sm mt-0.5">
            Summary statistics and data exports for Church of Christ at Redcross
          </p>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-primary-deep/20 via-neutral-surface to-transparent" />

      {/* ── Reports content ───────────────────────────────── */}
      <ReportsClient
        stats={stats}
        homeCells={homeCells}
        districts={districts}
      />
    </div>
  );
}