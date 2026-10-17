import React, { useState } from 'react';
import { CorrelationData } from '@/lib/types';

export interface HeatmapProps {
  data: CorrelationData;
}

export const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  const [hoveredCell, setHoveredCell] = useState<{
    f1: string;
    f2: string;
    val: number;
    x: number;
    y: number;
  } | null>(null);

  if (!data || !data.features || !data.matrix) {
    return null;
  }

  const { features, matrix } = data;

  // Color mapping from correlation (-0.5 to +1.0)
  const getCellColor = (val: number) => {
    if (val >= 0.8) return '#1D4ED8';
    if (val >= 0.6) return '#2563EB';
    if (val >= 0.4) return '#60A5FA';
    if (val >= 0.2) return '#93C5FD';
    if (val >= 0.05) return '#DBEAFE';
    if (val >= -0.05) return '#F8FAFC';
    if (val >= -0.2) return '#FEE2E2';
    return '#F87171';
  };

  const getTextColor = (val: number) => {
    return Math.abs(val) > 0.4 ? '#FFFFFF' : '#0F172A';
  };

  return (
    <div className="relative overflow-x-auto p-2">
      <div className="inline-block min-w-full">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-2 text-left font-semibold text-[#64748B] w-28"></th>
              {features.map((f, i) => (
                <th key={i} className="p-2 text-center font-semibold text-[#0B2A4A] truncate max-w-[64px]" title={f}>
                  {f}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, rIdx) => (
              <tr key={rIdx}>
                <td className="p-2 text-left font-semibold text-[#0B2A4A] whitespace-nowrap">
                  {features[rIdx]}
                </td>
                {row.map((val, cIdx) => (
                  <td
                    key={cIdx}
                    className="p-1 text-center cursor-pointer transition-transform hover:scale-105"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredCell({
                        f1: features[rIdx],
                        f2: features[cIdx],
                        val,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <div
                      className="w-10 h-8 sm:w-12 sm:h-9 flex items-center justify-center rounded font-semibold tabular-nums text-[11px]"
                      style={{
                        backgroundColor: getCellColor(val),
                        color: getTextColor(val),
                      }}
                    >
                      {val.toFixed(2)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full px-3 py-1.5 bg-[#0B2A4A] text-white text-xs rounded-lg shadow-lg"
          style={{ left: hoveredCell.x, top: hoveredCell.y - 8 }}
        >
          <div className="font-semibold">
            {hoveredCell.f1} ↔ {hoveredCell.f2}
          </div>
          <div className="tabular-nums">Pearson r = {hoveredCell.val.toFixed(3)}</div>
        </div>
      )}
    </div>
  );
};
