'use client';

import { Home, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CellEntry {
  home_cell: string;
  count: number;
}

interface HomeCellDistributionProps {
  data: CellEntry[];
  total: number; // total members in any home cell
}

export function HomeCellDistribution({ data, total }: HomeCellDistributionProps) {
  const max = data[0]?.count ?? 1; // data is already sorted desc

  return (
    <div className="bg-primary-warm border border-neutral-surface rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-surface/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary-deep/10 flex items-center justify-center">
            <Home className="w-3.5 h-3.5 text-primary-deep" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-heading leading-tight">Home Cells</h3>
            <p className="text-xs text-caption mt-0.5">
              {total} member{total !== 1 ? 's' : ''} across {data.length} cell{data.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Cell list */}
      <div className="flex-1 overflow-y-auto px-5 py-3">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 gap-2">
            <div className="w-10 h-10 rounded-full bg-neutral-surface flex items-center justify-center">
              <Users className="w-4 h-4 text-caption" />
            </div>
            <p className="text-sm text-caption">No home cell data yet</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {data.map((entry, idx) => {
              const pct = Math.round((entry.count / max) * 100);
              const memberPct = total > 0 ? Math.round((entry.count / total) * 100) : 0;
              return (
                <div key={entry.home_cell} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Rank number */}
                      <span className={cn(
                        'text-[10px] font-bold w-4 shrink-0 tabular-nums',
                        idx === 0 ? 'text-gold' : 'text-caption/50'
                      )}>
                        {idx + 1}
                      </span>
                      <span className="text-xs font-medium text-heading truncate">
                        {entry.home_cell}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] text-caption">{memberPct}%</span>
                      <span className="text-xs font-semibold text-heading tabular-nums w-5 text-right">
                        {entry.count}
                      </span>
                    </div>
                  </div>
                  {/* Bar */}
                  <div className="h-1 bg-neutral-surface rounded-full overflow-hidden ml-6">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        idx === 0 ? 'bg-gold' : 'bg-primary-deep/40'
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}