  'use client';

  import { useState, useMemo, useCallback, useTransition } from 'react';
  import { useRouter } from 'next/navigation';
  import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
  } from '@tanstack/react-table';
  import Fuse from 'fuse.js';
  import { cn, formatDate, getFullName, getInitials, calculateAge } from '@/lib/utils';
  import { deleteMember, getAllMembers } from '@/lib/queries';
  import { membersToCSV, } from '@/lib/csv';
  import type { Member, MaritalStatus, EmploymentStatus } from '@/types';

  // ── UI ────────────────────────────────────────────────────────
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Badge } from '@/components/ui/badge';
  import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  } from '@/components/ui/select';
  import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  } from '@/components/ui/table';
  import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
  } from '@/components/ui/dialog';
  import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
  } from '@/components/ui/tooltip';
  import {
    Search, SlidersHorizontal, FileSpreadsheet, Plus, Pencil, Trash2,
    ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight,
    Users, X, Loader2,
  } from 'lucide-react';

  // ─────────────────────────────────────────────────────────────
  // Types
  // ─────────────────────────────────────────────────────────────

  interface MembersTableProps {
    initialMembers: Member[];
    homeCells: string[];
    districts: string[];
  }

  // Internal filter state — uses `undefined` (not 'all') to mean "no filter".
  // Kept separate from the DB-facing MemberFilters type.
  interface TableFilters {
    marital_status?: MaritalStatus;
    home_cell?: string;
    home_district?: string;
    baptism_known?: boolean;
  }

  const PAGE_SIZE_OPTIONS = [10, 20, 50];
  const DEFAULT_PAGE_SIZE = 20;

  const MARITAL_OPTIONS: MaritalStatus[] = ['Married', 'Single', 'Widowed', 'Divorced', 'Separated'];

  const FUSE_OPTIONS = {
    keys: [
      { name: 'first_name',    weight: 0.35 },
      { name: 'last_name',     weight: 0.35 },
      { name: 'middle_name',   weight: 0.1  },
      { name: 'email',         weight: 0.1  },
      { name: 'home_cell',     weight: 0.05 },
      { name: 'home_district', weight: 0.05 },
    ],
    threshold: 0.35,
    includeScore: true,
    minMatchCharLength: 2,
  };

  // ─────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────

  function maritalBadgeStyle(status: MaritalStatus | null) {
    switch (status) {
      case 'Married':   return 'bg-forest-green/15 text-forest-green border-forest-green/30';
      case 'Single':    return 'bg-primary-deep/10 text-primary-deep border-primary-deep/20';
      case 'Widowed':   return 'bg-neutral-surface text-caption border-neutral-surface';
      case 'Divorced':  return 'bg-amber/20 text-amber border-amber/30';
      case 'Separated': return 'bg-terracotta/15 text-terracotta border-terracotta/30';
      default:          return 'bg-neutral-surface text-caption border-neutral-surface';
    }
  }

  function MemberAvatar({ member }: { member: Member }) {
    const initials = getInitials(member.first_name, member.last_name);
    const hue = (member.first_name.charCodeAt(0) + member.last_name.charCodeAt(0)) % 360;
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 select-none"
        style={{ backgroundColor: `hsl(${hue}, 45%, 38%)` }}
      >
        {initials}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Filter panel
  // ─────────────────────────────────────────────────────────────

  function FilterPanel({
    filters, onChange, homeCells, districts, onReset, activeFilterCount,
  }: {
    filters: TableFilters;
    onChange: (f: Partial<TableFilters>) => void;
    homeCells: string[];
    districts: string[];
    onReset: () => void;
    activeFilterCount: number;
  }) {
    return (
      <div className="bg-primary-warm border border-neutral-surface rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-heading">Filter Members</p>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onReset}
              className="text-caption hover:text-terracotta h-7 px-2 text-xs">
              <X className="w-3 h-3 mr-1" />Clear all
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {/* Marital status — undefined means "all" */}
          <div className="space-y-1">
            <label className="text-xs text-caption font-medium">Marital Status</label>
            <Select
              value={filters.marital_status ?? 'all'}
              onValueChange={(v) =>
                onChange({ marital_status: v === 'all' ? undefined : (v as MaritalStatus) })
              }
            >
              <SelectTrigger className="h-8 text-xs bg-background border-neutral-surface">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {MARITAL_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Home cell */}
          <div className="space-y-1">
            <label className="text-xs text-caption font-medium">Home Cell</label>
            <Select
              value={filters.home_cell ?? 'all'}
              onValueChange={(v) =>
                onChange({ home_cell: v === 'all' ? undefined : v })
              }
            >
              <SelectTrigger className="h-8 text-xs bg-background border-neutral-surface">
                <SelectValue placeholder="All cells" />
              </SelectTrigger>
              <SelectContent className="max-h-52">
                <SelectItem value="all">All cells</SelectItem>
                {homeCells.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* District */}
          <div className="space-y-1">
            <label className="text-xs text-caption font-medium">Home District</label>
            <Select
              value={filters.home_district ?? 'all'}
              onValueChange={(v) =>
                onChange({ home_district: v === 'all' ? undefined : v })
              }
            >
              <SelectTrigger className="h-8 text-xs bg-background border-neutral-surface">
                <SelectValue placeholder="All districts" />
              </SelectTrigger>
              <SelectContent className="max-h-52">
                <SelectItem value="all">All districts</SelectItem>
                {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Baptism — boolean | undefined, no 'all' string */}
          <div className="space-y-1">
            <label className="text-xs text-caption font-medium">Baptism Status</label>
            <Select
              value={
                filters.baptism_known === true  ? 'yes'
                : filters.baptism_known === false ? 'no'
                : 'all'
              }
              onValueChange={(v) =>
                onChange({
                  baptism_known: v === 'all' ? undefined : v === 'yes',
                })
              }
            >
              <SelectTrigger className="h-8 text-xs bg-background border-neutral-surface">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Baptism date known</SelectItem>
                <SelectItem value="no">Date unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Main component
  // ─────────────────────────────────────────────────────────────

  export function MembersTable({ initialMembers, homeCells, districts }: MembersTableProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<TableFilters>({});
    const [sorting, setSorting] = useState<SortingState>([{ id: 'last_name', desc: false }]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Active filter count — undefined means inactive, so just count defined keys
    const activeFilterCount = useMemo(() =>
      Object.values(filters).filter((v) => v !== undefined).length,
    [filters]);

    // Filter + fuzzy search pipeline
    const processedMembers = useMemo(() => {
      let result = initialMembers;

      if (filters.marital_status !== undefined)
        result = result.filter((m) => m.marital_status === filters.marital_status);

      if (filters.home_cell !== undefined)
        result = result.filter((m) => m.home_cell === filters.home_cell);

      if (filters.home_district !== undefined)
        result = result.filter((m) => m.home_district === filters.home_district);

      if (filters.baptism_known !== undefined)
        result = result.filter((m) => m.baptism_known === filters.baptism_known);

      if (search.trim().length >= 2) {
        const fuse = new Fuse(result, FUSE_OPTIONS);
        result = fuse.search(search.trim()).map((r) => r.item);
      }

      return result;
    }, [initialMembers, search, filters]);

    const totalPages = Math.max(1, Math.ceil(processedMembers.length / pageSize));
    const paginatedMembers = useMemo(() => {
      const from = (page - 1) * pageSize;
      return processedMembers.slice(from, from + pageSize);
    }, [processedMembers, page, pageSize]);

    const handleSearchChange = useCallback((v: string) => { setSearch(v); setPage(1); }, []);
    const handleFilterChange = useCallback((partial: Partial<TableFilters>) => {
      setFilters((prev) => ({ ...prev, ...partial }));
      setPage(1);
    }, []);
    const resetFilters = useCallback(() => { setFilters({}); setPage(1); }, []);

    // Column definitions
    const columns: ColumnDef<Member>[] = useMemo(() => [
      {
        id: 'name',
        accessorFn: (row) => getFullName(row),
        header: 'Member',
        cell: ({ row }) => {
          const m = row.original;
          const age = m.dob_known ? calculateAge(m.dob) : null;
          return (
            <div className="flex items-center gap-3 min-w-0">
              <MemberAvatar member={m} />
              <div className="min-w-0">
                <p className="font-medium text-heading truncate text-sm">{getFullName(m)}</p>
                {age !== null && <p className="text-xs text-caption">Age {age}</p>}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'last_name',
        header: 'Last Name',
        cell: () => null,
        enableHiding: true,
      },
      {
        id: 'contact',
        header: 'Contact',
        cell: ({ row }) => {
          const m = row.original;
          return (
            <div className="space-y-0.5 text-xs text-body min-w-0">
              {m.email && <p className="truncate max-w-[180px]">{m.email}</p>}
              {m.phones && m.phones.length > 0 && <p className="text-caption">{m.phones[0]}</p>}
              {!m.email && (!m.phones || m.phones.length === 0) && (
                <p className="text-caption italic">No contact info</p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'marital_status',
        header: 'Status',
        cell: ({ row }) => {
          const s = row.original.marital_status;
          if (!s) return <span className="text-caption text-xs">—</span>;
          return (
            <Badge variant="outline" className={cn('text-xs font-medium', maritalBadgeStyle(s))}>
              {s}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'home_cell',
        header: 'Home Cell',
        cell: ({ row }) => {
          const m = row.original;
          if (!m.home_cell_known || !m.home_cell)
            return <span className="text-caption text-xs">—</span>;
          return <span className="text-xs text-body">{m.home_cell}</span>;
        },
      },
      {
        accessorKey: 'home_district',
        header: 'District',
        cell: ({ row }) => (
          <span className="text-xs text-body">{row.original.home_district ?? '—'}</span>
        ),
      },
      {
        id: 'baptism',
        header: 'Baptised',
        cell: ({ row }) => {
          const m = row.original;
          return m.baptism_known ? (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-forest-green" />
              <span className="text-xs text-forest-green font-medium">Yes</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-neutral-surface border border-caption/30" />
              <span className="text-xs text-caption">Unknown</span>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const m = row.original;
          return (
            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm"
                      onClick={(e) => { e.stopPropagation(); router.push(`/members/${m.id}/edit`); }}
                      className="h-7 w-7 p-0 text-caption hover:text-gold hover:bg-gold/10">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit member</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(m); }}
                      className="h-7 w-7 p-0 text-caption hover:text-terracotta hover:bg-terracotta/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete member</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        },
      },
    ], [router]);

    const table = useReactTable({
      data: paginatedMembers,
      columns,
      state: { sorting, columnVisibility: { last_name: false } },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      manualPagination: true,
    });

    const handleDelete = useCallback(async () => {
      if (!deleteTarget) return;
      setIsDeleting(true);
      try {
        await deleteMember(deleteTarget.id);
        setDeleteTarget(null);
        startTransition(() => router.refresh());
      } catch (err) {
        console.error('Delete failed:', err);
      } finally {
        setIsDeleting(false);
      }
    }, [deleteTarget, router]);

    const handleExport = useCallback(async () => {
      setIsExporting(true);
      try {
        const all = await getAllMembers();
        const csv = membersToCSV(all);
        const date = new Date().toISOString().slice(0, 10);
        downloadCSV(csv, `church-members-${date}.csv`);
      } catch (err) {
        console.error('Export failed:', err);
      } finally {
        setIsExporting(false);
      }
    }, []);

    function SortIcon({ columnId }: { columnId: string }) {
      const col = table.getColumn(columnId);
      if (!col?.getCanSort()) return null;
      const sorted = col.getIsSorted();
      if (sorted === 'asc')  return <ChevronUp className="w-3.5 h-3.5 text-gold ml-1 inline" />;
      if (sorted === 'desc') return <ChevronDown className="w-3.5 h-3.5 text-gold ml-1 inline" />;
      return <ChevronsUpDown className="w-3.5 h-3.5 text-caption/50 ml-1 inline" />;
    }

    return (
      <div className="space-y-4">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-caption" />
            <Input
              placeholder="Search members..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-primary-warm border-neutral-surface focus:border-gold h-9"
            />
            {search && (
              <button onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-caption hover:text-body">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters((v) => !v)}
              className={cn('border-neutral-surface h-9 text-sm gap-2',
                showFilters ? 'border-gold text-gold bg-gold/5' : 'text-body')}>
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-gold text-primary-deep text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}
              className="border-neutral-surface text-body h-9 text-sm gap-2">
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              Export
            </Button>

            <Button size="sm" onClick={() => router.push('/members/new')}
              className="bg-gold hover:bg-amber text-primary-deep font-semibold h-9 text-sm gap-1.5">
              <Plus className="w-4 h-4" />Add Member
            </Button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <FilterPanel
            filters={filters}
            onChange={handleFilterChange}
            homeCells={homeCells}
            districts={districts}
            onReset={resetFilters}
            activeFilterCount={activeFilterCount}
          />
        )}

        {/* Results summary */}
        <div className="flex items-center justify-between text-xs text-caption px-0.5">
          <span>
            {processedMembers.length === initialMembers.length
              ? `${initialMembers.length} members total`
              : `${processedMembers.length} of ${initialMembers.length} members`}
            {search && <span className="ml-1 text-gold">matching &ldquo;{search}&rdquo;</span>}
          </span>
          <div className="flex items-center gap-2">
            <span>Show</span>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="h-6 w-16 text-xs border-neutral-surface bg-transparent py-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>per page</span>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-neutral-surface overflow-hidden bg-primary-warm shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}
                    className="border-neutral-surface bg-background hover:bg-background">
                    {headerGroup.headers.map((header) => {
                      if (header.column.id === 'last_name') return null;
                      return (
                        <TableHead key={header.id}
                          className="text-xs font-semibold text-heading uppercase tracking-wide py-3 cursor-pointer select-none"
                          onClick={header.column.getToggleSortingHandler()}>
                          <span className="flex items-center">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <SortIcon columnId={header.column.id} />
                          </span>
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-neutral-surface flex items-center justify-center">
                          <Users className="w-6 h-6 text-caption" />
                        </div>
                        <div>
                          <p className="text-heading font-medium text-sm">No members found</p>
                          <p className="text-caption text-xs mt-1">
                            {search || activeFilterCount > 0
                              ? 'Try adjusting your search or filters'
                              : 'Add your first member to get started'}
                          </p>
                        </div>
                        {!search && activeFilterCount === 0 && (
                          <Button size="sm" onClick={() => router.push('/members/new')}
                            className="bg-gold hover:bg-amber text-primary-deep mt-1">
                            <Plus className="w-4 h-4 mr-1" />Add Member
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}
                      className={cn(
                        'group border-neutral-surface cursor-pointer transition-colors duration-100',
                        'hover:bg-gold/5 hover:border-gold/20',
                        isPending && 'opacity-60'
                      )}
                      onClick={() => router.push(`/members/${row.original.id}`)}>
                      {row.getVisibleCells().map((cell) => {
                        if (cell.column.id === 'last_name') return null;
                        return (
                          <TableCell key={cell.id} className="py-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-caption">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage(1)}
                disabled={page === 1} className="h-7 w-7 p-0 border-neutral-surface">
                <ChevronLeft className="w-3 h-3" /><ChevronLeft className="w-3 h-3 -ml-2" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1} className="h-7 w-7 p-0 border-neutral-surface">
                <ChevronLeft className="w-3 h-3" />
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5)         pageNum = i + 1;
                else if (page <= 3)          pageNum = i + 1;
                else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                else                         pageNum = page - 2 + i;
                return (
                  <Button key={pageNum} variant="outline" size="sm"
                    onClick={() => setPage(pageNum)}
                    className={cn('h-7 w-7 p-0 text-xs border-neutral-surface',
                      page === pageNum && 'bg-gold text-primary-deep border-gold font-bold')}>
                    {pageNum}
                  </Button>
                );
              })}

              <Button variant="outline" size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages} className="h-7 w-7 p-0 border-neutral-surface">
                <ChevronRight className="w-3 h-3" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(totalPages)}
                disabled={page === totalPages} className="h-7 w-7 p-0 border-neutral-surface">
                <ChevronRight className="w-3 h-3" /><ChevronRight className="w-3 h-3 -ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Delete dialog */}
        <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
          <DialogContent className="bg-primary-warm border-neutral-surface sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-heading">Remove Member</DialogTitle>
              <DialogDescription className="text-body">
                Are you sure you want to permanently remove{' '}
                <strong>{deleteTarget ? getFullName(deleteTarget) : ''}</strong> from the
                directory? This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 mt-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}
                className="border-neutral-surface">Cancel</Button>
              <Button onClick={handleDelete} disabled={isDeleting}
                className="bg-terracotta hover:bg-red-600 text-white">
                {isDeleting
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Removing...</>
                  : 'Yes, Remove'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  function downloadCSV(csv: string, arg1: string) {
      throw new Error('Function not implemented.');
  }
