'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Filter,
  Users,
  BookOpen,
  Home,
  MapPin,
  Heart,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Printer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { membersToCSV} from '@/lib/csv';
import type {
  DashboardStats,
  MaritalStatus,
  EmploymentStatus,
} from '@/types';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface ReportsClientProps {
  stats: DashboardStats;
  homeCells: string[];
  districts: string[];
}

interface ExportFilters {
  marital_status: MaritalStatus | 'all';
  home_cell: string | 'all';
  home_district: string | 'all';
  baptism_known: 'all' | 'yes' | 'no';
  employment_status: EmploymentStatus | 'all';
  home_cell_known: 'all' | 'yes' | 'no';
}

const DEFAULT_FILTERS: ExportFilters = {
  marital_status: 'all',
  home_cell: 'all',
  home_district: 'all',
  baptism_known: 'all',
  employment_status: 'all',
  home_cell_known: 'all',
};

// ─────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────

function pct(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function StatPill({
  label,
  value,
  color = 'blue',
}: {
  label: string;
  value: string | number;
  color?: 'blue' | 'gold' | 'green' | 'terracotta';
}) {
  const colors = {
    blue:       'bg-primary-deep/10 text-primary-deep border-primary-deep/20',
    gold:       'bg-gold/10 text-gold border-gold/25',
    green:      'bg-forest-green/10 text-forest-green border-forest-green/25',
    terracotta: 'bg-terracotta/10 text-terracotta border-terracotta/25',
  };
  return (
    <div className={cn('flex items-center justify-between px-4 py-3 rounded-xl border', colors[color])}>
      <span className="text-sm font-medium">{label}</span>
      <span className="font-serif text-xl font-bold tabular-nums">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Summary section
// ─────────────────────────────────────────────────────────────

function SummarySection({ stats }: { stats: DashboardStats }) {
  const [expanded, setExpanded] = useState(true);
  const t = stats.total_members;

  return (
    <Card className="bg-primary-warm border-neutral-surface shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-lg text-heading flex items-center gap-2">
            <Users className="w-5 h-5 text-gold" />
            Congregation Summary
          </CardTitle>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-caption hover:text-body transition-colors"
          >
            {expanded
              ? <ChevronUp className="w-4 h-4" />
              : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-caption">
          Live statistics from the directory · {new Date().toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
        </p>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-5">
          {/* Top-line numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatPill label="Total Members" value={t} color="blue" />
            <StatPill label="Baptised" value={`${stats.baptised_count} (${pct(stats.baptised_count, t)}%)`} color="gold" />
            <StatPill label="In Home Cells" value={`${stats.home_cell_members} (${pct(stats.home_cell_members, t)}%)`} color="green" />
            <StatPill label="Unbaptised" value={`${stats.unbaptised_count} (${pct(stats.unbaptised_count, t)}%)`} color="terracotta" />
          </div>

          {/* Marital status breakdown */}
          <div>
            <p className="text-xs font-semibold text-caption uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" /> Marital Status
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {stats.by_marital_status.map((row) => (
                <div
                  key={row.status}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-background border border-neutral-surface"
                >
                  <span className="text-sm text-body">{row.status}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-heading tabular-nums">{row.count}</span>
                    <span className="text-xs text-caption">({pct(row.count, t)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Age groups */}
          {stats.by_age_group.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-caption uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Age Groups
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {stats.by_age_group.filter((r) => r.count > 0).map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-background border border-neutral-surface"
                  >
                    <span className="text-sm text-body">{row.label}</span>
                    <span className="text-sm font-semibold text-heading tabular-nums">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Home cells */}
          {stats.by_home_cell.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-caption uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" /> Home Cells (Top 10)
              </p>
              <div className="space-y-1.5">
                {stats.by_home_cell.map((row) => (
                  <div
                    key={row.home_cell}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-background border border-neutral-surface"
                  >
                    <span className="text-sm text-body flex-1 truncate">{row.home_cell}</span>
                    <span className="text-xs text-caption">{pct(row.count, t)}%</span>
                    <span className="text-sm font-semibold text-heading tabular-nums w-8 text-right">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Districts */}
          {stats.by_district.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-caption uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Districts
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {stats.by_district.slice(0, 9).map((row) => (
                  <div
                    key={row.home_district}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-background border border-neutral-surface"
                  >
                    <span className="text-sm text-body truncate flex-1 mr-2">{row.home_district}</span>
                    <span className="text-sm font-semibold text-heading tabular-nums shrink-0">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// CSV export section
// ─────────────────────────────────────────────────────────────

function ExportSection({
  stats,
  homeCells,
  districts,
}: {
  stats: DashboardStats;
  homeCells: string[];
  districts: string[];
}) {
  const [filters, setFilters] = useState<ExportFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const activeFilterCount = Object.entries(filters).filter(
    ([, v]) => v !== 'all'
  ).length;

  function updateFilter<K extends keyof ExportFilters>(key: K, val: ExportFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setExported(false);
  }

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setExported(false);
    try {
      // Dynamically import to keep this client bundle lean
      const { getAllMembers } = await import('@/lib/queries');
      let members = await getAllMembers();

      // Apply filters
      if (filters.marital_status !== 'all') {
        members = members.filter((m) => m.marital_status === filters.marital_status);
      }
      if (filters.home_cell !== 'all') {
        members = members.filter((m) => m.home_cell === filters.home_cell);
      }
      if (filters.home_district !== 'all') {
        members = members.filter((m) => m.home_district === filters.home_district);
      }
      if (filters.baptism_known !== 'all') {
        const val = filters.baptism_known === 'yes';
        members = members.filter((m) => m.baptism_known === val);
      }
      if (filters.employment_status !== 'all') {
        members = members.filter((m) => m.employment_status === filters.employment_status);
      }
      if (filters.home_cell_known !== 'all') {
        const val = filters.home_cell_known === 'yes';
        members = members.filter((m) => m.home_cell_known === val);
      }

      const csv = membersToCSV(members);
      const date = new Date().toISOString().slice(0, 10);
      const suffix = activeFilterCount > 0 ? '-filtered' : '-all';
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `redcross-members${suffix}-${date}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [filters, activeFilterCount]);

  return (
    <Card className="bg-primary-warm border-neutral-surface shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-lg text-heading flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-forest-green" />
          Export to CSV
        </CardTitle>
        <p className="text-xs text-caption">
          Download member records as a spreadsheet — export all or apply filters first.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filter toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              'flex items-center gap-2 text-sm font-medium transition-colors',
              showFilters ? 'text-gold' : 'text-body hover:text-heading'
            )}
          >
            <Filter className="w-4 h-4" />
            Filter export
            {activeFilterCount > 0 && (
              <Badge className="h-4 px-1.5 text-[10px] bg-gold text-primary-deep border-0 font-bold">
                {activeFilterCount}
              </Badge>
            )}
            {showFilters
              ? <ChevronUp className="w-3.5 h-3.5" />
              : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={() => { setFilters(DEFAULT_FILTERS); setExported(false); }}
              className="text-xs text-caption hover:text-terracotta transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-background border border-neutral-surface animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Marital status */}
            <div className="space-y-1.5">
              <label className="text-xs text-caption font-semibold uppercase tracking-wide">Marital Status</label>
              <Select
                value={filters.marital_status}
                onValueChange={(v) => updateFilter('marital_status', v as ExportFilters['marital_status'])}
              >
                <SelectTrigger className="h-8 text-xs bg-primary-warm border-neutral-surface">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {(['Married','Single','Widowed','Divorced','Separated'] as MaritalStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Home cell */}
            <div className="space-y-1.5">
              <label className="text-xs text-caption font-semibold uppercase tracking-wide">Home Cell</label>
              <Select
                value={filters.home_cell}
                onValueChange={(v) => updateFilter('home_cell', v)}
              >
                <SelectTrigger className="h-8 text-xs bg-primary-warm border-neutral-surface">
                  <SelectValue placeholder="All cells" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  <SelectItem value="all">All cells</SelectItem>
                  {homeCells.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* District */}
            <div className="space-y-1.5">
              <label className="text-xs text-caption font-semibold uppercase tracking-wide">District</label>
              <Select
                value={filters.home_district}
                onValueChange={(v) => updateFilter('home_district', v)}
              >
                <SelectTrigger className="h-8 text-xs bg-primary-warm border-neutral-surface">
                  <SelectValue placeholder="All districts" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  <SelectItem value="all">All districts</SelectItem>
                  {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Employment */}
            <div className="space-y-1.5">
              <label className="text-xs text-caption font-semibold uppercase tracking-wide">Employment</label>
              <Select
                value={filters.employment_status}
                onValueChange={(v) => updateFilter('employment_status', v as ExportFilters['employment_status'])}
              >
                <SelectTrigger className="h-8 text-xs bg-primary-warm border-neutral-surface">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {(['Employed','Self-employed','Retired','Unemployed'] as EmploymentStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Baptism */}
            <div className="space-y-1.5">
              <label className="text-xs text-caption font-semibold uppercase tracking-wide">Baptism Status</label>
              <Select
                value={filters.baptism_known}
                onValueChange={(v) => updateFilter('baptism_known', v as ExportFilters['baptism_known'])}
              >
                <SelectTrigger className="h-8 text-xs bg-primary-warm border-neutral-surface">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Baptism date known</SelectItem>
                  <SelectItem value="no">Date unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Home cell membership */}
            <div className="space-y-1.5">
              <label className="text-xs text-caption font-semibold uppercase tracking-wide">Home Cell Membership</label>
              <Select
                value={filters.home_cell_known}
                onValueChange={(v) => updateFilter('home_cell_known', v as ExportFilters['home_cell_known'])}
              >
                <SelectTrigger className="h-8 text-xs bg-primary-warm border-neutral-surface">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">In a home cell</SelectItem>
                  <SelectItem value="no">No home cell</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Export button */}
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className={cn(
            'w-full gap-2 font-semibold transition-all duration-300',
            exported
              ? 'bg-forest-green hover:bg-forest-green text-white'
              : 'bg-gold hover:bg-amber text-primary-deep'
          )}
        >
          {isExporting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Preparing export...</>
          ) : exported ? (
            <><CheckCircle2 className="w-4 h-4" /> Downloaded!</>
          ) : (
            <><Download className="w-4 h-4" />
              {activeFilterCount > 0 ? 'Export Filtered Members' : 'Export All Members'} (.csv)
            </>
          )}
        </Button>

        <p className="text-xs text-caption text-center">
          CSV includes all 29 fields — ready for Excel or Google Sheets
        </p>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// Print / summary report section
// ─────────────────────────────────────────────────────────────

function PrintSection({ stats }: { stats: DashboardStats }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="bg-primary-warm border-neutral-surface shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-lg text-heading flex items-center gap-2">
          <Printer className="w-5 h-5 text-primary-deep" />
          Print Summary Report
        </CardTitle>
        <p className="text-xs text-caption">
          Print or save as PDF — generates a clean A4 summary of congregation statistics.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Preview of what will print */}
        <div className="rounded-xl border border-neutral-surface bg-background p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-surface pb-3">
            <div>
              <p className="font-serif text-base text-heading font-semibold">
                Church of Christ at Redcross
              </p>
              <p className="text-xs text-caption">
                Membership Summary Report · {new Date().toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
            <Badge variant="outline" className="text-xs border-gold/40 text-gold">
              {stats.total_members} Members
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="text-center p-2 rounded-lg bg-primary-warm">
              <p className="font-serif text-lg font-bold text-heading">{stats.baptised_count}</p>
              <p className="text-caption">Baptised</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-primary-warm">
              <p className="font-serif text-lg font-bold text-heading">{stats.home_cell_members}</p>
              <p className="text-caption">In Cells</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-primary-warm">
              <p className="font-serif text-lg font-bold text-heading">{stats.by_marital_status.find(m => m.status === 'Married')?.count ?? 0}</p>
              <p className="text-caption">Married</p>
            </div>
          </div>

          <p className="text-[10px] text-caption/60 text-center italic">
            Full breakdown of marital status, age groups, home cells, and districts included in print
          </p>
        </div>

        <Button
          onClick={handlePrint}
          variant="outline"
          className="w-full gap-2 border-primary-deep/30 text-primary-deep hover:bg-primary-deep hover:text-white transition-all duration-200"
        >
          <Printer className="w-4 h-4" />
          Print / Save as PDF
        </Button>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// Main client component
// ─────────────────────────────────────────────────────────────

export function ReportsClient({ stats, homeCells, districts }: ReportsClientProps) {
  return (
    <div className="space-y-6">
      <SummarySection stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExportSection stats={stats} homeCells={homeCells} districts={districts} />
        <PrintSection stats={stats} />
      </div>
    </div>
  );
}