import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import { FactorImpact } from '@/lib/types';

export interface FactorBarsProps {
  factors: FactorImpact[];
}

export const FactorBars: React.FC<FactorBarsProps> = ({ factors }) => {
  if (!factors || factors.length === 0) {
    return (
      <div className="text-xs text-[#64748B] italic py-2">
        Baseline inputs match median student traits; minimal feature deviations observed.
      </div>
    );
  }

  // Find max absolute impact to normalize bar width (at least 2.0 pts scale)
  const maxImpact = Math.max(...factors.map((f) => Math.abs(f.impact)), 2.0);

  return (
    <div className="space-y-3">
      {factors.map((factor, idx) => {
        const isPositive = factor.impact >= 0;
        const widthPct = Math.min((Math.abs(factor.impact) / maxImpact) * 100, 100);

        return (
          <div key={`${factor.feature}-${idx}`} className="flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#0B2A4A] flex items-center gap-1.5">
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5 text-[#059669]" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-[#DC2626]" />
                )}
                {factor.label}
              </span>
              <span
                className={clsx(
                  'font-bold tabular-nums',
                  isPositive ? 'text-[#059669]' : 'text-[#DC2626]'
                )}
              >
                {isPositive ? `+${factor.impact.toFixed(2)}` : factor.impact.toFixed(2)} pts
              </span>
            </div>

            {/* Bar progress track */}
            <div className="h-2 w-full bg-[#F1F5F9] rounded-full overflow-hidden flex">
              <div
                className={clsx(
                  'h-full rounded-full transition-all duration-500',
                  isPositive ? 'bg-[#059669]' : 'bg-[#DC2626]'
                )}
                style={{ width: `${Math.max(widthPct, 6)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
