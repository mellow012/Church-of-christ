// app/members/[id]/edit/page.tsx
// Server Component — fetches the member + member options, renders pre-filled MemberForm

import { notFound } from 'next/navigation';
import { getMemberById, getMemberOptions } from '@/lib/queries';
import { MemberForm } from '@/components/forms/MemberForm';
import { ArrowLeft, Pencil } from 'lucide-react';
import Link from 'next/link';
import { getFullName } from '@/lib/utils';
import type { Metadata } from 'next';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const member = await getMemberById(params.id);
  if (!member) return { title: 'Member Not Found' };
  return { title: `Edit — ${getFullName(member)}` };
}

export default async function EditMemberPage({ params }: Props) {
  // Fetch in parallel — member data + all members for HoH dropdown
  const [member, memberOptions] = await Promise.all([
    getMemberById(params.id),
    getMemberOptions(),
  ]);

  if (!member) notFound();

  const fullName = getFullName(member);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* ── Page header ───────────────────────────────────── */}
      <div>
        {/* Breadcrumb — links back to the member's detail page */}
        <Link
          href={`/members/${member.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-caption hover:text-gold transition-colors mb-4 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to {fullName}
        </Link>

        {/* Title block */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-deep/10 border border-primary-deep/20 flex items-center justify-center shrink-0">
            <Pencil className="w-4 h-4 text-primary-deep" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-heading leading-tight">
              Edit Member
            </h1>
            <p className="text-caption text-sm mt-0.5">{fullName}</p>
          </div>
        </div>
      </div>

      {/* Thin rule */}
      <div className="h-px bg-gradient-to-r from-primary-deep/20 via-neutral-surface to-transparent" />

      {/* ── Pre-filled form ───────────────────────────────── */}
      <MemberForm
        member={member}
        memberOptions={memberOptions}
        onCancel={() => {
          // onCancel is a client-side prop — the form handles router.back() by default
          // so this is handled inside MemberForm itself, no extra logic needed here
        }}
      />
    </div>
  );
}