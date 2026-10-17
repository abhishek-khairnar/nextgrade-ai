import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface RocCurveChartProps {
  points: { fpr: number; tpr: number }[];
  auc?: number;
}

export const RocCurveChart: React.FC<RocCurveChartProps> = ({ points, auc = 0.96 }) => {
  if (!points || points.length === 0) return null;

  // Add baseline diagonal
  const chartData = points.map((p) => ({
    fpr: p.fpr,
    tpr: p.tpr,
    baseline: p.fpr,
  }));

  return (
    <div className="w-full h-72 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#64748B]">Receiver Operating Characteristic (ROC)</span>
        <span className="text-xs font-bold text-[#059669] bg-[#D1FAE5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
          AUC: {auc.toFixed(3)}
        </span>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="fpr"
              type="number"
              domain={[0, 1]}
              stroke="#64748B"
              fontSize={11}
              label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#64748B' }}
            />
            <YAxis
              dataKey="tpr"
              domain={[0, 1]}
              stroke="#64748B"
              fontSize={11}
              label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748B' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E9F2',
                borderRadius: '12px',
                fontSize: '12px',
              }}
              formatter={(val: any) => Number(val).toFixed(3)}
            />
            <Line
              type="monotone"
              dataKey="tpr"
              name="ROC Model"
              stroke="#2563EB"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              type="linear"
              dataKey="baseline"
              name="Random Guess"
              stroke="#94A3B8"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
