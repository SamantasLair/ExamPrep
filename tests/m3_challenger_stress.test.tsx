import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ContentBlockRenderer, ContentBlockList } from '../src/components/exam/ContentBlockRenderer';
import { ChartRenderer } from '../src/components/exam/ChartRenderer';
import { StudentTrendChart } from '../src/components/student/StudentTrendChart';
import type { ContentBlock } from '../src/lib/types';

describe('Challenger M3: ContentBlockRenderer & Dynamic Chart Loading (F15)', () => {
  describe('Block Type Parsing & Dynamic Fallback', () => {
    it('renders lowercase "chart" block with dynamic loading skeleton and proper containment', () => {
      const block: ContentBlock = {
        type: 'chart',
        content: 'Data Distribusi Nilai Siswa',
        chartType: 'BAR',
        chartData: {
          labels: ['A', 'B', 'C', 'D'],
          datasets: [{ label: 'Jumlah', data: [10, 25, 40, 15] }],
        },
      };

      const html = renderToStaticMarkup(<ContentBlockRenderer block={block} />);
      
      // Verification: Dynamic import with ssr: false should render the skeleton fallback during SSR
      expect(html).toContain('Memuat grafik data...');
      expect(html).toContain('h-[260px]');
      expect(html).toContain('animate-pulse');
      expect(html).toContain('rounded-xl border bg-card');
      expect(html).toContain('overflow-hidden');
    });

    it('renders uppercase "CHART" block with dynamic loading skeleton without throwing', () => {
      const block = {
        type: 'CHART' as const,
        content: 'Data Tren Evaluasi',
        chartType: 'LINE',
        chartData: {
          labels: ['Jan', 'Feb', 'Mar'],
          datasets: [{ label: 'Skor', data: [70, 85, 90] }],
        },
      } as unknown as ContentBlock;

      const html = renderToStaticMarkup(<ContentBlockRenderer block={block} />);
      
      expect(html).toContain('Memuat grafik data...');
      expect(html).toContain('h-[260px]');
      expect(html).toContain('rounded-xl border bg-card');
    });

    it('respects compactLayout prop for floating chart thumbnail', () => {
      const block: ContentBlock = {
        type: 'chart',
        content: 'Grafik Mini',
        chartType: 'PIE',
        chartData: {
          labels: ['Lulus', 'Remedial'],
          datasets: [{ label: 'Status', data: [80, 20] }],
        },
      };

      const html = renderToStaticMarkup(<ContentBlockRenderer block={block} compactLayout={true} />);
      
      expect(html).toContain('float-right');
      expect(html).toContain('w-[250px]');
      expect(html).toContain('clear-right');
      expect(html).toContain('Memuat grafik data...');
    });

    it('renders ContentBlockList containing mixed text, math, and multiple chart block variants', () => {
      const blocks: ContentBlock[] = [
        { type: 'text', content: 'Perhatikan diagram di bawah ini:' },
        {
          type: 'chart',
          content: 'Diagram Batang',
          chartType: 'BAR',
          chartData: {
            labels: ['Sains', 'Matematika', 'Bahasa'],
            datasets: [{ label: 'Rata-rata', data: [85, 78, 92] }],
          },
        },
        { type: 'math-inline', content: 'x \\ge 80' },
        {
          type: 'CHART' as any,
          content: 'Diagram Garis',
          chartType: 'LINE',
          chartData: {
            labels: ['T1', 'T2', 'T3'],
            datasets: [{ label: 'Nilai', data: [60, 75, 90] }],
          },
        },
      ];

      const html = renderToStaticMarkup(<ContentBlockList blocks={blocks} />);
      
      expect(html).toContain('Perhatikan diagram di bawah ini:');
      expect(html).toContain('katex');
      // Should have two chart skeleton fallbacks
      const matches = html.match(/Memuat grafik data\.\.\./g);
      expect(matches).not.toBeNull();
      expect(matches?.length).toBe(2);
    });
  });

  describe('Direct ChartRenderer Stress Testing (Client Component Simulation)', () => {
    it('handles BAR chart rendering with multi-series datasets', () => {
      const block: ContentBlock = {
        type: 'chart',
        content: 'Perbandingan Dua Kelas',
        chartType: 'BAR',
        chartData: {
          labels: ['Kuis 1', 'Kuis 2', 'Kuis 3'],
          datasets: [
            { label: 'Kelas A', data: [80, 85, 90] },
            { label: 'Kelas B', data: [75, 82, 88] },
          ],
        },
      };

      const html = renderToStaticMarkup(<ChartRenderer block={block} />);
      expect(html).toContain('recharts-responsive-container');
    });

    it('handles LINE chart rendering with single series', () => {
      const block: ContentBlock = {
        type: 'chart',
        content: 'Tren Waktu Belajar',
        chartType: 'LINE',
        chartData: {
          labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
          datasets: [{ label: 'Jam Belajar', data: [12, 18, 15, 24] }],
        },
      };

      const html = renderToStaticMarkup(<ChartRenderer block={block} />);
      expect(html).toContain('recharts-responsive-container');
    });

    it('handles PIE chart rendering with percentage data', () => {
      const block: ContentBlock = {
        type: 'chart',
        content: 'Komposisi Jawaban',
        chartType: 'PIE',
        chartData: {
          labels: ['Benar', 'Salah', 'Kosong'],
          datasets: [{ label: 'Hasil', data: [35, 10, 5] }],
        },
      };

      const html = renderToStaticMarkup(<ChartRenderer block={block} />);
      expect(html).toContain('recharts-responsive-container');
    });

    it('handles missing chartData gracefully without crashing', () => {
      const block: ContentBlock = {
        type: 'chart',
        content: 'Grafik Rusak',
        chartType: 'BAR',
        // chartData omitted
      };

      const html = renderToStaticMarkup(<ChartRenderer block={block} />);
      expect(html).toContain('Konfigurasi grafik tidak ditemukan');
      expect(html).toContain('text-destructive');
    });

    it('handles missing chartType gracefully without crashing', () => {
      const block: ContentBlock = {
        type: 'chart',
        content: 'Grafik Tanpa Tipe',
        chartData: {
          labels: ['A', 'B'],
          datasets: [{ label: 'Nilai', data: [1, 2] }],
        },
      };

      const html = renderToStaticMarkup(<ChartRenderer block={block} />);
      expect(html).toContain('Konfigurasi grafik tidak ditemukan');
    });

    it('handles unsupported chartType gracefully with error message', () => {
      const block: ContentBlock = {
        type: 'chart',
        content: 'Grafik Radar',
        chartType: 'RADAR' as any,
        chartData: {
          labels: ['A', 'B'],
          datasets: [{ label: 'Nilai', data: [1, 2] }],
        },
      };

      const html = renderToStaticMarkup(<ChartRenderer block={block} />);
      expect(html).toContain('Tipe grafik tidak dikenal: RADAR');
    });

    it('handles empty labels array and empty datasets without throwing', () => {
      const block: ContentBlock = {
        type: 'chart',
        content: 'Grafik Kosong',
        chartType: 'BAR',
        chartData: {
          labels: [],
          datasets: [],
        },
      };

      expect(() => {
        const html = renderToStaticMarkup(<ChartRenderer block={block} />);
        expect(html).toContain('recharts-responsive-container');
      }).not.toThrow();
    });

    it('handles datasets with missing data points (shorter than labels) by defaulting to 0', () => {
      const block: ContentBlock = {
        type: 'chart',
        content: 'Data Asimetris',
        chartType: 'BAR',
        chartData: {
          labels: ['L1', 'L2', 'L3', 'L4', 'L5'],
          datasets: [
            // Only 2 points for 5 labels
            { label: 'Series Partial', data: [100, 200] },
          ],
        },
      };

      expect(() => {
        const html = renderToStaticMarkup(<ChartRenderer block={block} />);
        expect(html).toContain('recharts-responsive-container');
      }).not.toThrow();
    });

    it('handles datasets with negative values, fractional values, and zeroes', () => {
      const block: ContentBlock = {
        type: 'chart',
        content: 'Data Ekstrem',
        chartType: 'LINE',
        chartData: {
          labels: ['N1', 'N2', 'N3', 'N4'],
          datasets: [
            { label: 'Delta', data: [-15.5, 0, 99.99, -0.001] },
          ],
        },
      };

      expect(() => {
        const html = renderToStaticMarkup(<ChartRenderer block={block} />);
        expect(html).toContain('recharts-responsive-container');
      }).not.toThrow();
    });

    it('handles stress test with 200 data points without memory exhaustion or lag', () => {
      const labels = Array.from({ length: 200 }, (_, i) => `Point ${i + 1}`);
      const data = Array.from({ length: 200 }, (_, i) => Math.sin(i / 10) * 50 + 50);

      const block: ContentBlock = {
        type: 'chart',
        content: 'Gelombang Sinus Besar',
        chartType: 'LINE',
        chartData: {
          labels,
          datasets: [{ label: 'Amplitudo', data }],
        },
      };

      const start = performance.now();
      const html = renderToStaticMarkup(<ChartRenderer block={block} />);
      const duration = performance.now() - start;

      expect(html).toContain('recharts-responsive-container');
      expect(duration).toBeLessThan(500); // Must complete within 500ms
    });
  });
});

