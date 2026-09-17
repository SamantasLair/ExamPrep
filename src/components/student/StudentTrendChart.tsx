'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

export interface TrendPoint {
  attempt?: string;
  name?: string;
  label?: string;
  score: number;
  testName?: string;
  date?: string;
  [key: string]: any;
}

export interface StudentTrendChartProps {
  chartData: Array<{
    attempt?: string;
    name?: string;
    label?: string;
    score: number;
    testName?: string;
    date?: string;
    [key: string]: any;
  }>;
}

export function StudentTrendChart({ chartData }: StudentTrendChartProps) {
  const normalizedData = chartData.map((d) => ({
    ...d,
    name: d.name ?? d.attempt ?? d.label ?? 'Ujian',
    attempt: d.attempt ?? d.name ?? d.label ?? 'Ujian',
    label: d.label ?? d.testName ?? d.name ?? 'Ujian',
    testName: d.testName ?? d.label ?? 'Unknown',
  }));

  const xKey = chartData[0]?.attempt !== undefined && chartData[0]?.name === undefined ? 'attempt' : 'name';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={normalizedData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis
          dataKey={xKey}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          dy={8}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          domain={[0, 100]}
        />
        <RechartsTooltip
          contentStyle={{
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
          labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
          // @ts-ignore: Recharts types
          formatter={(value: any, name: any, props: any) => [
            <span key="score" className="font-bold">
              {value}{' '}
              <span className="font-normal text-xs text-muted-foreground">
                ({props.payload.testName || props.payload.label || 'Ujian'})
              </span>
            </span>,
            'Skor',
          ]}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="var(--color-primary, #3b82f6)"
          strokeWidth={3.5}
          dot={{ strokeWidth: 3, r: 4, fill: 'white' }}
          activeDot={{ r: 7, strokeWidth: 0, fill: 'var(--color-primary, #3b82f6)' }}
          animationDuration={1200}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default StudentTrendChart;
