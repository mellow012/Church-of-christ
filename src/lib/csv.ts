import { Member } from '@/types/index';
// ─── CSV Export ───────────────────────────────────────────────
// Synchronous — NOT async. Returns a plain string.

export function membersToCSV(members: Member[]): string {
  if (members.length === 0) return '';

  const headers: (keyof Member)[] = [
    'id', 'first_name', 'middle_name', 'last_name',
    'postal_address', 'physical_address', 'phones', 'email',
    'dob_known', 'dob', 'baptism_known', 'baptism_date',
    'marital_status', 'own_children', 'dependent_children',
    'employment_status', 'education',
    'home_cell_known', 'home_cell', 'last_congregation',
    'joined_known', 'joined_date',
    'home_village', 'traditional_authority', 'home_district',
    'next_of_kin_name', 'next_of_kin_phones',
    'head_of_household_name', 'head_of_household_phone',
    'head_of_household_is_member', 'head_of_household_id',
    'created_at', 'updated_at',
  ];

  const escape = (val: unknown): string => {
    if (val == null) return '';
    const str = Array.isArray(val) ? val.join('; ') : String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const rows = members.map((m) =>
    headers.map((key) => escape(m[key])).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}
export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}