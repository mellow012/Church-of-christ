// app/members/new/page.tsx
// Server Component — renders the Add Member form
// Fetches member options for the HoH dropdown before rendering

import { getMemberOptions } from '@/lib/queries';
import { MemberForm } from '@/components/forms/MemberForm';
import { ArrowLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Member',
};

export default async function NewMemberPage() {
  // Load member list for the head-of-household linked selector
  const memberOptions = await getMemberOptions();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* ── Page header ───────────────────────────────────── */}
      <div>
        {/* Breadcrumb */}
        <Link
          href="/members"
          className="inline-flex items-center gap-1.5 text-sm text-caption hover:text-gold transition-colors mb-4 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Members
        </Link>

        {/* Title block */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/25 flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-heading leading-tight">Add New Member</h1>
            <p className="text-caption text-sm mt-0.5">
              Church of Christ at Redcross — Directory Compilation
            </p>
          </div>
        </div>
      </div>

      {/* Thin gold rule */}
      <div className="h-px bg-gradient-to-r from-gold/40 via-gold/20 to-transparent" />

      {/* ── Form ──────────────────────────────────────────── */}
      <MemberForm memberOptions={memberOptions} />
    </div>
  );
}