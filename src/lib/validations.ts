import { z } from 'zod';

export const maritalStatusSchema = z.enum([
  'Married', 'Divorced', 'Widowed', 'Single', 'Separated',
]);

export const employmentStatusSchema = z.enum([
  'Employed', 'Self-employed', 'Retired', 'Unemployed',
]);

// ─────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────

export const MemberFormSchema = z.object({
  // ── Personal ───────────────────────────────────────────────
  first_name:  z.string().min(1, 'First name is required').default(''),
  last_name:   z.string().min(1, 'Last name is required').default(''),
  middle_name: z.string().nullable().default(''),

  // ── Contact ────────────────────────────────────────────────
  postal_address:   z.string().nullable().default(''),
  physical_address: z.string().nullable().default(''),
  // Form-only field — mapped to `phones` DB column in formValuesToInsert
  phones_input: z.array(z.string()).default([]),
  email: z
    .string()
    .email('Invalid email address')
    .or(z.literal(''))
    .nullable()
    .default(''),

  // ── Dates ──────────────────────────────────────────────────
  dob_known:     z.boolean().default(false),
  dob:           z.string().nullable().default(null),
  baptism_known: z.boolean().default(false),
  baptism_date:  z.string().nullable().default(null),

  // ── Social ─────────────────────────────────────────────────
  marital_status:     maritalStatusSchema.nullable().default(null),
  own_children:       z.string().nullable().default(''),
  dependent_children: z.string().nullable().default(''),
  employment_status:  employmentStatusSchema.nullable().default(null),
  education:          z.string().nullable().default(''),

  // ── Faith ──────────────────────────────────────────────────
  home_cell_known:   z.boolean().default(false),
  home_cell:         z.string().nullable().default(''),
  last_congregation: z.string().nullable().default(''),
  joined_known:      z.boolean().default(false),
  joined_date:       z.string().nullable().default(null),

  // ── Location ───────────────────────────────────────────────
  home_village:          z.string().nullable().default(''),
  traditional_authority: z.string().nullable().default(''),
  home_district:         z.string().nullable().default(''),

  // ── Next of Kin ────────────────────────────────────────────
  next_of_kin_name: z.string().nullable().default(''),
  // Form-only field — mapped to `next_of_kin_phones` DB column in formValuesToInsert
  next_of_kin_phones_input: z.array(z.string()).default([]),

  // ── Household ──────────────────────────────────────────────
  head_of_household_name:      z.string().nullable().default(''),
  head_of_household_phone:     z.string().nullable().default(''),
  head_of_household_is_member: z.boolean().default(false),
  head_of_household_id:        z.string().uuid().nullable().default(null),
})
  .refine((d) => !d.dob_known || (!!d.dob && d.dob.length > 0), {
    message: 'Please enter the date of birth',
    path: ['dob'],
  })
  .refine((d) => !d.baptism_known || (!!d.baptism_date && d.baptism_date.length > 0), {
    message: 'Please enter the baptism date',
    path: ['baptism_date'],
  });

// ─────────────────────────────────────────────────────────────
// Explicit type
// ─────────────────────────────────────────────────────────────
// Defined manually instead of using z.infer<> because z.infer
// produces optional fields (T | undefined) for fields with .default(),
// which conflicts with RHF's Resolver expecting T | null only,
// causing the "Type 'undefined' is not assignable to type 'string | null'"
// TS error on zodResolver.
export type MemberFormValues = {
  first_name:  string;
  last_name:   string;
  middle_name: string | null;
  postal_address:   string | null;
  physical_address: string | null;
  phones_input:     string[];
  email:            string | null;
  dob_known:     boolean;
  dob:           string | null;
  baptism_known: boolean;
  baptism_date:  string | null;
  marital_status:     'Married' | 'Divorced' | 'Widowed' | 'Single' | 'Separated' | null;
  own_children:       string | null;
  dependent_children: string | null;
  employment_status:  'Employed' | 'Self-employed' | 'Retired' | 'Unemployed' | null;
  education:          string | null;
  home_cell_known:   boolean;
  home_cell:         string | null;
  last_congregation: string | null;
  joined_known:  boolean;
  joined_date:   string | null;
  home_village:          string | null;
  traditional_authority: string | null;
  home_district:         string | null;
  next_of_kin_name:         string | null;
  next_of_kin_phones_input: string[];
  head_of_household_name:      string | null;
  head_of_household_phone:     string | null;
  head_of_household_is_member: boolean;
  head_of_household_id:        string | null;
};

