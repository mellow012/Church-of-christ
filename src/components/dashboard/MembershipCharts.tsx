'use client';

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Legend
} from 'recharts';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '@/types';

// ─────────────────────────────────────────────────────────────
// Theme colours — matching globals.css exactly
// ─────────────────────────────────────────────────────────────

const PALETTE = {
  blue:       '#1e3a5f',
  gold:       '#c9a227',
  green:      '#2d5a3d',
  amber:      '#d4a574',
  terracotta: '#c17f59',
  muted1:     '#5a7a9f',
  muted2:     '#8faa6b',
};

const MARITAL_COLORS: Record<string, string> = {
  Married:   PALETTE.blue,
  Single:    PALETTE.gold,
  Widowed:   PALETTE.muted1,
  Divorced:  PALETTE.amber,
  Separated: PALETTE.terracotta,
  Unknown:   '#d1ccc4',
};

const AGE_COLORS: Record<string, string> = {
  'Under 18': PALETTE.amber,
  '18–35':    PALETTE.gold,
  '36–50':    PALETTE.blue,
  '51–65':    PALETTE.muted1,
  '65+':      PALETTE.green,
  'Unknown':  '#d1ccc4',
};

// ─────────────────────────────────────────────────────────────
// Shared custom tooltip
// ─────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, total }: {
  active?: boolean;
  payload?: { name: string; value: number; fill?: string }[];
  total?: number;
}) {
  if (!active || !payload?.length) return null;
  const { name, value, fill } = payload[0];
  const pct = total ? Math.round((value / total) * 100) : 0;

  return (
    <div className="bg-primary-deep text-white px-3 py-2 rounded-lg shadow-xl text-xs">
      <div className="flex items-center gap-2 mb-0.5">
        {fill && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: fill }} />}
        <span className="font-semibold">{name}</span>
      </div>
      <span className="text-white/70">{value} members</span>
      {total && <span className="text-gold ml-1.5">({pct}%)</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────────────────────

function ChartCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      'bg-primary-warm border border-neutral-surface rounded-2xl p-6 shadow-sm',
      className
    )}>
      <div className="mb-5">
        <h3 className="font-serif text-lg text-heading">{title}</h3>
        {subtitle && <p className="text-xs text-caption mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. Marital status — donut chart + legend
// ─────────────────────────────────────────────────────────────

function MaritalStatusChart({ data, total }: {
  data: DashboardStats['by_marital_status'];
  total: number;
}) {
  if (!data.length) return <p className="text-caption text-sm text-center py-8">No data yet</p>;

  return (
    <ChartCard title="Marital Status" subtitle="Distribution across the congregation">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donut */}
        <div className="w-48 h-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={76}
                paddingAngle={3}
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={MARITAL_COLORS[entry.status] ?? '#d1ccc4'}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => (
                  <ChartTooltip active={active} payload={payload as never} total={total} />
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Centre label (positioned via negative margin trick) */}
        {/* Legend */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {data.map((entry) => {
            const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0;
            const color = MARITAL_COLORS[entry.status] ?? '#d1ccc4';
            return (
              <div key={entry.status} className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                <span className="text-sm text-body flex-1 truncate">{entry.status}</span>
                <span className="text-sm font-semibold text-heading tabular-nums">{entry.count}</span>
                <span className="text-xs text-caption w-8 text-right tabular-nums">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </ChartCard>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. Age groups — vertical bar chart
// ─────────────────────────────────────────────────────────────

function AgeGroupChart({ data, total }: {
  data: DashboardStats['by_age_group'];
  total: number;
}) {
  // Filter out empty groups for cleaner chart
  const filtered = data.filter((d) => d.count > 0);

  if (!filtered.length) return <p className="text-caption text-sm text-center py-8">No age data recorded</p>;

  return (
    <ChartCard title="Age Groups" subtitle="Based on members with known dates of birth">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={filtered}
          margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
          barSize={32}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e8e4df"
            vertical={false}
          />
          <XAxis
            dataKey="group"
            tick={{ fontSize: 11, fill: '#6b6b6b', fontFamily: 'var(--font-sans)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6b6b6b', fontFamily: 'var(--font-sans)' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(201, 162, 39, 0.06)' }}
            content={({ active, payload }) => (
              <ChartTooltip
                active={active}
                payload={payload?.map(p => ({
                  name: String(p.payload.group),
                  value: p.value as number,
                  fill: AGE_COLORS[p.payload.group] ?? PALETTE.blue,
                }))}
                total={total}
              />
            )}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {filtered.map((entry) => (
              <Cell
                key={entry.label}
                fill={AGE_COLORS[entry.count] ?? PALETTE.blue}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. Home cell breakdown — horizontal bar chart
// ─────────────────────────────────────────────────────────────

function HomeCellChart({ data, total }: {
  data: DashboardStats['by_home_cell'];
  total: number;
}) {
  if (!data.length) return (
    <ChartCard title="Home Cell Distribution" subtitle="Top 10 home cells by membership">
      <p className="text-caption text-sm text-center py-8">No home cell data recorded</p>
    </ChartCard>
  );

  const max = Math.max(...data.map((d) => d.count));

  return (
    <ChartCard title="Home Cell Distribution" subtitle="Top 10 home cells by membership">
      <div className="space-y-3">
        {data.map((entry, i) => {
          const pct = max > 0 ? (entry.count / max) * 100 : 0;
          const memberPct = total > 0 ? Math.round((entry.count / total) * 100) : 0;
          // Gradient from gold → blue as rank decreases
          const opacity = 1 - (i / data.length) * 0.45;

          return (
            <div key={entry.home_cell} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-body font-medium truncate max-w-[60%]">{entry.home_cell}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-caption">{memberPct}%</span>
                  <span className="font-semibold text-heading tabular-nums w-6 text-right">
                    {entry.count}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-neutral-surface rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: PALETTE.gold,
                    opacity,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. District breakdown — horizontal bars
// ─────────────────────────────────────────────────────────────

function DistrictChart({ data, total }: {
  data: DashboardStats['by_district'];
  total: number;
}) {
  if (!data.length) return (
    <ChartCard title="District Origin" subtitle="Home districts of congregation members">
      <p className="text-caption text-sm text-center py-8">No district data recorded</p>
    </ChartCard>
  );

  const max = Math.max(...data.map((d) => d.count));

  return (
    <ChartCard title="District Origin" subtitle="Home districts of congregation members">
      <div className="space-y-3">
        {data.map((entry, i) => {
          const pct = max > 0 ? (entry.count / max) * 100 : 0;
          const memberPct = total > 0 ? Math.round((entry.count / total) * 100) : 0;
          const opacity = 1 - (i / data.length) * 0.45;

          return (
            <div key={entry.home_district} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-body font-medium truncate max-w-[60%]">{entry.home_district}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-caption">{memberPct}%</span>
                  <span className="font-semibold text-heading tabular-nums w-6 text-right">
                    {entry.count}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-neutral-surface rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: PALETTE.blue,
                    opacity,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. Baptism status — simple two-segment donut
// ─────────────────────────────────────────────────────────────

function BaptismStatusChart({ stats }: { stats: DashboardStats }) {
  const baptised = stats.baptised_count;
  const unknown = stats.total_members - baptised;
  const pct = stats.total_members > 0
    ? Math.round((baptised / stats.total_members) * 100)
    : 0;

  const data = [
    { name: 'Baptism Date Known', value: baptised, color: PALETTE.green },
    { name: 'Unknown',            value: unknown,  color: '#e8e4df'     },
  ].filter((d) => d.value > 0);

  return (
    <ChartCard title="Baptism Status" subtitle="Members with a recorded baptism date">
      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="relative w-36 h-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={62}
                paddingAngle={3}
                strokeWidth={0}
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => (
                  <ChartTooltip active={active} payload={payload as never} total={stats.total_members} />
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Centre label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-serif text-2xl font-bold text-heading">{pct}%</span>
            <span className="text-[10px] text-caption leading-tight text-center">baptised</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {data.map((entry) => (
            <div key={entry.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                  <span className="text-body">{entry.name}</span>
                </div>
                <span className="font-semibold text-heading tabular-nums">{entry.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}

// ─────────────────────────────────────────────────────────────
// Composed export — all charts together
// ─────────────────────────────────────────────────────────────

interface MembershipChartsProps {
  stats: DashboardStats;
}

export function MembershipCharts({ stats }: MembershipChartsProps) {
  const total = stats.total_members;

  return (
    <div className="space-y-4">
      {/* Row 1: Marital status (wider) + Baptism (narrower) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MaritalStatusChart data={stats.by_marital_status} total={total} />
        </div>
        <div className="lg:col-span-1">
          <BaptismStatusChart stats={stats} />
        </div>
      </div>

      {/* Row 2: Age groups (full width) */}
      <AgeGroupChart data={stats.by_age_group} total={total} />

      {/* Row 3: Home cells + Districts side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HomeCellChart data={stats.by_home_cell} total={total} />
        <DistrictChart data={stats.by_district} total={total} />
      </div>
    </div>
  );
}