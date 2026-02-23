'use client';

import { useRouter } from 'next/navigation';
import { getFullName, getInitials, calculateAge, formatDate } from '@/lib/utils';
import { ArrowRight, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Member, MaritalStatus } from '@/types';

function MemberAvatar({ member }: { member: Member }) {
  const initials = getInitials(member.first_name, member.last_name);
  const hue = (member.first_name.charCodeAt(0) + member.last_name.charCodeAt(0)) % 360;
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 select-none"
      style={{ backgroundColor: `hsl(${hue}, 42%, 34%)` }}
    >
      {initials}
    </div>
  );
}

function maritalColor(s: MaritalStatus | null) {
  switch (s) {
    case 'Married':   return 'bg-forest-green/10 text-forest-green border-forest-green/20';
    case 'Single':    return 'bg-primary-deep/10 text-primary-deep border-primary-deep/20';
    case 'Widowed':   return 'bg-neutral-surface text-caption border-neutral-surface';
    case 'Divorced':  return 'bg-amber/15 text-amber border-amber/25';
    case 'Separated': return 'bg-terracotta/10 text-terracotta border-terracotta/20';
    default:          return 'bg-neutral-surface text-caption border-neutral-surface';
  }
}

export function RecentMembersTable({ members }: { members: Member[] }) {
  const router = useRouter();

  return (
    <div className="bg-primary-warm border border-neutral-surface rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-surface/60">
        <div>
          <h3 className="font-serif text-lg text-heading leading-tight">Recently Added</h3>
          <p className="text-xs text-caption mt-0.5">Last 5 members added to the directory</p>
        </div>
        <Button variant="ghost" size="sm"
          onClick={() => router.push('/members')}
          className="text-xs text-gold hover:text-amber hover:bg-gold/8 gap-1 h-7 px-2">
          View all <ArrowRight className="w-3 h-3" />
        </Button>
      </div>

      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <div className="w-11 h-11 rounded-full bg-neutral-surface flex items-center justify-center">
            <Users className="w-5 h-5 text-caption" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-heading">No members yet</p>
            <p className="text-xs text-caption mt-0.5">Add your first member to get started</p>
          </div>
          <Button size="sm" onClick={() => router.push('/members/new')}
            className="bg-gold hover:bg-amber text-primary-deep text-xs mt-1">
            <Plus className="w-3.5 h-3.5 mr-1" />Add Member
          </Button>
        </div>
      ) : (
        <>
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-2 bg-background border-b border-neutral-surface/40">
            <span className="text-[10px] font-semibold text-caption uppercase tracking-wider">Name</span>
            <span className="text-[10px] font-semibold text-caption uppercase tracking-wider">Status</span>
            <span className="text-[10px] font-semibold text-caption uppercase tracking-wider">Home Cell</span>
            <span className="text-[10px] font-semibold text-caption uppercase tracking-wider text-right">Added</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-neutral-surface/40">
            {members.map((member) => {
              const age = member.dob_known ? calculateAge(member.dob) : null;
              return (
                <button
                  key={member.id}
                  onClick={() => router.push(`/members/${member.id}`)}
                  className="w-full grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-3.5 items-center
                             hover:bg-gold/5 transition-colors duration-100 group text-left"
                >
                  {/* Name + age */}
                  <div className="flex items-center gap-3 min-w-0">
                    <MemberAvatar member={member} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-heading truncate group-hover:text-primary-deep transition-colors">
                        {getFullName(member)}
                      </p>
                      {age !== null && (
                        <p className="text-xs text-caption">Age {age}</p>
                      )}
                    </div>
                  </div>

                  {/* Marital status */}
                  <div>
                    {member.marital_status ? (
                      <Badge variant="outline"
                        className={cn('text-[10px] px-1.5 h-5 font-medium', maritalColor(member.marital_status))}>
                        {member.marital_status}
                      </Badge>
                    ) : (
                      <span className="text-xs text-caption">—</span>
                    )}
                  </div>

                  {/* Home cell */}
                  <div className="min-w-0">
                    {member.home_cell_known && member.home_cell ? (
                      <span className="text-xs text-body truncate block">{member.home_cell}</span>
                    ) : (
                      <span className="text-xs text-caption">—</span>
                    )}
                  </div>

                  {/* Date added */}
                  <div className="text-right">
                    <span className="text-xs text-caption">{formatDate(member.created_at)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-neutral-surface/60">
            <Button onClick={() => router.push('/members/new')}
              variant="outline"
              className="w-full bg-transparent border-gold/20 hover:border-gold/40 hover:bg-gold/5 text-gold text-xs h-8 gap-1.5">
              <Plus className="w-3.5 h-3.5" />Add New Member
            </Button>
          </div>
        </>
      )}
    </div>
  );
}