describe('Challenger M3: StudentTrendChart Stress Testing (F16)', () => {
  describe('Prop Permutations & Contract Conformance', () => {
    it('renders with PROJECT.md contract shape ({ attempt, score, label })', () => {
      const chartData = [
        { attempt: 'Ujian 1', score: 65, label: 'Matematika Dasar' },
        { attempt: 'Ujian 2', score: 78, label: 'Bahasa Indonesia' },
        { attempt: 'Ujian 3', score: 92, label: 'Penalaran Umum' },
      ];

      const html = renderToStaticMarkup(<StudentTrendChart chartData={chartData} />);
      expect(html).toContain('recharts-responsive-container');
    });

    it('renders with student/[id]/page.tsx shape ({ name, attempt, label, score, testName, date })', () => {
      const chartData = [
        { name: 'Ujian 1', attempt: 'Ujian 1', label: 'Tryout Akbar', score: 88, testName: 'Tryout Akbar', date: '16/09/2026' },
        { name: 'Ujian 2', attempt: 'Ujian 2', label: 'Simulasi UTBK', score: 94, testName: 'Simulasi UTBK', date: '17/09/2026' },
      ];

      const html = renderToStaticMarkup(<StudentTrendChart chartData={chartData} />);
      expect(html).toContain('recharts-responsive-container');
    });

    it('renders with minimal shape containing only score', () => {
      const chartData = [
        { score: 50 },
        { score: 70 },
        { score: 85 },
      ];

      expect(() => {
        const html = renderToStaticMarkup(<StudentTrendChart chartData={chartData} />);
        expect(html).toContain('recharts-responsive-container');
      }).not.toThrow();
    });

    it('renders with empty chartData array ([]) without throwing error', () => {
      expect(() => {
        const html = renderToStaticMarkup(<StudentTrendChart chartData={[]} />);
        expect(html).toContain('recharts-responsive-container');
      }).not.toThrow();
    });

    it('renders with single data point without throwing error', () => {
      const chartData = [{ attempt: 'Ujian Perdana', score: 100, label: 'Ujian Perdana' }];

      expect(() => {
        const html = renderToStaticMarkup(<StudentTrendChart chartData={chartData} />);
        expect(html).toContain('recharts-responsive-container');
      }).not.toThrow();
    });

    it('renders with extreme values: boundary scores 0, 100, negative, and above 100', () => {
      const chartData = [
        { attempt: 'U0', score: 0, label: 'Nol' },
        { attempt: 'U1', score: 100, label: 'Maksimum' },
        { attempt: 'U2', score: -10, label: 'Negatif Penalti' },
        { attempt: 'U3', score: 150, label: 'Bonus Ekstra' },
        { attempt: 'U4', score: 77.7777, label: 'Desimal Presisi' },
      ];

      expect(() => {
        const html = renderToStaticMarkup(<StudentTrendChart chartData={chartData} />);
        expect(html).toContain('recharts-responsive-container');
      }).not.toThrow();
    });

    it('renders with large dataset: 500 attempt history points smoothly', () => {
      const largeData = Array.from({ length: 500 }, (_, i) => ({
        attempt: `Test #${i + 1}`,
        score: Math.floor(Math.random() * 60) + 40,
        label: `Evaluasi Semester ${i + 1}`,
        testName: `Paket ${i + 1}`,
        date: '2026-09-16',
      }));

      const start = performance.now();
      const html = renderToStaticMarkup(<StudentTrendChart chartData={largeData} />);
      const duration = performance.now() - start;

      expect(html).toContain('recharts-responsive-container');
      expect(duration).toBeLessThan(1000); // 500 points rendered within 1s
    });

    it('handles unexpected additional metadata fields in items without corruption', () => {
      const dirtyData = [
        {
          attempt: 'U1',
          score: 80,
          label: 'Test 1',
          extraFieldA: 'foo',
          nestedObj: { deep: true },
          arrayProp: [1, 2, 3],
        },
      ];

      expect(() => {
        const html = renderToStaticMarkup(<StudentTrendChart chartData={dirtyData} />);
        expect(html).toContain('recharts-responsive-container');
      }).not.toThrow();
    });
  });
});
