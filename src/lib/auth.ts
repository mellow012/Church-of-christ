'use server';

// lib/auth.ts
// Server Actions for authentication.
// Call these directly from Client Components — no API route needed.

import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────

export interface AuthResult {
  success: boolean;
  error?: string;
}

// ─── Login ────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<AuthResult> {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Normalise Supabase error messages into user-friendly strings
    if (
      error.message.toLowerCase().includes('invalid login') ||
      error.message.toLowerCase().includes('invalid credentials') ||
      error.message.toLowerCase().includes('email not confirmed') === false &&
      error.status === 400
    ) {
      return { success: false, error: 'Incorrect email or password.' };
    }
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return { success: false, error: 'Please confirm your email address before logging in.' };
    }
    if (error.message.toLowerCase().includes('too many requests') || error.status === 429) {
      return { success: false, error: 'Too many attempts. Please wait a moment and try again.' };
    }
    return { success: false, error: 'Something went wrong. Please try again.' };
  }

  return { success: true };
}

// ─── Logout ───────────────────────────────────────────────────

export async function logout(): Promise<void> {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/');
}

// ─── Get current session (Server Components) ─────────────────

export async function getSession() {
  const supabase = await getSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ─── Get current user (Server Components) ────────────────────
// Uses getUser() instead of getSession().user — safer because
// getUser() makes a network call to verify the JWT with Supabase Auth.

export async function getUser() {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}