// ─────────────────────────────────────────────────────────────
// Default values
// ─────────────────────────────────────────────────────────────
export const defaultMemberFormValues: MemberFormValues = {
  first_name:  '',
  last_name:   '',
  middle_name: '',
  postal_address:   '',
  physical_address: '',
  phones_input:     [],
  email:            '',
  dob_known:     false,
  dob:           null,
  baptism_known: false,
  baptism_date:  null,
  marital_status:     null,
  own_children:       '',
  dependent_children: '',
  employment_status:  null,
  education:          '',
  home_cell_known:   false,
  home_cell:         '',
  last_congregation: '',
  joined_known:  false,
  joined_date:   null,
  home_village:          '',
  traditional_authority: '',
  home_district:         '',
  next_of_kin_name:         '',
  next_of_kin_phones_input: [],
  head_of_household_name:      '',
  head_of_household_phone:     '',
  head_of_household_is_member: false,
  head_of_household_id:        null,
};

// ─────────────────────────────────────────────────────────────
// DB → Form
// ─────────────────────────────────────────────────────────────
export function memberToFormValues(member: any): MemberFormValues {
  return {
    ...defaultMemberFormValues,
    first_name:  member.first_name  ?? '',
    last_name:   member.last_name   ?? '',
    middle_name: member.middle_name ?? '',
    postal_address:   member.postal_address   ?? '',
    physical_address: member.physical_address ?? '',
    phones_input:     member.phones           ?? [],  // DB col `phones` → form field
    email:            member.email            ?? '',
    dob_known:     !!member.dob_known,
    dob:           member.dob           ?? null,
    baptism_known: !!member.baptism_known,
    baptism_date:  member.baptism_date  ?? null,
    marital_status:    member.marital_status    ?? null,
    employment_status: member.employment_status ?? null,
    education:         member.education         ?? '',
    home_cell_known:   !!member.home_cell_known,
    home_cell:         member.home_cell         ?? '',
    last_congregation: member.last_congregation ?? '',
    joined_known:  !!member.joined_known,
    joined_date:   member.joined_date   ?? null,
    home_village:          member.home_village          ?? '',
    traditional_authority: member.traditional_authority ?? '',
    home_district:         member.home_district         ?? '',
    own_children:       member.own_children       ?? '',
    dependent_children: member.dependent_children ?? '',
    next_of_kin_name:         member.next_of_kin_name   ?? '',
    next_of_kin_phones_input: member.next_of_kin_phones ?? [],  // DB col → form field
    head_of_household_name:      member.head_of_household_name      ?? '',
    head_of_household_phone:     member.head_of_household_phone     ?? '',
    head_of_household_is_member: !!member.head_of_household_is_member,
    head_of_household_id:        member.head_of_household_id        ?? null,
  };
}

// ─────────────────────────────────────────────────────────────
// Form → DB
// ─────────────────────────────────────────────────────────────
// CRITICAL: `phones_input` and `next_of_kin_phones_input` are
// form-only fields — they do NOT exist as Supabase columns.
// Destructure them out before spreading into the DB payload,
// then remap to the correct column names: `phones` and
// `next_of_kin_phones`. Sending them as-is causes:
//   "Could not find the 'next_of_kin_phones_input' column of 'members'"
export function formValuesToInsert(values: MemberFormValues) {
  const emptyToNull = (val: string | null | undefined): string | null =>
    val === '' || val === undefined ? null : val;

  // Destructure out form-only fields so they are NOT in `rest`
  const { phones_input, next_of_kin_phones_input, ...rest } = values;

  return {
    ...rest,
    // Remap to correct DB column names
    phones:             phones_input.length > 0 ? phones_input : null,
    next_of_kin_phones: next_of_kin_phones_input.length > 0 ? next_of_kin_phones_input : null,
    // Convert empty strings → null for nullable Postgres text columns
    middle_name:           emptyToNull(rest.middle_name),
    postal_address:        emptyToNull(rest.postal_address),
    physical_address:      emptyToNull(rest.physical_address),
    email:                 emptyToNull(rest.email),
    education:             emptyToNull(rest.education),
    home_cell:             emptyToNull(rest.home_cell),
    home_village:          emptyToNull(rest.home_village),
    traditional_authority: emptyToNull(rest.traditional_authority),
    home_district:         emptyToNull(rest.home_district),
    last_congregation:     emptyToNull(rest.last_congregation),
    own_children:          emptyToNull(rest.own_children),
    dependent_children:    emptyToNull(rest.dependent_children),
    next_of_kin_name:      emptyToNull(rest.next_of_kin_name),
    head_of_household_name:  emptyToNull(rest.head_of_household_name),
    head_of_household_phone: emptyToNull(rest.head_of_household_phone),
  };
}