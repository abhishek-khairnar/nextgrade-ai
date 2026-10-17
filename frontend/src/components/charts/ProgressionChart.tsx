import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ProgressionData } from '@/lib/types';

export interface ProgressionChartProps {
  data: ProgressionData;
}

export const ProgressionChart: React.FC<ProgressionChartProps> = ({ data }) => {
  if (!data || !data.overall) return null;

  const chartData = [
    {
      period: 'Period 1 (G1)',
      Overall: data.overall.g1,
      Math: data.math.g1,
      Portuguese: data.portuguese.g1,
    },
    {
      period: 'Period 2 (G2)',
      Overall: data.overall.g2,
      Math: data.math.g2,
      Portuguese: data.portuguese.g2,
    },
    {
      period: 'Final (G3)',
      Overall: data.overall.g3,
      Math: data.math.g3,
      Portuguese: data.portuguese.g3,
    },
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="period" stroke="#64748B" fontSize={12} tickLine={false} />
          <YAxis domain={[9, 14]} stroke="#64748B" fontSize={12} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E5E9F2',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(11, 42, 74, 0.08)',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
          <Line
            type="monotone"
            dataKey="Overall"
            stroke="#0B2A4A"
            strokeWidth={3}
            dot={{ r: 5, fill: '#0B2A4A' }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="Math"
            stroke="#2563EB"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ r: 4, fill: '#2563EB' }}
          />
          <Line
            type="monotone"
            dataKey="Portuguese"
            stroke="#059669"
            strokeWidth={2}
            dot={{ r: 4, fill: '#059669' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
