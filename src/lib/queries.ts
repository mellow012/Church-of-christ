'use server';

import { getSupabaseServerClient, MEMBERS_TABLE } from '@/lib/supabase';
import type {
  Member,
  MemberInsert,
  MemberUpdate,
  MemberFilters,
  PaginatedMembers,
  DashboardStats,
  MaritalStatus,
  MemberOption,
} from '@/types';

// ─── Helpers ──────────────────────────────────────────────────

function getAgeGroup(dob: string | null): string {
  if (!dob) return 'Unknown';
  const age = new Date().getFullYear() - new Date(dob).getFullYear();
  if (age < 18) return 'Under 18';
  if (age <= 35) return '18–35';
  if (age <= 60) return '36–60';
  return '60+';
}

// ─── CREATE ───────────────────────────────────────────────────

export async function createMember(data: MemberInsert): Promise<Member> {
  const supabase = getSupabaseServerClient();
  const { data: member, error } = await supabase
    .from(MEMBERS_TABLE)
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(`Failed to create member: ${error.message}`);
  return member as Member;
}

// ─── READ: single member ──────────────────────────────────────

export async function getMemberById(id: string): Promise<Member | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from(MEMBERS_TABLE)
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch member: ${error.message}`);
  }
  return data as Member;
}

// ─── READ: all members (for client-side table + CSV export) ───

export async function getAllMembers(): Promise<Member[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from(MEMBERS_TABLE)
    .select('*')
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true });
  if (error) throw new Error(`Failed to fetch members: ${error.message}`);
  return (data ?? []) as Member[];
}

// ─── READ: paginated + filtered list ─────────────────────────

export async function getMembers(
  filters: MemberFilters = {}
): Promise<PaginatedMembers> {
  const supabase = getSupabaseServerClient();
  const {
    search,
    marital_status,
    employment_status,
    home_cell,
    home_district,
    baptism_known,
    home_cell_known,
    page = 1,
    page_size = 20,
  } = filters;

  const from = (page - 1) * page_size;
  const to = from + page_size - 1;

  let query = supabase
    .from(MEMBERS_TABLE)
    .select('*', { count: 'exact' })
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })
    .range(from, to);

  if (search?.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(
      `first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term}`
    );
  }
  if (marital_status)    query = query.eq('marital_status', marital_status);
  if (employment_status) query = query.eq('employment_status', employment_status);
  if (home_cell)         query = query.ilike('home_cell', `%${home_cell}%`);
  if (home_district)     query = query.ilike('home_district', `%${home_district}%`);
  if (baptism_known !== undefined)   query = query.eq('baptism_known', baptism_known);
  if (home_cell_known !== undefined) query = query.eq('home_cell_known', home_cell_known);

  const { data, error, count } = await query;
  if (error) throw new Error(`Failed to fetch members: ${error.message}`);

  const total = count ?? 0;
  return {
    data: (data ?? []) as Member[],
    total,
    page,
    page_size,
    total_pages: Math.ceil(total / page_size),
  };
}

// ─── READ: dropdown options for HoH selector ─────────────────

export async function getMemberOptions(): Promise<MemberOption[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from(MEMBERS_TABLE)
    .select('id, first_name, middle_name, last_name')
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true });

  if (error) {
    console.error('Failed to fetch member options:', error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    full_name: [row.first_name, row.middle_name, row.last_name]
      .filter(Boolean)
      .join(' '),
  }));
}

// ─── READ: distinct filter values ────────────────────────────

export async function getDistinctHomeCells(): Promise<string[]> {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from(MEMBERS_TABLE)
    .select('home_cell')
    .eq('home_cell_known', true)
    .not('home_cell', 'is', null);
  const unique = [...new Set((data ?? []).map((r) => r.home_cell as string))];
  return unique.sort();
}

export async function getDistinctDistricts(): Promise<string[]> {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from(MEMBERS_TABLE)
    .select('home_district')
    .not('home_district', 'is', null);
  const unique = [...new Set((data ?? []).map((r) => r.home_district as string))];
  return unique.sort();
}

// Aliases used by MembersTable + reports filter dropdowns
export const getHomeCells = getDistinctHomeCells;
export const getHomeDistricts = getDistinctDistricts;

// ─── UPDATE ───────────────────────────────────────────────────

export async function updateMember(id: string, data: MemberUpdate): Promise<Member> {
  const supabase = getSupabaseServerClient();
  const { data: member, error } = await supabase
    .from(MEMBERS_TABLE)
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(`Failed to update member: ${error.message}`);
  return member as Member;
}

// ─── DELETE ───────────────────────────────────────────────────

export async function deleteMember(id: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from(MEMBERS_TABLE).delete().eq('id', id);
  if (error) throw new Error(`Failed to delete member: ${error.message}`);
}

// ─── DASHBOARD STATS ──────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from(MEMBERS_TABLE)
    .select(
      'id, dob, dob_known, baptism_known, marital_status, home_cell, home_cell_known, home_district, created_at'
    )
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch stats: ${error.message}`);

  const all = (data ?? []) as Pick<
    Member,
    | 'id' | 'dob' | 'dob_known' | 'baptism_known'
    | 'marital_status' | 'home_cell' | 'home_cell_known'
    | 'home_district' | 'created_at'
  >[];

  const total_members     = all.length;
  const baptised_count    = all.filter((m) => m.baptism_known).length;
  const unbaptised_count  = total_members - baptised_count;
  const home_cell_members = all.filter((m) => m.home_cell_known).length;
  const no_home_cell      = total_members - home_cell_members;

  // Marital status
  const maritalMap = new Map<string, number>();
  for (const m of all) {
    if (m.marital_status) {
      maritalMap.set(m.marital_status, (maritalMap.get(m.marital_status) ?? 0) + 1);
    }
  }
  const by_marital_status = Array.from(maritalMap.entries()).map(
    ([status, count]) => ({ status: status as MaritalStatus, count })
  );

  // Home cells (top 10)
  const cellMap = new Map<string, number>();
  for (const m of all) {
    if (m.home_cell_known && m.home_cell) {
      cellMap.set(m.home_cell, (cellMap.get(m.home_cell) ?? 0) + 1);
    }
  }
  const by_home_cell = Array.from(cellMap.entries())
    .map(([home_cell, count]) => ({ home_cell, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Districts
  const districtMap = new Map<string, number>();
  for (const m of all) {
    if (m.home_district) {
      districtMap.set(m.home_district, (districtMap.get(m.home_district) ?? 0) + 1);
    }
  }
  const by_district = Array.from(districtMap.entries())
    .map(([home_district, count]) => ({ home_district, count }))
    .sort((a, b) => b.count - a.count);

  // Age groups
  const ageGroupMap = new Map<string, number>();
  for (const m of all) {
    if (m.dob_known && m.dob) {
      const group = getAgeGroup(m.dob);
      ageGroupMap.set(group, (ageGroupMap.get(group) ?? 0) + 1);
    }
  }
  const ageOrder = ['Under 18', '18–35', '36–60', '60+'];
  const by_age_group = ageOrder
    .filter((label) => ageGroupMap.has(label))
    .map((label) => ({ label, count: ageGroupMap.get(label)! }));

  // Recent 5 members — full records
  const { data: recentData } = await supabase
    .from(MEMBERS_TABLE)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    total_members,
    baptised_count,
    unbaptised_count,
    home_cell_members,
    no_home_cell,
    by_marital_status,
    by_home_cell,
    by_district,
    by_age_group,
    recent_members: (recentData ?? []) as Member[],
  };
}