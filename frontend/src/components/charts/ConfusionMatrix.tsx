import React from 'react';

export interface ConfusionMatrixProps {
  cm: {
    tn: number;
    fp: number;
    fn: number;
    tp: number;
    total: number;
  };
}

export const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({ cm }) => {
  if (!cm) return null;

  const tnPct = ((cm.tn / cm.total) * 100).toFixed(1);
  const fpPct = ((cm.fp / cm.total) * 100).toFixed(1);
  const fnPct = ((cm.fn / cm.total) * 100).toFixed(1);
  const tpPct = ((cm.tp / cm.total) * 100).toFixed(1);

  return (
    <div className="flex flex-col items-center max-w-sm mx-auto">
      <div className="text-xs font-semibold text-[#64748B] mb-2 uppercase tracking-wider">
        Predicted Class (Pass ≥ 10)
      </div>

      <div className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center text-xs w-full">
        <div />
        <div className="text-center font-semibold text-[#0B2A4A] pb-1">Predicted Fail (&lt; 10)</div>
        <div className="text-center font-semibold text-[#0B2A4A] pb-1">Predicted Pass (≥ 10)</div>

        {/* Row 1: Actual Fail */}
        <div className="font-semibold text-[#64748B] pr-2 text-right">Actual Fail</div>
        <div className="p-3 bg-[#EEF2FF] border border-[#BFDBFE] rounded-xl text-center">
          <div className="text-lg font-bold text-[#0B2A4A] tabular-nums">{cm.tn}</div>
          <div className="text-[11px] text-[#2563EB] font-medium">True Negative ({tnPct}%)</div>
        </div>
        <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-xl text-center">
          <div className="text-lg font-bold text-[#DC2626] tabular-nums">{cm.fp}</div>
          <div className="text-[11px] text-[#DC2626] font-medium">False Positive ({fpPct}%)</div>
        </div>

        {/* Row 2: Actual Pass */}
        <div className="font-semibold text-[#64748B] pr-2 text-right">Actual Pass</div>
        <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl text-center">
          <div className="text-lg font-bold text-[#D97706] tabular-nums">{cm.fn}</div>
          <div className="text-[11px] text-[#D97706] font-medium">False Negative ({fnPct}%)</div>
        </div>
        <div className="p-3 bg-[#D1FAE5] border border-[#A7F3D0] rounded-xl text-center">
          <div className="text-lg font-bold text-[#059669] tabular-nums">{cm.tp}</div>
          <div className="text-[11px] text-[#059669] font-medium">True Positive ({tpPct}%)</div>
        </div>
      </div>

      <div className="mt-4 text-xs text-[#64748B] text-center">
        Total Test Samples Evaluated: <span className="font-semibold text-[#0B2A4A]">{cm.total}</span>
      </div>
    </div>
  );
};
