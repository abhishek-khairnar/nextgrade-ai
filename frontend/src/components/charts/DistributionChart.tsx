import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface DistributionChartProps {
  data: { name: string; count: number; avg_g3?: number }[];
  isNumeric?: boolean;
}

export const DistributionChart: React.FC<DistributionChartProps> = ({ data, isNumeric = false }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            interval={0}
            angle={-25}
            textAnchor="end"
          />
          <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E5E9F2',
              borderRadius: '12px',
              fontSize: '12px',
            }}
            formatter={(value: any, name: string) => {
              if (name === 'count') return [`${value} students`, 'Sample Count'];
              return [value, name];
            }}
          />
          <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
