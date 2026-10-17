import React from 'react';
import { ConfidenceRange } from '@/lib/types';

export interface GaugeProps {
  value: number; // 0 to 20
  confidenceRange?: ConfidenceRange;
  max?: number;
}

export const Gauge: React.FC<GaugeProps> = ({ value, confidenceRange, max = 20 }) => {
  // Clamp value between 0 and max
  const clampedValue = Math.min(Math.max(value, 0), max);
  // Calculate angle: 180 degrees semicircle (from -180 deg (left) to 0 deg (right))
  const percentage = clampedValue / max;
  const needleAngle = -180 + percentage * 180;

  // Arc path constants (viewBox: 0 0 200 115)
  const cx = 100;
  const cy = 100;
  const r = 75;

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="relative w-56 h-32 flex items-center justify-center overflow-visible">
        <svg viewBox="0 0 200 115" className="w-full h-full overflow-visible">
          <defs>
            {/* Color gradients for gauge track */}
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="45%" stopColor="#DC2626" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="68%" stopColor="#D97706" />
              <stop offset="70%" stopColor="#059669" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Background track arc */}
          <path
            d={`M 25,100 A ${r},${r} 0 0,1 175,100`}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Colored segmented arc */}
          <path
            d={`M 25,100 A ${r},${r} 0 0,1 175,100`}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray="235.6"
            strokeDashoffset="0"
          />

          {/* Scale indicators */}
          <text x="22" y="114" fontSize="10" fontWeight="600" fill="#64748B" textAnchor="middle">
            0
          </text>
          <text x="100" y="24" fontSize="10" fontWeight="600" fill="#64748B" textAnchor="middle">
            10 (Pass)
          </text>
          <text x="178" y="114" fontSize="10" fontWeight="600" fill="#64748B" textAnchor="middle">
            20
          </text>

          {/* Center needle pivot */}
          <circle cx={cx} cy={cy} r="7" fill="#0B2A4A" />

          {/* Needle */}
          <g transform={`rotate(${needleAngle} ${cx} ${cy})`} className="transition-transform duration-500 ease-out">
            <line
              x1={cx}
              y1={cy}
              x2={cx + 62}
              y2={cy}
              stroke="#0B2A4A"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <polygon
              points={`${cx + 66},${cy} ${cx + 56},${cy - 4} ${cx + 56},${cy + 4}`}
              fill="#0B2A4A"
            />
          </g>
        </svg>

        {/* Display Score overlay */}
        <div className="absolute bottom-0 text-center flex flex-col items-center">
          <span className="text-3xl font-extrabold text-[#0B2A4A] tabular-nums tracking-tight">
            {clampedValue.toFixed(1)}
          </span>
          <span className="text-xs text-[#64748B] font-medium -mt-0.5">Scale 0 – 20</span>
        </div>
      </div>

      {confidenceRange && (
        <div className="mt-3 text-xs text-[#64748B] text-center bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-lg">
          <span className="font-semibold text-[#0B2A4A]">80% Confidence Interval:</span>{' '}
          <span className="tabular-nums font-medium">
            {confidenceRange.min.toFixed(1)} – {confidenceRange.max.toFixed(1)} pts
          </span>
        </div>
      )}
    </div>
  );
};
