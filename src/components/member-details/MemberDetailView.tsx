'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Church,
  Heart,
  Home,
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  BookOpen,
  Users,
  Briefcase,
  GraduationCap,
  Building2,
  Loader2,
} from 'lucide-react';
import { deleteMember } from '@/lib/queries';
import { cn, formatDate, formatPhones, getFullName, getInitials, calculateAge, getAgeGroupLabel } from '@/lib/utils';
import type { Member } from '@/types';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface MemberDetailViewProps {
  member: Member;
  /** The linked head-of-household member, if any */
  householdHead?: Member | null;
}

// ─────────────────────────────────────────────────────────────
// Small presentational pieces
// ─────────────────────────────────────────────────────────────

/** A row within a detail tab: label + value */
function DetailRow({
  label,
  value,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
  highlight?: boolean;
}) {
  if (!value || value === '—') {
    return (
      <div className="flex items-start gap-3 py-3 border-b border-neutral-surface/60 last:border-0">
        {Icon && <Icon className="w-4 h-4 text-caption/40 mt-0.5 shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-caption/70 font-medium uppercase tracking-wide mb-0.5">{label}</p>
          <p className="text-sm text-caption italic">Not recorded</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 py-3 border-b border-neutral-surface/60 last:border-0',
        highlight && 'bg-gold/5 -mx-4 px-4 rounded-lg border-0 mb-1'
      )}
    >
      {Icon && (
        <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', highlight ? 'text-gold' : 'text-caption')} />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-caption font-medium uppercase tracking-wide mb-0.5">{label}</p>
        <div className="text-sm text-heading font-medium break-words">{value}</div>
      </div>
    </div>
  );
}

/** Large avatar for the member header */
function MemberHeroAvatar({ member }: { member: Member }) {
  const initials = getInitials(member.first_name, member.last_name);
  const hue = (member.first_name.charCodeAt(0) + member.last_name.charCodeAt(0)) % 360;
  return (
    <div
      className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0"
      style={{ backgroundColor: `hsl(${hue}, 45%, 35%)` }}
    >
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab contents
// ─────────────────────────────────────────────────────────────

function PersonalTab({ member }: { member: Member }) {
  const age = member.dob_known ? calculateAge(member.dob) : null;
  const ageGroup = getAgeGroupLabel(age?.toString() ?? '' );

  return (
    <Card className="bg-primary-warm border-neutral-surface">
      <CardContent className="pt-6 divide-y-0">
        <DetailRow
          label="Full Name"
          value={getFullName(member)}
          icon={User}
          highlight
        />
        <DetailRow
          label="Date of Birth"
          value={
            member.dob_known && member.dob ? (
              <span>
                {formatDate(member.dob)}
                {age !== null && (
                  <span className="text-caption font-normal ml-2">
                    ({age} years old · {ageGroup})
                  </span>
                )}
              </span>
            ) : '—'
          }
          icon={Calendar}
        />
        <DetailRow
          label="Marital Status"
          value={member.marital_status ?? '—'}
          icon={Heart}
        />
        <DetailRow
          label="Employment Status"
          value={member.employment_status ?? '—'}
          icon={Briefcase}
        />
        <DetailRow
          label="Educational Qualifications"
          value={member.education ?? '—'}
          icon={GraduationCap}
        />
      </CardContent>
    </Card>
  );
}

function ContactTab({ member }: { member: Member }) {
  return (
    <Card className="bg-primary-warm border-neutral-surface">
      <CardContent className="pt-6">
        <DetailRow
          label="Phone Number(s)"
          value={
            member.phones && member.phones.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {member.phones.map((p, i) => (
                  <a
                    key={i}
                    href={`tel:${p}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-deep/10 text-primary-deep text-xs font-medium hover:bg-primary-deep/20 transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    {p}
                  </a>
                ))}
              </div>
            ) : '—'
          }
          icon={Phone}
        />
        <DetailRow
          label="Email Address"
          value={
            member.email ? (
              <a
                href={`mailto:${member.email}`}
                className="text-primary-deep hover:text-gold transition-colors underline-offset-2 hover:underline"
              >
                {member.email}
              </a>
            ) : '—'
          }
          icon={Mail}
        />
        <DetailRow
          label="Postal Address"
          value={member.postal_address ?? '—'}
          icon={Building2}
        />
        <DetailRow
          label="Physical Address"
          value={member.physical_address ?? '—'}
          icon={MapPin}
        />
      </CardContent>
    </Card>
  );
}

function MembershipTab({ member }: { member: Member }) {
  return (
    <Card className="bg-primary-warm border-neutral-surface">
      <CardContent className="pt-6">
        <DetailRow
          label="Baptism Date"
          value={
            member.baptism_known && member.baptism_date
              ? formatDate(member.baptism_date)
              : member.baptism_known
              ? 'Known but not recorded'
              : '—'
          }
          icon={BookOpen}
          highlight={member.baptism_known}
        />
        <DetailRow
          label="Date Joined Church of Christ at Redcross"
          value={
            member.joined_known && member.joined_date
              ? formatDate(member.joined_date)
              : '—'
          }
          icon={Calendar}
        />
        <DetailRow
          label="Last Congregation Before Redcross"
          value={member.last_congregation ?? '—'}
          icon={Church}
        />
        <DetailRow
          label="Home Cell"
          value={
            member.home_cell_known && member.home_cell ? (
              <Badge
                variant="outline"
                className="border-gold/40 text-primary-deep bg-gold/10 font-medium text-xs"
              >
                {member.home_cell}
              </Badge>
            ) : '—'
          }
          icon={Users}
        />
      </CardContent>
    </Card>
  );
}

function LocationTab({ member }: { member: Member }) {
  return (
    <Card className="bg-primary-warm border-neutral-surface">
      <CardContent className="pt-6">
        <DetailRow
          label="Home Village"
          value={member.home_village ?? '—'}
          icon={Home}
        />
        <DetailRow
          label="Traditional Authority"
          value={member.traditional_authority ?? '—'}
          icon={User}
        />
        <DetailRow
          label="Home District"
          value={
            member.home_district ? (
              <Badge
                variant="outline"
                className="border-primary-deep/30 text-primary-deep bg-primary-deep/5 font-medium text-xs"
              >
                <MapPin className="w-3 h-3 mr-1" />
                {member.home_district}
              </Badge>
            ) : '—'
          }
          icon={MapPin}
        />
      </CardContent>
    </Card>
  );
}

function FamilyTab({ member, householdHead }: { member: Member; householdHead?: Member | null }) {
  return (
    <div className="space-y-4">
      {/* Children */}
      <Card className="bg-primary-warm border-neutral-surface">
        <CardHeader className="pb-2 pt-5">
          <CardTitle className="text-sm font-semibold text-heading flex items-center gap-2">
            <Heart className="w-4 h-4 text-terracotta" />
            Children
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <DetailRow
            label="Own Children"
            value={
              member.own_children ? (
                <ul className="space-y-1 mt-1">
                  {member.own_children.split(/[,\n]/).map((name, i) => {
                    const n = name.trim();
                    if (!n) return null;
                    return (
                      <li key={i} className="text-sm text-heading">
                        {n}
                      </li>
                    );
                  })}
                </ul>
              ) : '—'
            }
          />
          <DetailRow
            label="Dependent Children"
            value={
              member.dependent_children ? (
                <ul className="space-y-1 mt-1">
                  {member.dependent_children.split(/[,\n]/).map((name, i) => {
                    const n = name.trim();
                    if (!n) return null;
                    return (
                      <li key={i} className="text-sm text-heading">
                        {n}
                      </li>
                    );
                  })}
                </ul>
              ) : '—'
            }
          />
        </CardContent>
      </Card>

      {/* Next of kin */}
      <Card className="bg-primary-warm border-neutral-surface">
        <CardHeader className="pb-2 pt-5">
          <CardTitle className="text-sm font-semibold text-heading flex items-center gap-2">
            <User className="w-4 h-4 text-caption" />
            Next of Kin
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <DetailRow label="Name" value={member.next_of_kin_name ?? '—'} />
          <DetailRow
            label="Phone Number(s)"
            value={
              member.next_of_kin_phones && member.next_of_kin_phones.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {member.next_of_kin_phones.map((p, i) => (
                    <a
                      key={i}
                      href={`tel:${p}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-deep/10 text-primary-deep text-xs font-medium hover:bg-primary-deep/20 transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      {p}
                    </a>
                  ))}
                </div>
              ) : '—'
            }
          />
        </CardContent>
      </Card>

      {/* Head of household */}
      <Card className="bg-primary-warm border-neutral-surface">
        <CardHeader className="pb-2 pt-5">
          <CardTitle className="text-sm font-semibold text-heading flex items-center gap-2">
            <Home className="w-4 h-4 text-caption" />
            Head of Household
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <DetailRow label="Name" value={member.head_of_household_name ?? '—'} />
          <DetailRow
            label="Phone"
            value={
              member.head_of_household_phone ? (
                <a
                  href={`tel:${member.head_of_household_phone}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-deep/10 text-primary-deep text-xs font-medium hover:bg-primary-deep/20 transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  {member.head_of_household_phone}
                </a>
              ) : '—'
            }
          />
          <DetailRow
            label="Church Member?"
            value={
              member.head_of_household_is_member ? (
                <span className="inline-flex items-center gap-1.5 text-forest-green font-medium text-sm">
                  <span className="w-2 h-2 rounded-full bg-forest-green" />
                  Yes — member of Church of Christ
                </span>
              ) : (
                <span className="text-caption text-sm">No</span>
              )
            }
          />
          {/* If linked to a member record */}
          {householdHead && (
            <div className="mt-3 p-3 rounded-lg bg-gold/8 border border-gold/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <MemberHeroAvatar member={householdHead} />
                <div>
                  <p className="text-xs text-caption font-medium uppercase tracking-wide">Linked profile</p>
                  <p className="font-semibold text-heading text-sm">{getFullName(householdHead)}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export function MemberDetailView({ member, householdHead }: MemberDetailViewProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const age = member.dob_known ? calculateAge(member.dob) : null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMember(member.id);
      router.push('/members');
      router.refresh();
    } catch (err) {
      console.error('Delete failed:', err);
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      {/* ── Back button ───────────────────────────────────── */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="text-caption hover:text-heading -ml-2 gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Members
      </Button>

      {/* ── Member hero card ──────────────────────────────── */}
      <div className="bg-primary-warm border border-neutral-surface rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

          <MemberHeroAvatar member={member} />

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-2xl md:text-3xl text-heading leading-tight">
              {getFullName(member)}
            </h1>

            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              {member.marital_status && (
                <Badge variant="outline" className="text-xs border-neutral-surface text-body">
                  {member.marital_status}
                </Badge>
              )}
              {age !== null && (
                <Badge variant="outline" className="text-xs border-neutral-surface text-body">
                  Age {age}
                </Badge>
              )}
              {member.home_cell_known && member.home_cell && (
                <Badge
                  variant="outline"
                  className="text-xs border-gold/40 text-primary-deep bg-gold/8"
                >
                  <Users className="w-3 h-3 mr-1" />
                  {member.home_cell}
                </Badge>
              )}
              {member.baptism_known && (
                <Badge className="text-xs bg-forest-green/15 text-forest-green border border-forest-green/30">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Baptised
                </Badge>
              )}
            </div>

            {/* Quick contact line */}
            {(member.phones?.length || member.email) && (
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-caption">
                {member.phones?.[0] && (
                  <a
                    href={`tel:${member.phones[0]}`}
                    className="flex items-center gap-1 hover:text-gold transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    {member.phones[0]}
                  </a>
                )}
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-1 hover:text-gold transition-colors"
                  >
                    <Mail className="w-3 h-3" />
                    {member.email}
                  </a>
                )}
                {member.home_district && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {member.home_district}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:flex-col sm:items-end shrink-0">
            <Button
              size="sm"
              onClick={() => router.push(`/members/${member.id}/edit`)}
              className="bg-gold hover:bg-amber text-primary-deep font-semibold gap-1.5 h-8"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="border-neutral-surface text-caption hover:text-terracotta hover:border-terracotta/40 gap-1.5 h-8"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </Button>
          </div>
        </div>

        {/* Meta footer */}
        <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-neutral-surface text-xs text-caption">
          <span>Added {formatDate(member.created_at)}</span>
          {member.joined_known && member.joined_date && (
            <span>Joined Redcross {formatDate(member.joined_date)}</span>
          )}
          {member.last_congregation && (
            <span>Previously at {member.last_congregation}</span>
          )}
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────── */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="bg-primary-warm border border-neutral-surface p-1 h-auto flex-wrap gap-1">
          {[
            { value: 'personal',   label: 'Personal',   icon: User   },
            { value: 'contact',    label: 'Contact',    icon: Phone  },
            { value: 'membership', label: 'Membership', icon: Church },
            { value: 'location',   label: 'Location',   icon: MapPin },
            { value: 'family',     label: 'Family',     icon: Heart  },
          ].map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-md transition-all',
                'data-[state=active]:bg-gold data-[state=active]:text-primary-deep data-[state=active]:shadow-sm',
                'text-caption hover:text-body'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="personal">
          <PersonalTab member={member} />
        </TabsContent>
        <TabsContent value="contact">
          <ContactTab member={member} />
        </TabsContent>
        <TabsContent value="membership">
          <MembershipTab member={member} />
        </TabsContent>
        <TabsContent value="location">
          <LocationTab member={member} />
        </TabsContent>
        <TabsContent value="family">
          <FamilyTab member={member} householdHead={householdHead} />
        </TabsContent>
      </Tabs>

      {/* ── Delete dialog ─────────────────────────────────── */}
      <Dialog open={showDeleteDialog} onOpenChange={(o) => !o && setShowDeleteDialog(false)}>
        <DialogContent className="bg-primary-warm border-neutral-surface sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-heading">Remove Member</DialogTitle>
            <DialogDescription className="text-body">
              Are you sure you want to permanently remove{' '}
              <strong>{getFullName(member)}</strong> from the directory? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-neutral-surface"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-terracotta hover:bg-red-600 text-white"
            >
              {isDeleting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Removing...</>
              ) : (
                'Yes, Remove'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}