'use client';

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { ContentBlock } from '@/lib/types';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8'];

interface ChartRendererProps {
  block: ContentBlock;
}

export function ChartRenderer({ block }: ChartRendererProps) {
  if (!block.chartData || !block.chartType) {
    return <p className="text-sm text-destructive">Konfigurasi grafik tidak ditemukan</p>;
  }
  const { labels, datasets } = block.chartData;
  const data = labels.map((label, i) => {
    const point: Record<string, string | number> = { name: label };
    datasets.forEach((ds, dsIdx) => {
      const key = ds.label || `Series ${dsIdx + 1}`;
      point[key] = ds.data[i] ?? 0;
    });
    return point;
  });
  
  const seriesKeys = datasets.map((ds, i) => ds.label || `Series ${i + 1}`);
  const showLegend = datasets.length > 1 || (datasets[0]?.label && !['series0', 'data', 'Series 1'].includes(datasets[0].label));

  switch (block.chartType) {
    case 'BAR':
      return (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={10} width={40} />
            <Tooltip />
            {showLegend && <Legend verticalAlign="top" height={36} />}
            {seriesKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    case 'LINE':
      return (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={10} width={40} />
            <Tooltip />
            {showLegend && <Legend verticalAlign="top" height={36} />}
            {seriesKeys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 4 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    case 'PIE':
      return (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} dataKey={seriesKeys[0]} nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            {showLegend && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      );
    default:
      return <p className="text-sm text-destructive">Tipe grafik tidak dikenal: {block.chartType}</p>;
  }
}
