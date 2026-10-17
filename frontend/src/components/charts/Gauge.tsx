import React from 'react';
import { ConfidenceRange } from '@/lib/types';

export interface GaugeProps {
  value?: number | null; // 0 to 20
  confidenceRange?: ConfidenceRange | null;
  max?: number;
}

export const Gauge: React.FC<GaugeProps> = ({ value, confidenceRange, max = 20 }) => {
  const isValid = value !== undefined && value !== null && !isNaN(value);
  const clampedValue = isValid ? Math.min(Math.max(Number(value), 0), max) : 0;
  const percentage = clampedValue / max;
  const needleAngle = percentage * 180; // 0 deg = left (0), 90 deg = top (10), 180 deg = right (20)

  // Risk text for accessibility
  const riskText = clampedValue < 10 ? 'high risk' : clampedValue < 14 ? 'medium risk' : 'low risk';
  const ariaLabel = isValid
    ? `Predicted grade ${clampedValue.toFixed(1)} out of ${max}, ${riskText}`
    : 'Predicted grade not available';

  return (
    <div
      className="w-full max-w-[320px] mx-auto flex flex-col items-center select-none"
      role="img"
      aria-label={ariaLabel}
    >
      {/* SVG Arc and Needle - no text overlaps inside */}
      <div className="w-full relative overflow-visible">
        <svg
          viewBox="0 0 240 140"
          className="w-full h-auto overflow-visible block"
          aria-hidden="true"
        >
          {/* Background track arc (neutral) */}
          <path
            d="M 30 125 A 90 90 0 0 1 210 125"
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="16"
          />

          {/* Three Risk Band Arcs: Red (0-10), Amber (10-14), Green (14-20) */}
          {/* Red Zone: 0 to 10 (180 deg to 90 deg) */}
          <path
            d="M 30 125 A 90 90 0 0 1 120 35"
            fill="none"
            stroke="#EF4444"
            strokeWidth="16"
            strokeLinecap="butt"
          />
          {/* Left round end cap */}
          <circle cx="30" cy="125" r="8" fill="#EF4444" />

          {/* Amber Zone: 10 to 14 (90 deg to 54 deg) */}
          <path
            d="M 120 35 A 90 90 0 0 1 172.9 52.2"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="16"
            strokeLinecap="butt"
          />

          {/* Green Zone: 14 to 20 (54 deg to 0 deg) */}
          <path
            d="M 172.9 52.2 A 90 90 0 0 1 210 125"
            fill="none"
            stroke="#10B981"
            strokeWidth="16"
            strokeLinecap="butt"
          />
          {/* Right round end cap */}
          <circle cx="210" cy="125" r="8" fill="#10B981" />

          {/* Pass threshold marker tick at G3 = 10 (crossing the arc) */}
          <line
            x1="120"
            y1="47"
            x2="120"
            y2="23"
            stroke="#0B2A4A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Pass 10 label placed outside the arc with >= 8px clearance */}
          <text
            x="120"
            y="14"
            fontSize="10"
            fontWeight="700"
            fill="#0B2A4A"
            textAnchor="middle"
            letterSpacing="0.02em"
          >
            Pass 10
          </text>

          {/* End labels (0 and 20) placed below the arc ends */}
          <text
            x="30"
            y="138"
            fontSize="11"
            fontWeight="600"
            fill="#64748B"
            textAnchor="middle"
          >
            0
          </text>
          <text
            x="210"
            y="138"
            fontSize="11"
            fontWeight="600"
            fill="#64748B"
            textAnchor="middle"
          >
            20
          </text>

          {/* Needle rendered above arc; length 62px < inner radius 82px */}
          {isValid && (
            <g
              style={{
                transform: `rotate(${needleAngle}deg)`,
                transformOrigin: '120px 125px',
              }}
              className="transition-transform duration-700 ease-out motion-reduce:transition-none"
            >
              {/* Tapered needle pointer pointing left at 0 deg */}
              <polygon
                points="120,122.5 58,125 120,127.5"
                fill="#0B2A4A"
              />
            </g>
          )}

          {/* Hub circle in center */}
          <circle cx="120" cy="125" r="6.5" fill="#0B2A4A" />
          <circle cx="120" cy="125" r="2.5" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Grade number and caption rendered cleanly BELOW the gauge as HTML text */}
      <div className="text-center mt-2 flex flex-col items-center">
        <div className="text-4xl font-extrabold text-[#0B2A4A] tabular-nums tracking-tight">
          {isValid ? clampedValue.toFixed(1) : '—'}
        </div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
          out of {max}
        </div>
      </div>

      {/* Optional Confidence Interval */}
      {confidenceRange && (
        <div className="mt-2.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-center tabular-nums">
          <span className="font-semibold text-[#0B2A4A]">80% Confidence Interval:</span>{' '}
          <span className="font-medium">
            {confidenceRange.min.toFixed(1)} – {confidenceRange.max.toFixed(1)} pts
          </span>
        </div>
      )}
    </div>
  );
};
