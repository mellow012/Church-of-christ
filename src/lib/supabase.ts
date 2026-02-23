// lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] Missing env vars. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );
}

export const MEMBERS_TABLE = 'members' as const;

// ─── Browser client ───────────────────────────────────────────
// Singleton used in Client Components for auth (sign in/out).
// Persists the session in localStorage automatically.

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Server client (synchronous) ─────────────────────────────
// Used in Server Actions and Server Components.
// Uses service role key — bypasses RLS. Never import in 'use client'.

export function getSupabaseServerClient() {
  const key = serviceRoleKey ?? supabaseAnonKey;
  if (!serviceRoleKey) {
    console.warn('[Supabase] SUPABASE_SERVICE_ROLE_KEY not set — falling back to anon key.');
  }
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ─── Auth helpers ─────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}