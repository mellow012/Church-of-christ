
import { Member } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ─── shadcn/ui class merge helper ─────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date formatting ──────────────────────────────────────────────────────────

/**
 * Format an ISO date string (YYYY-MM-DD) to a readable format.
 * e.g. "1990-05-14" → "14 May 1990"
 */
export function formatDate(
  dateStr: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
): string {
  if (!dateStr) return '—';
  try {
    // Parse as UTC to avoid timezone shifts on date-only strings
    const date = new Date(`${dateStr}T00:00:00Z`);
    return date.toLocaleDateString('en-GB', { ...options, timeZone: 'UTC' });
  } catch {
    return dateStr;
  }
}

/**
 * Format a timestamp to short date + time.
 * e.g. "2024-01-15T10:30:00Z" → "15 Jan 2024, 10:30"
 */
export function formatDateTime(timestamp: string | null | undefined): string {
  if (!timestamp) return '—';
  try {
    return new Date(timestamp).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timestamp;
  }
}

// ─── Age calculation ──────────────────────────────────────────────────────────

/**
 * Calculate age from a date of birth string (YYYY-MM-DD).
 * Returns null if dob is null/undefined.
 */
export function calculateAge(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const birth = new Date(`${dob}T00:00:00Z`);
  const today = new Date();
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - birth.getUTCMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getUTCDate() < birth.getUTCDate())
  ) {
    age--;
  }
  return age;
}

/**
 * Bucket an age into a display group label.
 * Used for the dashboard age group chart.
 */
export function getAgeGroupLabel(dob: string | null | undefined): string {
  const age = calculateAge(dob);
  if (age === null) return 'Unknown';
  if (age < 18) return 'Under 18';
  if (age <= 35) return '18–35';
  if (age <= 60) return '36–60';
  return '60+';
}

// ─── Phone number helpers ─────────────────────────────────────────────────────

/**
 * Display a phone array as a comma-separated string.
 * e.g. ["0888123456", "0999654321"] → "0888123456, 0999654321"
 */
export function formatPhones(phones: string[] | null | undefined): string {
  if (!phones || phones.length === 0) return '—';
  return phones.join(', ');
}

/**
 * Parse a comma/newline-separated string into a cleaned phone array.
 * Used when the user types multiple phones in one input field.
 */
export function parsePhoneInput(raw: string): string[] {
  return raw
    .split(/[,\n]+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// ─── Name helpers ─────────────────────────────────────────────────────────────

/**
 * Build a full display name from parts.
 * e.g. "John", "Michael", "Banda" → "John Michael Banda"
 */

// Add this right after the existing getFullName
export function getFullName(member: Member): string;
export function getFullName(firstName: string, middleName: string | null | undefined, lastName: string): string;
export function getFullName(...args: any[]): string {
  if (args.length === 1) {
    const member = args[0] as Member;
    return [member.first_name, member.middle_name, member.last_name]
      .filter(Boolean)
      .join(' ');
  }

  const [firstName, middleName, lastName] = args;
  return [firstName, middleName, lastName].filter(Boolean).join(' ');
}

// ─── Initials helper (for avatars) ────────────────────────────────────────────

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// ─── Null/empty display ───────────────────────────────────────────────────────

/** Return value or an em-dash if null/empty — used throughout detail views */
export function display(value: string | null | undefined): string {
  if (!value || value.trim() === '') return '—';
  return value;
}