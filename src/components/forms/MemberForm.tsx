'use client';

import { useForm,type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MemberFormSchema,
  defaultMemberFormValues,
  formValuesToInsert,
  type MemberFormValues,
} from '@/lib/validations';
import { createMember, updateMember } from '@/lib/queries';
import { cn } from '@/lib/utils';
import type { Member, MemberOption } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  User, Phone, Mail, MapPin, Church, Heart, Home,
  ChevronRight, ChevronLeft, Loader2, Check, AlertCircle,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface MemberFormProps {
  member?: Member | null;
  memberOptions?: MemberOption[];
  onSuccess?: (member: Member) => void;
  onCancel?: () => void;
}

// ─────────────────────────────────────────────────────────────
// Sections
// ─────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'personal',  label: 'Personal',  icon: User,   short: '1' },
  { id: 'contact',   label: 'Contact',   icon: Phone,  short: '2' },
  { id: 'faith',     label: 'Faith',     icon: Church, short: '3' },
  { id: 'family',    label: 'Family',    icon: Heart,  short: '4' },
  { id: 'location',  label: 'Location',  icon: MapPin, short: '5' },
  { id: 'household', label: 'Household', icon: Home,   short: '6' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

const LAST_SECTION_ID: SectionId = 'household';

// ─────────────────────────────────────────────────────────────
// Member → form values
// ─────────────────────────────────────────────────────────────

function memberToFormValues(member: Member): MemberFormValues {
  return {
    first_name:  member.first_name  ?? '',
    last_name:   member.last_name   ?? '',
    middle_name: member.middle_name ?? '',
    postal_address:   member.postal_address   ?? '',
    physical_address: member.physical_address ?? '',
    email:            member.email            ?? '',
    phones_input:             member.phones            ?? [],
    next_of_kin_phones_input: member.next_of_kin_phones ?? [],
    dob_known:               !!member.dob_known,
    baptism_known:           !!member.baptism_known,
    home_cell_known:         !!member.home_cell_known,
    joined_known:            !!member.joined_known,
    head_of_household_is_member: !!member.head_of_household_is_member,
    dob:          member.dob          ?? null,
    baptism_date: member.baptism_date ?? null,
    joined_date:  member.joined_date  ?? null,
    marital_status:    member.marital_status    ?? null,
    employment_status: member.employment_status ?? null,
    education:         member.education         ?? '',
    home_cell:         member.home_cell         ?? '',
    last_congregation: member.last_congregation ?? '',
    own_children:       member.own_children       ?? '',
    dependent_children: member.dependent_children ?? '',
    home_village:          member.home_village          ?? '',
    traditional_authority: member.traditional_authority ?? '',
    home_district:         member.home_district         ?? '',
    next_of_kin_name:            member.next_of_kin_name        ?? '',
    head_of_household_name:      member.head_of_household_name  ?? '',
    head_of_household_phone:     member.head_of_household_phone ?? '',
    head_of_household_id:        member.head_of_household_id    ?? null,
  };
}

// ─────────────────────────────────────────────────────────────
// Step indicator
// ─────────────────────────────────────────────────────────────

function StepIndicator({
  currentSection, onStepClick, completedSections,
}: {
  currentSection: SectionId;
  onStepClick: (id: SectionId) => void;
  completedSections: Set<SectionId>;
}) {
  return (
    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1">
      {SECTIONS.map((section, idx) => {
        const Icon     = section.icon;
        const isActive = section.id === currentSection;
        const isDone   = completedSections.has(section.id);
        const isLast   = idx === SECTIONS.length - 1;
        return (
          <div key={section.id} className="flex items-center shrink-0">
            <button type="button" onClick={() => onStepClick(section.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                isActive  ? 'bg-gold text-primary-deep shadow-md shadow-gold/30 scale-105'
                : isDone  ? 'bg-forest-green/20 text-forest-green hover:bg-forest-green/30'
                          : 'bg-neutral-surface text-caption hover:bg-neutral-surface/70 hover:text-body'
              )}>
              {isDone && !isActive ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{section.label}</span>
              <span className="sm:hidden">{section.short}</span>
            </button>
            {!isLast && <ChevronRight className="w-4 h-4 text-neutral-surface mx-0.5 shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section card
// ─────────────────────────────────────────────────────────────

function SectionCard({ title, subtitle, icon: Icon, children }: {
  title: string; subtitle: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <Card className="bg-primary-warm border-neutral-surface shadow-sm">
      <CardContent className="pt-6 pb-8 px-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-surface">
          <div className="w-9 h-9 rounded-lg bg-primary-deep/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary-deep" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-heading leading-tight">{title}</h3>
            <p className="text-xs text-caption mt-0.5">{subtitle}</p>
          </div>
        </div>
        <div className="space-y-5">{children}</div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// Known toggle
// ─────────────────────────────────────────────────────────────

function KnownToggle({ label, value, onChange, children }: {
  label: string; value: boolean; onChange: (v: boolean) => void; children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-background border border-neutral-surface">
        <span className="text-sm text-body font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className={cn('text-xs', value ? 'text-forest-green font-medium' : 'text-caption')}>
            {value ? 'Yes' : 'No'}
          </span>
          <Switch checked={value} onCheckedChange={onChange} />
        </div>
      </div>
      {value && (
        <div className="pl-3 border-l-2 border-gold/50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Phone input
// ─────────────────────────────────────────────────────────────

function PhoneInput({ value, onChange, placeholder = 'e.g. +265 999 123 456, +265 888 789 012' }: {
  value: string[] | undefined; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [inputVal, setInputVal] = useState(
    Array.isArray(value) && value.length > 0 ? value.join(', ') : ''
  );
  useEffect(() => {
    setInputVal(Array.isArray(value) ? value.join(', ') : '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(value)]);
  return (
    <div className="space-y-2">
      <Input
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onBlur={() => onChange(inputVal.split(',').map((p) => p.trim()).filter(Boolean))}
        placeholder={placeholder}
        className="bg-background border-neutral-surface focus:border-gold focus:ring-gold/20"
      />
      {Array.isArray(value) && value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((phone, i) => (
            <Badge key={i} variant="outline" className="text-xs border-primary-deep/30 text-primary-deep bg-primary-deep/5">
              <Phone className="w-3 h-3 mr-1" />{phone}
            </Badge>
          ))}
        </div>
      )}
      <p className="text-xs text-caption">Separate multiple numbers with a comma</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Field row
// ─────────────────────────────────────────────────────────────

function FieldRow({ label, required, children, hint }: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-heading">
        {label}{required && <span className="text-terracotta ml-1">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-caption">{hint}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export function MemberForm({ member, memberOptions = [], onSuccess, onCancel }: MemberFormProps) {
  const router    = useRouter();
  const isEditing = !!member;

  const [currentSection,    setCurrentSection]    = useState<SectionId>('personal');
  const [completedSections, setCompletedSections] = useState<Set<SectionId>>(new Set());
  const [isSaving,  setIsSaving]  = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validatedSections, setValidatedSections] = useState<Set<SectionId>>(new Set());

  const sectionIndex   = SECTIONS.findIndex((s) => s.id === currentSection);
  const isLastSection  = currentSection === LAST_SECTION_ID;
  const isFirstSection = sectionIndex === 0;

  const form = useForm<MemberFormValues, any, MemberFormValues>({
    resolver: zodResolver(MemberFormSchema) as Resolver<MemberFormValues, any, MemberFormValues>,
    defaultValues: member ? memberToFormValues(member) : defaultMemberFormValues,
    mode: 'onBlur',
    shouldUnregister: false,
  });

  const { watch, setValue, trigger, formState: { errors } } = form;

  const dobKnown      = watch('dob_known');
  const baptismKnown  = watch('baptism_known');
  const homeCellKnown = watch('home_cell_known');
  const joinedKnown   = watch('joined_known');
  const hohIsMember   = watch('head_of_household_is_member');

  const SECTION_FIELDS: Record<SectionId, (keyof MemberFormValues)[]> = {
    personal:  ['first_name', 'middle_name', 'last_name', 'dob_known', 'dob', 'employment_status', 'education'],
    contact:   ['phones_input', 'email', 'postal_address', 'physical_address'],
    faith:     ['baptism_known', 'baptism_date', 'last_congregation', 'joined_known', 'joined_date', 'home_cell_known', 'home_cell'],
    family:    ['marital_status', 'own_children', 'dependent_children', 'next_of_kin_name', 'next_of_kin_phones_input'],
    location:  ['home_village', 'traditional_authority', 'home_district'],
    household: ['head_of_household_name', 'head_of_household_phone', 'head_of_household_is_member', 'head_of_household_id'],
  };

  const FIELD_SECTION_MAP = Object.fromEntries(
    (Object.entries(SECTION_FIELDS) as [SectionId, (keyof MemberFormValues)[]][]).flatMap(
      ([section, fields]) => fields.map((f) => [f, section])
    )
  ) as Partial<Record<keyof MemberFormValues, SectionId>>;

  const currentSectionWasValidated = validatedSections.has(currentSection);
  const currentSectionHasErrors =
    currentSectionWasValidated &&
    SECTION_FIELDS[currentSection].some((field) => !!errors[field]);

  // ── Navigation ─────────────────────────────────────────────

  function goToSection(id: SectionId) {
    setCompletedSections((prev) => new Set(prev).add(currentSection));
    setCurrentSection(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const goNext = async () => {
    if (isLastSection) return;
    setValidatedSections((prev) => new Set(prev).add(currentSection));
    const isValid = await trigger(SECTION_FIELDS[currentSection]);
    if (isValid) goToSection(SECTIONS[sectionIndex + 1].id);
  };

  function goPrev() {
    if (sectionIndex > 0) goToSection(SECTIONS[sectionIndex - 1].id);
  }

  // ── Final submit — only called when on household section ───
  // FIX: The <form> element has NO onSubmit handler at all.
  // The save button calls this function directly via onClick.
  // This completely eliminates any possibility of the form
  // submitting early due to HTML form submission behaviour.
  const handleSave = form.handleSubmit(
    async (values: MemberFormValues) => {
      setIsSaving(true);
      setSaveError(null);
      try {
        const payload = formValuesToInsert(values);
        const saved   = isEditing && member
          ? await updateMember(member.id, payload)
          : await createMember(payload);
        if (onSuccess) onSuccess(saved);
        else router.push(`/members/${saved.id}`);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      } finally {
        setIsSaving(false);
      }
    },
    // onInvalid — jumps to the first section that has an error
    (fieldErrors) => {
      const sectionOrder = SECTIONS.map((s) => s.id);
      const errorFields  = Object.keys(fieldErrors) as (keyof MemberFormValues)[];
      const firstErrorSection = sectionOrder.find((sId) =>
        errorFields.some((f) => FIELD_SECTION_MAP[f] === sId)
      );
      setValidatedSections((prev) => {
        const next = new Set(prev);
        errorFields.forEach((f) => { const s = FIELD_SECTION_MAP[f]; if (s) next.add(s); });
        return next;
      });
      if (firstErrorSection) {
        setCurrentSection(firstErrorSection);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setSaveError(
        firstErrorSection
          ? `Please complete the required fields in the "${SECTIONS.find((s) => s.id === firstErrorSection)?.label}" section.`
          : 'Please fill in all required fields before saving.'
      );
    }
  );

  // ─────────────────────────────────────────────────────────
  // Render
  // All sections are always mounted in the DOM — inactive ones
  // are hidden with CSS. This keeps all fields registered with
  // RHF so their values are never lost when navigating.
  // ─────────────────────────────────────────────────────────

  return (
    <Form {...form}>
      {/* Using a div instead of form element — this completely eliminates
          native HTML form submission. shadcn SelectTrigger and other
          compound components render <button> internally without type="button",
          which would default to type="submit" inside a <form> and fire
          submission when the user interacts with dropdowns. */}
      <div className="space-y-6">

        <StepIndicator
          currentSection={currentSection}
          onStepClick={goToSection}
          completedSections={completedSections}
        />

        <div className="w-full h-1.5 bg-neutral-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-500"
            style={{ width: `${((sectionIndex + 1) / SECTIONS.length) * 100}%` }}
          />
        </div>

        {/* ── Personal ── */}
        <div className={currentSection === 'personal' ? undefined : 'hidden'}>
          <SectionCard title="Personal Information" subtitle="Full legal name as used in official records" icon={User}>
            <FormField control={form.control} name="first_name" render={({ field }) => (
              <FormItem><FieldRow label="First Name" required>
                <FormControl><Input {...field} value={field.value ?? ''} placeholder="Enter first name"
                  className="bg-background border-neutral-surface focus:border-gold" /></FormControl>
                <FormMessage />
              </FieldRow></FormItem>
            )} />
            <FormField control={form.control} name="middle_name" render={({ field }) => (
              <FormItem><FieldRow label="Middle Name">
                <FormControl><Input {...field} value={field.value ?? ''} placeholder="Enter middle name (optional)"
                  className="bg-background border-neutral-surface focus:border-gold" /></FormControl>
                <FormMessage />
              </FieldRow></FormItem>
            )} />
            <FormField control={form.control} name="last_name" render={({ field }) => (
              <FormItem><FieldRow label="Last Name" required>
                <FormControl><Input {...field} value={field.value ?? ''} placeholder="Enter last name"
                  className="bg-background border-neutral-surface focus:border-gold" /></FormControl>
                <FormMessage />
              </FieldRow></FormItem>
            )} />
            <KnownToggle label="Is the date of birth known?" value={dobKnown}
              onChange={(v) => { setValue('dob_known', v); if (!v) setValue('dob', null); }}>
              <FormField control={form.control} name="dob" render={({ field }) => (
                <FormItem><FieldRow label="Date of Birth" required>
                  <FormControl><Input {...field} value={field.value ?? ''} type="date"
                    className="bg-background border-neutral-surface focus:border-gold" /></FormControl>
                  <FormMessage />
                </FieldRow></FormItem>
              )} />
            </KnownToggle>
            <FormField control={form.control} name="employment_status" render={({ field }) => (
              <FormItem><FieldRow label="Employment Status">
                <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || null)}>
                  <FormControl><SelectTrigger className="bg-background border-neutral-surface focus:ring-gold/20">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Employed">Employed</SelectItem>
                    <SelectItem value="Self-employed">Self-employed</SelectItem>
                    <SelectItem value="Retired">Retired</SelectItem>
                    <SelectItem value="Unemployed">Unemployed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FieldRow></FormItem>
            )} />
            <FormField control={form.control} name="education" render={({ field }) => (
              <FormItem><FieldRow label="Educational Qualifications" hint="e.g. MSCE, Bachelor of Arts, etc.">
                <FormControl><Input {...field} value={field.value ?? ''} placeholder="Enter highest qualification"
                  className="bg-background border-neutral-surface focus:border-gold" /></FormControl>
                <FormMessage />
              </FieldRow></FormItem>
            )} />
          </SectionCard>
        </div>

        {/* ── Contact ── */}
        <div className={currentSection === 'contact' ? undefined : 'hidden'}>
          <SectionCard title="Contact Details" subtitle="How can this member be reached?" icon={Phone}>
            <FormField control={form.control} name="phones_input" render={({ field }) => (
              <FormItem><FieldRow label="Working Phone Number(s)">
                <PhoneInput value={field.value as string[]} onChange={field.onChange} />
                <FormMessage />
              </FieldRow></FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FieldRow label="Email Address">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-caption" />
                  <FormControl><Input {...field} value={field.value ?? ''} type="email" placeholder="member@email.com"
                    className="pl-10 bg-background border-neutral-surface focus:border-gold" /></FormControl>
                </div>
                <FormMessage />
              </FieldRow></FormItem>
            )} />
            <FormField control={form.control} name="postal_address" render={({ field }) => (
              <FormItem><FieldRow label="Postal Address" hint="P.O. Box or bag number">
                <FormControl><Input {...field} value={field.value ?? ''} placeholder="e.g. P.O. Box 123, Blantyre"
                  className="bg-background border-neutral-surface focus:border-gold" /></FormControl>
                <FormMessage />
              </FieldRow></FormItem>
            )} />
            <FormField control={form.control} name="physical_address" render={({ field }) => (
              <FormItem><FieldRow label="Physical Address" hint="Description of current place of residence">
                <FormControl><Textarea {...field} value={field.value ?? ''} placeholder="e.g. Area 25, Plot 47..."
                  rows={3} className="bg-background border-neutral-surface focus:border-gold resize-none" /></FormControl>
                <FormMessage />
              </FieldRow></FormItem>
            )} />
          </SectionCard>
        </div>

        {/* ── Faith ── */}
        <div className={currentSection === 'faith' ? undefined : 'hidden'}>
          <SectionCard title="Faith & Membership" subtitle="Baptism records and church membership history" icon={Church}>
            <KnownToggle label="Is the date/year of baptism known?" value={baptismKnown}
              onChange={(v) => { setValue('baptism_known', v); if (!v) setValue('baptism_date', null); }}>
              <FormField control={form.control} name="baptism_date" render={({ field }) => (
                <FormItem><FieldRow label="Date / Year of Baptism" required hint="If only the year is known, enter Jan 1 of that year">
                  <FormControl><Input {...field} value={field.value ?? ''} type="date"
                    className="bg-background border-neutral-surface focus:border-gold" /></FormControl>
                  <FormMessage />
                </FieldRow></FormItem>
              )} />
            </KnownToggle>
            <FormField control={form.control} name="last_congregation" render={({ field }) => (
              <FormItem><FieldRow label="Last Congregation Before Church of Christ at Redcross" hint="Leave blank if this is their first congregation">
                <FormControl><Input {...field} value={field.value ?? ''} placeholder="e.g. Church of Christ at Limbe"
                  className="bg-background border-neutral-surface focus:border-gold" /></FormControl>
                <FormMessage />
              </FieldRow></FormItem>
            )} />
            <KnownToggle label="Is the date of joining Church of Christ at Redcross known?" value={joinedKnown}
              onChange={(v) => { setValue('joined_known', v); if (!v) setValue('joined_date', null); }}>
              <FormField control={form.control} name="joined_date" render={({ field }) => (
                <FormItem><FieldRow label="Date Added to Church of Christ" required>
                  <FormControl><Input {...field} value={field.value ?? ''} type="date"
                    className="bg-background border-neutral-surface focus:border-gold" /></FormControl>
                  <FormMessage />
                </FieldRow></FormItem>
              )} />
            </KnownToggle>
            <KnownToggle label="Does this member belong to a Home Cell?" value={homeCellKnown}
              onChange={(v) => { setValue('home_cell_known', v); if (!v) setValue('home_cell', null); }}>
              <FormField control={form.control} name="home_cell" render={({ field }) => (
                <FormItem><FieldRow label="Home Cell Affiliation" required>
                  <FormControl><Input {...field} value={field.value ?? ''} placeholder="e.g. Zingwangwa Cell"
                    className="bg-background border-neutral-surface focus:border-gold" /></FormControl>
                  <FormMessage />
                </FieldRow></FormItem>
              )} />
            </KnownToggle>
          </SectionCard>
        </div>

        {/* ── Family ── */}
        <div className={currentSection === 'family' ? undefined : 'hidden'}>
          <SectionCard title="Family Information" subtitle="Marital status, children, and next of kin" icon={Heart}>
            <FormField control={form.control} name="marital_status" render={({ field }) => (
              <FormItem><FieldRow label="Marital Status">
                <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || null)}>
                  <FormControl><SelectTrigger className="bg-background border-neutral-surface focus:ring-gold/20">
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Widowed">Widowed</SelectItem>
                    <SelectItem value="Divorced">Divorced</SelectItem>
                    <SelectItem value="Separated">Separated</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FieldRow></FormItem>
            )} />
            <FormField control={form.control} name="own_children" render={({ field }) => (
              <FormItem><FieldRow label="Name(s) of Own Children" hint="Enter names separated by commas or on new lines">
                <FormControl><Textarea {...field} value={field.value ?? ''} placeholder="e.g. Grace Banda, John Banda..."
                  rows={3} className="bg-background border-neutral-surface focus:border-gold resize-none" /></FormControl>
                <FormMessage />
              </FieldRow></FormItem>
            )} />
            <FormField control={form.control} name="dependent_children" render={({ field }) => (
              <FormItem><FieldRow label="Name(s) of Dependent Children" hint="Children in the household who are not biological children">
                <FormControl><Textarea {...field} value={field.value ?? ''} placeholder="e.g. Mary Phiri..."
                  rows={3} className="bg-background border-neutral-surface focus:border-gold resize-none" /></FormControl>
                <FormMessage />
              </FieldRow></FormItem>
            )} />
            <FormField control={form.control} name="next_of_kin_name" render={({ field }) => (
              <FormItem><FieldRow label="Next of Kin (Full Name)">
                <FormControl><Input {...field} value={field.value ?? ''} placeholder="e.g. James Banda"
                  className="bg-background border-neutral-surface focus:border-gold" /></FormControl>
                <FormMessage />
              </FieldRow></FormItem>
            )} />
            <FormField control={form.control} name="next_of_kin_phones_input" render={({ field }) => (
              <FormItem><FieldRow label="Next of Kin Phone Number(s)">
                <PhoneInput value={field.value as string[]} onChange={field.onChange} placeholder="e.g. +265 999 000 111" />
                <FormMessage />
              </FieldRow></FormItem>
            )} />
          </SectionCard>
        </div>

        {/* ── Location ── */}
        <div className={currentSection === 'location' ? undefined : 'hidden'}>
          <SectionCard title="Home / Origin" subtitle="Village, traditional authority, and home district (Malawi)" icon={MapPin}>
            <FormField control={form.control} name="home_village" render={({ field }) => (
              <FormItem><FieldRow label="Home Village">
                <FormControl><Input {...field} value={field.value ?? ''} placeholder="e.g. Village Phiri"
                  className="bg-background border-neutral-surface focus:border-gold" /></FormControl>
                <FormMessage />
              </FieldRow></FormItem>
            )} />
            <FormField control={form.control} name="traditional_authority" render={({ field }) => (
              <FormItem><FieldRow label="Traditional Authority" hint="Who is your home Traditional Authority?">
                <FormControl><Input {...field} value={field.value ?? ''} placeholder="e.g. T.A. Kapeni"
                  className="bg-background border-neutral-surface focus:border-gold" /></FormControl>
                <FormMessage />
              </FieldRow></FormItem>
            )} />
            <FormField control={form.control} name="home_district" render={({ field }) => (
              <FormItem><FieldRow label="Home District">
                <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || null)}>
                  <FormControl><SelectTrigger className="bg-background border-neutral-surface focus:ring-gold/20">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger></FormControl>
                  <SelectContent className="max-h-64">
                    {MALAWI_DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FieldRow></FormItem>
            )} />
          </SectionCard>
        </div>

        {/* ── Household ── */}
        <div className={currentSection === 'household' ? undefined : 'hidden'}>
          <SectionCard title="Head of Household" subtitle="Details of the household head" icon={Home}>
            <FormField control={form.control} name="head_of_household_name" render={({ field }) => (
              <FormItem><FieldRow label="Name of Head of Household">
                <FormControl><Input {...field} value={field.value ?? ''} placeholder="e.g. Peter Banda"
                  className="bg-background border-neutral-surface focus:border-gold" /></FormControl>
                <FormMessage />
              </FieldRow></FormItem>
            )} />
            <FormField control={form.control} name="head_of_household_phone" render={({ field }) => (
              <FormItem><FieldRow label="Head of Household Phone Number">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-caption" />
                  <FormControl><Input {...field} value={field.value ?? ''} placeholder="+265 999 000 111"
                    className="pl-10 bg-background border-neutral-surface focus:border-gold" /></FormControl>
                </div>
                <FormMessage />
              </FieldRow></FormItem>
            )} />
            <FormField control={form.control} name="head_of_household_is_member" render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-background border border-neutral-surface">
                  <div>
                    <p className="text-sm font-medium text-heading">Is the head of household a member of Church of Christ?</p>
                    <p className="text-xs text-caption mt-0.5">If yes, you can link their member record below</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={cn('text-xs', field.value ? 'text-forest-green font-medium' : 'text-caption')}>
                      {field.value ? 'Yes' : 'No'}
                    </span>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )} />
            {hohIsMember && (
              <div className="pl-3 border-l-2 border-gold/50 animate-in fade-in slide-in-from-top-2 duration-200">
                <FormField control={form.control} name="head_of_household_id" render={({ field }) => (
                  <FormItem><FieldRow label="Link to Member Record" hint="Select their existing member profile to link the records">
                    <Select value={field.value ?? 'none'} onValueChange={(v) => field.onChange(v === 'none' ? null : v)}>
                      <FormControl><SelectTrigger className="bg-background border-neutral-surface focus:ring-gold/20">
                        <SelectValue placeholder="Search and select member..." />
                      </SelectTrigger></FormControl>
                      <SelectContent className="max-h-64">
                        <SelectItem value="none">— Not linked —</SelectItem>
                        {memberOptions.filter((opt) => opt.id !== member?.id).map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>{opt.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FieldRow></FormItem>
                )} />
              </div>
            )}
          </SectionCard>
        </div>
        {saveError && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-terracotta/10 border border-terracotta/30 text-terracotta">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{saveError}</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          <div>
            {isFirstSection ? (
              <Button type="button" variant="outline" onClick={onCancel ?? (() => router.back())}
                className="border-neutral-surface text-body hover:border-gold/50">
                Cancel
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={goPrev}
                className="border-neutral-surface text-body hover:border-gold/50">
                <ChevronLeft className="w-4 h-4 mr-1" />Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-caption hidden sm:block">
              Section {sectionIndex + 1} of {SECTIONS.length}
            </span>

            {isLastSection ? (
              // Save button calls handleSave directly via onClick.
              // type="button" ensures it can never trigger HTML form submission.
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gold hover:bg-amber text-primary-deep font-semibold min-w-[120px]"
              >
                {isSaving
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                  : <><Check className="w-4 h-4 mr-2" />{isEditing ? 'Save Changes' : 'Add Member'}</>
                }
              </Button>
            ) : (
              <Button type="button" onClick={goNext} disabled={currentSectionHasErrors}
                className="bg-primary-deep hover:bg-primary-deep/90 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                Next<ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Form>
  );
}

// ─────────────────────────────────────────────────────────────
// Malawi districts
// ─────────────────────────────────────────────────────────────

const MALAWI_DISTRICTS = [
  'Chitipa', 'Karonga', 'Likoma', 'Mzimba', 'Nkhata Bay', 'Rumphi',
  'Dedza', 'Dowa', 'Kasungu', 'Lilongwe', 'Mchinji', 'Nkhotakota',
  'Ntcheu', 'Ntchisi', 'Salima',
  'Balaka', 'Blantyre', 'Chikwawa', 'Chiradzulu', 'Machinga', 'Mangochi',
  'Mulanje', 'Mwanza', 'Nsanje', 'Thyolo', 'Phalombe', 'Zomba', 'Neno',
];