  // types/index.ts
  // Church of Christ at Redcross — Member Management System
  // Single source of truth for all TypeScript types.
  // DashboardStats matches the shape produced by queries.ts exactly.

  // ─── Enums ────────────────────────────────────────────────────

  export type MaritalStatus =
    | 'Married'
    | 'Divorced'
    | 'Widowed'
    | 'Single'
    | 'Separated';

  export type EmploymentStatus =
    | 'Employed'
    | 'Self-employed'
    | 'Retired'
    | 'Unemployed';

  // ─── Core Member type (mirrors DB columns 1:1) ─────────────────

  export interface Member {
    id: string;

    // Personal
    first_name: string;
    middle_name: string | null;
    last_name: string;

    // Contact
    postal_address: string | null;
    physical_address: string | null;
    phones: string[] | null;
    email: string | null;

    // Date of birth
    dob_known: boolean;
    dob: string | null;

    // Baptism
    baptism_known: boolean;
    baptism_date: string | null;

    // Personal / social
    marital_status: MaritalStatus | null;
    own_children: string | null;
    dependent_children: string | null;
    employment_status: EmploymentStatus | null;
    education: string | null;

    // Home cell
    home_cell_known: boolean;
    home_cell: string | null;

    last_congregation: string | null;

    // Joining
    joined_known: boolean;
    joined_date: string | null;

    // Origin (Malawi)
    home_village: string | null;
    traditional_authority: string | null;
    home_district: string | null;

    // Next of kin
    next_of_kin_name: string | null;
    next_of_kin_phones: string[] | null;

    // Head of household
    head_of_household_name: string | null;
    head_of_household_phone: string | null;
    head_of_household_is_member: boolean;
    head_of_household_id: string | null;

    // Timestamps
    created_at: string;
    updated_at: string;
  }

  // ─── Insert / Update ──────────────────────────────────────────

  export type MemberInsert = Omit<Member, 'id' | 'created_at' | 'updated_at'>;
  export type MemberUpdate = Partial<MemberInsert>;

  // ─── Dropdown option (for HoH member selector) ───────────────

  export interface MemberOption {
    id: string;
    full_name: string;
  }

  // ─── Filters (matches getMembers() params in queries.ts) ──────

  export interface MemberFilters {
    search?: string;
    marital_status?: MaritalStatus;
    employment_status?: EmploymentStatus;
    home_cell?: string;
    home_district?: string;
    baptism_known?: boolean;
    home_cell_known?: boolean;
    // Pagination
    page?: number;
    page_size?: number;
  }

  // ─── Paginated response ───────────────────────────────────────

  export interface PaginatedMembers {
    data: Member[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  }

  // ─── Dashboard stats (matches getDashboardStats() return) ─────
  // All field names match what queries.ts produces exactly.

  export interface MaritalStatusCount {
    status: MaritalStatus;
    count: number;
  }

  export interface HomeCellCount {
    home_cell: string;
    count: number;
  }

  export interface DistrictCount {
    home_district: string;
    count: number;
  }

  export interface AgeGroupCount {
    label: string;   // e.g. "Under 18", "18–35", "36–60", "60+"
    count: number;
  }

  export interface DashboardStats {
    total_members: number;
    baptised_count: number;
    unbaptised_count: number;
    home_cell_members: number;
    no_home_cell: number;
    by_marital_status: MaritalStatusCount[];
    by_home_cell: HomeCellCount[];
    by_district: DistrictCount[];
    by_age_group: AgeGroupCount[];
    recent_members: Member[];
  }