import { describe, it, expect } from 'vitest';
import { parseLeanChartDSL, parseLeanDiagramDSL } from '../src/lib/leanDslParser';
import { scanMathDelimiters } from '../src/lib/mathLexer';
import { parseMarkdown } from '../src/lib/parser';

describe('Lean DSL Test Suite', () => {
  describe('parseLeanChartDSL', () => {
    it('should parse Markdown Table format into labels and datasets', () => {
      const tableDsl = `
| Bulan | Target | Realisasi |
|---|---|---|
| Jan | 100 | 95 |
| Feb | 120 | 115 |
| Mar | 150 | 160 |
`;
      const result = parseLeanChartDSL(tableDsl);
      expect(result.labels).toEqual(['Jan', 'Feb', 'Mar']);
      expect(result.datasets).toHaveLength(2);
      expect(result.datasets[0]).toEqual({
        label: 'Target',
        data: [100, 120, 150],
      });
      expect(result.datasets[1]).toEqual({
        label: 'Realisasi',
        data: [95, 115, 160],
      });
    });

    it('should parse row-oriented Markdown Table where headers are labels', () => {
      const rowTableDsl = `
| Metrik | Q1 | Q2 | Q3 |
| Produksi | 50 | 60 | 70 |
| Cacat | 5 | 2 | 1 |
`;
      const result = parseLeanChartDSL(rowTableDsl);
      expect(result.labels).toEqual(['Q1', 'Q2', 'Q3']);
      expect(result.datasets).toHaveLength(2);
      expect(result.datasets[0]).toEqual({
        label: 'Produksi',
        data: [50, 60, 70],
      });
      expect(result.datasets[1]).toEqual({
        label: 'Cacat',
        data: [5, 2, 1],
      });
    });

    it('should parse Key-Value format into labels and datasets', () => {
      const kvDsl = `
labels: A, B, C
Penjualan: 10, 20, 30
Biaya: 5, 8, 12
`;
      const result = parseLeanChartDSL(kvDsl);
      expect(result.labels).toEqual(['A', 'B', 'C']);
      expect(result.datasets).toHaveLength(2);
      expect(result.datasets[0]).toEqual({
        label: 'Penjualan',
        data: [10, 20, 30],
      });
      expect(result.datasets[1]).toEqual({
        label: 'Biaya',
        data: [5, 8, 12],
      });
    });

    it('should return empty labels and datasets for empty input', () => {
      expect(parseLeanChartDSL('')).toEqual({ labels: [], datasets: [] });
      expect(parseLeanChartDSL('   \n  \n')).toEqual({ labels: [], datasets: [] });
    });
  });

  describe('parseLeanDiagramDSL', () => {
    it('should parse canvas directives: bounds, axis, and grid', () => {
      const dsl = `
bounds: -5, 5, 5, -5
axis: on
grid: on
aspect: 1.5
`;
      const result = parseLeanDiagramDSL(dsl);
      expect(result.type).toBe('geometry');
      expect(result.boundingBox).toEqual([-5, 5, 5, -5]);
      expect(result.axis).toBe(true);
      expect(result.grid).toBe(true);
      expect(result.aspectRatio).toBe(1.5);
    });

    it('should parse primitive elements: point, line, circle, polygon, functionGraph, integral, text', () => {
      const dsl = `
bounds: -10, 10, 10, -10
axis: true
grid: false
A = point(0, 3, size=4, color=red)
point B: 4, 0, color=blue
line L1: A, B, stroke=blue, width=2
circle C1: A, 5, fill=none, stroke=green
polygon Tri: A, B, C, fill=yellow
fn f = x*x - 4, stroke=purple
integral f, 0, -2..2, fill=cyan, opacity=0.3
text "Peak", 0, 3, color=red
`;
      const result = parseLeanDiagramDSL(dsl);
      expect(result.type).toBe('geometry');
      expect(result.boundingBox).toEqual([-10, 10, 10, -10]);
      expect(result.axis).toBe(true);
      expect(result.grid).toBe(false);

      const elements = result.elements ?? [];
      expect(elements).toHaveLength(8);

      // Point A
      expect(elements[0]).toMatchObject({
        type: 'point',
        name: 'A',
        coords: [0, 3],
        size: 4,
        strokeColor: 'red',
      });

      // Point B
      expect(elements[1]).toMatchObject({
        type: 'point',
        name: 'B',
        coords: [4, 0],
        strokeColor: 'blue',
      });

      // Line L1
      expect(elements[2]).toMatchObject({
        type: 'line',
        name: 'L1',
        p1: 'A',
        p2: 'B',
        strokeColor: 'blue',
        strokeWidth: 2,
      });

      // Circle C1
      expect(elements[3]).toMatchObject({
        type: 'circle',
        name: 'C1',
        center: 'A',
        radius: 5,
        fillColor: 'none',
        strokeColor: 'green',
      });

      // Polygon Tri
      expect(elements[4]).toMatchObject({
        type: 'polygon',
        name: 'Tri',
        vertices: ['A', 'B', 'C'],
        fillColor: 'yellow',
      });

      // FunctionGraph
      expect(elements[5]).toMatchObject({
        type: 'functionGraph',
        name: 'f',
        fn: 'x*x - 4',
        strokeColor: 'purple',
      });

      // Integral
      expect(elements[6]).toMatchObject({
        type: 'integral',
        name: 'integral_f_0',
        curve1: 'f',
        curve2: 0,
        range: [-2, 2],
        fillColor: 'cyan',
        fillOpacity: 0.3,
      });

      // Text
      expect(elements[7]).toMatchObject({
        type: 'text',
        text: 'Peak',
        coords: [0, 3],
        strokeColor: 'red',
      });
    });

    it('should parse 3D diagram directives and equations', () => {
      const dsl = `
type: 3d
fn3d: sin(sqrt(x^2 + y^2)), x = -5..5, y = -5..5
`;
      const result = parseLeanDiagramDSL(dsl);
      expect(result.type).toBe('3d');
      expect(result.fn).toBe('sin(sqrt(x^2 + y^2))');
      expect(result.xRange).toEqual([-5, 5]);
      expect(result.yRange).toEqual([-5, 5]);
    });
  });

  describe('scanMathDelimiters in src/lib/mathLexer', () => {
    it('should parse inline math $x + 2$', () => {
      const text = 'Nilai dari $x + 2$ adalah positif.';
      const tokens = scanMathDelimiters(text);
      expect(tokens).toEqual([
        { type: 'text', content: 'Nilai dari ' },
        { type: 'math-inline', content: 'x + 2' },
        { type: 'text', content: ' adalah positif.' },
      ]);
    });

    it('should parse block math $$\\int_0^1 x dx$$', () => {
      const text = 'Hitunglah integral berikut:\n$$\\int_0^1 x dx$$\nSelesaikan.';
      const tokens = scanMathDelimiters(text);
      expect(tokens).toEqual([
        { type: 'text', content: 'Hitunglah integral berikut:\n' },
        { type: 'math-block', content: '\\int_0^1 x dx' },
        { type: 'text', content: '\nSelesaikan.' },
      ]);
    });

    it('should respect currency symbol immunity ($100 per barang stays text)', () => {
      const text = 'Harga total adalah $100 per barang dan $50 diskon.';
      const tokens = scanMathDelimiters(text);
      expect(tokens).toEqual([
        { type: 'text', content: 'Harga total adalah $100 per barang dan $50 diskon.' },
      ]);
    });

    it('should parse escaped dollar \\$50 into text $50', () => {
      const text = 'Bayar sejumlah \\$50 tunai.';
      const tokens = scanMathDelimiters(text);
      expect(tokens).toEqual([
        { type: 'text', content: 'Bayar sejumlah $50 tunai.' },
      ]);
    });
  });

  describe('parseMarkdown end-to-end hybrid integration', () => {
    it('should parse question with [CHART:BAR] in Markdown table format', () => {
      const md = `
# Q1 (PILGAN)
Perhatikan tabel data performa berikut:
[CHART:BAR]
| Bulan | Target | Realisasi |
|---|---|---|
| Jan | 100 | 95 |
| Feb | 120 | 115 |
| Mar | 150 | 160 |
[/CHART]
Berapa realisasi pada bulan Februari?
[[A]] 95
[[B]] 115
ANSWER: B
`;
      const questions = parseMarkdown(md);
      expect(questions).toHaveLength(1);
      const q = questions[0];
      expect(q.id).toBe(1);
      const chartBlock = q.body.find((b) => b.type === 'chart');
      expect(chartBlock).toBeDefined();
      expect(chartBlock?.chartType).toBe('BAR');
      expect(chartBlock?.chartData?.labels).toEqual(['Jan', 'Feb', 'Mar']);
      expect(chartBlock?.chartData?.datasets).toEqual([
        { label: 'Target', data: [100, 120, 150] },
        { label: 'Realisasi', data: [95, 115, 160] },
      ]);
    });

    it('should parse question with [CHART:BAR] in Key-Value format', () => {
      const md = `
# Q2 (PILGAN)
Grafik penjualan bulanan:
[CHART:BAR]
labels: A, B, C
Penjualan: 10, 20, 30
[/CHART]
Berapa penjualan kategori C?
[[A]] 10
[[B]] 30
ANSWER: B
`;
      const questions = parseMarkdown(md);
      expect(questions).toHaveLength(1);
      const chartBlock = questions[0].body.find((b) => b.type === 'chart');
      expect(chartBlock).toBeDefined();
      expect(chartBlock?.chartType).toBe('BAR');
      expect(chartBlock?.chartData?.labels).toEqual(['A', 'B', 'C']);
      expect(chartBlock?.chartData?.datasets).toEqual([
        { label: 'Penjualan', data: [10, 20, 30] },
      ]);
    });

    it('should parse question with [DIAGRAM] in Lean DSL format', () => {
      const md = `
# Q3 (PILGAN)
Perhatikan diagram geometri di bawah:
[DIAGRAM]
bounds: -5, 5, 5, -5
axis: on
grid: on
A = point(0, 3, color=red)
B = point(4, 0, color=blue)
line A, B, stroke=blue
[/DIAGRAM]
Tentukan jarak titik A ke B!
[[A]] 5
[[B]] 7
ANSWER: A
`;
      const questions = parseMarkdown(md);
      expect(questions).toHaveLength(1);
      const diagramBlock = questions[0].body.find((b) => b.type === 'diagram');
      expect(diagramBlock).toBeDefined();
      expect(diagramBlock?.diagramType).toBe('geometry');
      expect(diagramBlock?.diagramConfig?.boundingBox).toEqual([-5, 5, 5, -5]);
      expect(diagramBlock?.diagramConfig?.axis).toBe(true);
      expect(diagramBlock?.diagramConfig?.grid).toBe(true);
      const elements = (diagramBlock?.diagramConfig?.elements as Array<Record<string, unknown>>) ?? [];
      expect(elements).toHaveLength(3);
      expect(elements[0]).toMatchObject({ type: 'point', name: 'A', coords: [0, 3] });
      expect(elements[1]).toMatchObject({ type: 'point', name: 'B', coords: [4, 0] });
      expect(elements[2]).toMatchObject({ type: 'line', p1: 'A', p2: 'B' });
    });

    it('should continue parsing legacy JSON [DIAGRAM] block seamlessly', () => {
      const md = `
# Q4 (PILGAN)
Diagram legacy berbasis JSON:
[DIAGRAM]
{
  "type": "geometry",
  "boundingBox": [-5, 5, 5, -5],
  "elements": [
    { "type": "point", "name": "O", "coords": [0, 0] }
  ]
}
[/DIAGRAM]
Di manakah koordinat titik O?
[[A]] (0, 0)
[[B]] (1, 1)
ANSWER: A
`;
      const questions = parseMarkdown(md);
      expect(questions).toHaveLength(1);
      const diagramBlock = questions[0].body.find((b) => b.type === 'diagram');
      expect(diagramBlock).toBeDefined();
      expect(diagramBlock?.diagramType).toBe('geometry');
      expect(diagramBlock?.diagramConfig?.boundingBox).toEqual([-5, 5, 5, -5]);
      const elements = (diagramBlock?.diagramConfig?.elements as Array<Record<string, unknown>>) ?? [];
      expect(elements).toHaveLength(1);
      expect(elements[0]).toMatchObject({ type: 'point', name: 'O', coords: [0, 0] });
    });
  });
});
