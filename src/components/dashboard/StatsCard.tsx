'use client';

import { useEffect, useRef, useState } from 'react';
import { Users, BookOpen, Home, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '@/types';

// ─────────────────────────────────────────────────────────────
// Animated counter hook
// ─────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return value;
}

// ─────────────────────────────────────────────────────────────
// Single stat card
// ─────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  subLabel: string;
  icon: React.ElementType;
  accent: 'gold' | 'green' | 'blue' | 'terracotta';
  delay?: number;
}

const ACCENT_STYLES = {
  gold:      { icon: 'bg-gold/15 text-gold',        bar: 'bg-gold',         num: 'text-heading' },
  green:     { icon: 'bg-forest-green/15 text-forest-green', bar: 'bg-forest-green', num: 'text-heading' },
  blue:      { icon: 'bg-primary-deep/10 text-primary-deep', bar: 'bg-primary-deep', num: 'text-heading' },
  terracotta:{ icon: 'bg-terracotta/15 text-terracotta', bar: 'bg-terracotta', num: 'text-heading' },
};

function StatCard({ label, value, subLabel, icon: Icon, accent, delay = 0 }: StatCardProps) {
  const styles = ACCENT_STYLES[accent];
  const count = useCountUp(value, 1000 + delay);

  return (
    <div
      className="relative bg-primary-warm border border-neutral-surface rounded-2xl p-6 overflow-hidden shadow-sm
                 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle top accent bar */}
      <div className={cn('absolute top-0 left-6 right-6 h-0.5 rounded-b-full opacity-60', styles.bar)} />

      {/* Icon */}
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', styles.icon)}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Number */}
      <p className={cn('font-serif text-4xl font-bold tracking-tight mb-1', styles.num)}>
        {count.toLocaleString()}
      </p>

      {/* Label */}
      <p className="text-sm font-semibold text-heading">{label}</p>
      <p className="text-xs text-caption mt-0.5">{subLabel}</p>

      {/* Decorative corner element */}
      <div className={cn(
        'absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-[0.04] group-hover:opacity-[0.07] transition-opacity',
        styles.bar
      )} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Stats cards grid
// ─────────────────────────────────────────────────────────────

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const baptismPct = stats.total_members > 0
    ? Math.round((stats.baptised_count / stats.total_members) * 100)
    : 0;

  const cellPct = stats.total_members > 0
    ? Math.round((stats.home_cell_members / stats.total_members) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        label="Total Members"
        value={stats.total_members}
        subLabel="On the church directory"
        icon={Users}
        accent="blue"
        delay={0}
      />
      <StatCard
        label="Baptised"
        value={stats.baptised_count}
        subLabel={`${baptismPct}% of congregation`}
        icon={BookOpen}
        accent="gold"
        delay={80}
      />
      <StatCard
        label="In Home Cells"
        value={stats.home_cell_members}
        subLabel={`${cellPct}% cell coverage`}
        icon={Home}
        accent="green"
        delay={160}
      />
      <StatCard
        label="Joined This Year"
        value={stats.recent_members.length}
        subLabel={`New in ${new Date().getFullYear()}`}
        icon={UserPlus}
        accent="terracotta"
        delay={240}
      />
    </div>
  );
}