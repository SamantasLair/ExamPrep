import { describe, it, expect } from 'vitest';
import { parseMarkdown, getPenaltyForTip } from '../src/lib/parser';

describe('Smart Markdown Parser', () => {
  it('should return an empty array for empty or whitespace markdown', () => {
    expect(parseMarkdown('')).toEqual([]);
    expect(parseMarkdown('   \n\n  ')).toEqual([]);
  });

  it('should correctly parse standard MCQ questions', () => {
    const md = `
# Q1 (PILGAN)
Berapakah hasil dari $2 + 2$?
[[A]] 3
[[B]] 4
[[C]] 5
[[D]] 6
ANSWER: B
DISCUSSION:
2 ditambah 2 sama dengan 4.
LABELS: Matematika, SD Kelas 1
`;
    const questions = parseMarkdown(md);
    expect(questions).toHaveLength(1);
    const q = questions[0];
    expect(q.id).toBe(1);
    expect(q.type).toBe('MCQ');
    expect(q.correctAnswer).toBe('B');
    expect(q.labels).toEqual(['Matematika', 'SD Kelas 1']);
    expect(q.options).toHaveLength(4);
    expect(q.options?.[0].key).toBe('A');
    expect(q.options?.[1].key).toBe('B');
    expect(q.discussion).toBeDefined();
  });

  it('should correctly parse ESSAY questions without options', () => {
    const md = `
# Q2 (ESSAY)
Jelaskan hukum kekekalan energi!
ANSWER: ESSAY
DISCUSSION:
Energi tidak dapat diciptakan atau dimusnahkan.
`;
    const questions = parseMarkdown(md);
    expect(questions).toHaveLength(1);
    const q = questions[0];
    expect(q.id).toBe(2);
    expect(q.type).toBe('ESSAY');
    expect(q.options).toBeUndefined();
    expect(q.correctAnswer).toBe('ESSAY');
  });

  it('should parse inline math and block math properly', () => {
    const md = `
# Q1 (PILGAN)
Perhatikan rumus berikut:
$$E = mc^2$$
Tentukan nilai jika $m = 2$ dan $c = 3$.
[[A]] 18
[[B]] 12
ANSWER: A
`;
    const questions = parseMarkdown(md);
    expect(questions).toHaveLength(1);
    const body = questions[0].body;
    const mathBlock = body.find(b => b.type === 'math-block');
    const mathInline = body.find(b => b.type === 'math-inline');
    expect(mathBlock).toBeDefined();
    expect(mathBlock?.content).toBe('E = mc^2');
    expect(mathInline).toBeDefined();
    expect(mathInline?.content).toBe('m = 2');
  });

  it('should parse chart blocks with valid JSON schema', () => {
    const md = `
# Q1 (PILGAN)
Perhatikan data grafik penjualan:
[CHART:BAR]
{
  "labels": ["Jan", "Feb", "Mar"],
  "datasets": [
    { "label": "Penjualan", "data": [10, 20, 30] }
  ]
}
[/CHART]
Berapakah penjualan bulan Februari?
[[A]] 10
[[B]] 20
ANSWER: B
`;
    const questions = parseMarkdown(md);
    expect(questions).toHaveLength(1);
    const chartBlock = questions[0].body.find(b => b.type === 'chart');
    expect(chartBlock).toBeDefined();
    expect(chartBlock?.chartType).toBe('BAR');
    expect(chartBlock?.chartData?.labels).toEqual(['Jan', 'Feb', 'Mar']);
  });

  it('should parse diagram blocks with valid JSON schema', () => {
    const md = `
# Q1 (PILGAN)
Perhatikan diagram geometri:
[DIAGRAM]
{
  "type": "geometry",
  "boundingBox": [-5, 5, 5, -5]
}
[/DIAGRAM]
[[A]] Benar
[[B]] Salah
ANSWER: A
`;
    const questions = parseMarkdown(md);
    expect(questions).toHaveLength(1);
    const diagramBlock = questions[0].body.find(b => b.type === 'diagram');
    expect(diagramBlock).toBeDefined();
    expect(diagramBlock?.diagramType).toBe('geometry');
  });

  it('should parse progressive tips (THEORY & PRACTICE)', () => {
    const md = `
# Q1 (PILGAN)
Soal fisika kuantum
[[A]] Opsi 1
[[B]] Opsi 2
ANSWER: A
TIPS_THEORY: Gunakan konstanta Planck h
TIPS_PRACTICE: Kalikan frekuensi dengan h
`;
    const questions = parseMarkdown(md);
    expect(questions).toHaveLength(1);
    expect(questions[0].tips).toBeDefined();
    expect(questions[0].tips).toHaveLength(2);
    expect(questions[0].tips?.[0].type).toBe('THEORY');
    expect(questions[0].tips?.[1].type).toBe('PRACTICE');
  });

  it('should correctly parse 50 questions from comprehensive demo test with stimulus', async () => {
    const { INITIAL_TESTS } = await import('../src/lib/mockData');
    const questions = parseMarkdown(INITIAL_TESTS[0].raw_markdown);
    expect(questions).toHaveLength(50);
    // Verify first questions have stimulus
    expect(questions[0].stimulus_content).toBeDefined();
    expect(questions[0].stimulus_content).toContain('Transformasi Kecerdasan Buatan');
    // Verify non-stimulus questions
    expect(questions[5].stimulus_content).toBeUndefined();
    // Verify Q50 is essay
    expect(questions[49].type).toBe('ESSAY');
  });
});

describe('Tip Penalty Calculation (getPenaltyForTip)', () => {
  it('should return 0 for empty config or invalid index', () => {
    expect(getPenaltyForTip('', 1)).toBe(0);
    expect(getPenaltyForTip('10, 15', 0)).toBe(0);
    expect(getPenaltyForTip('10, 15', -1)).toBe(0);
  });

  it('should return exact penalty for finite list', () => {
    const config = '10, 15, 20';
    expect(getPenaltyForTip(config, 1)).toBe(10);
    expect(getPenaltyForTip(config, 2)).toBe(15);
    expect(getPenaltyForTip(config, 3)).toBe(20);
    expect(getPenaltyForTip(config, 4)).toBe(0);
  });

  it('should extrapolate penalties when ellipsis (...) is present', () => {
    const config = '10, 15, 20, ...';
    expect(getPenaltyForTip(config, 1)).toBe(10);
    expect(getPenaltyForTip(config, 2)).toBe(15);
    expect(getPenaltyForTip(config, 3)).toBe(20);
    expect(getPenaltyForTip(config, 4)).toBe(25);
    expect(getPenaltyForTip(config, 5)).toBe(30);
  });

  it('should handle single value with ellipsis', () => {
    const config = '10, ...';
    expect(getPenaltyForTip(config, 1)).toBe(10);
    expect(getPenaltyForTip(config, 5)).toBe(10);
  });
});

describe('50-Question Mock Test Verification', () => {
  it('should parse exactly 50 questions from INITIAL_TESTS[0]', async () => {
    const { INITIAL_TESTS } = await import('../src/lib/mockData');
    const questions = parseMarkdown(INITIAL_TESTS[0].raw_markdown);
    expect(questions).toHaveLength(50);
    expect(questions[0].id).toBe(1);
    expect(questions[0].stimulus_content).toBeDefined();
    expect(questions[4].stimulus_content).toBeDefined();
    expect(questions[5].stimulus_content).toBeUndefined(); // CLEAR_STIMULUS
    expect(questions[49].id).toBe(50);
    expect(questions[49].type).toBe('ESSAY');
  });

  it('should preserve markdown bold and italic in question body, options, and discussion', () => {
    const md = `
# Q1 (PILGAN)
Sinonim yang paling tepat untuk kata **KOMPREHENSIF** adalah:
[[A]] Menyeluruh dan *mendalam*
[[B]] Cepat dan singkat
ANSWER: A
DISCUSSION:
Kata **KOMPREHENSIF** menurut KBBI berarti luas dan lengkap.
`;
    const questions = parseMarkdown(md);
    expect(questions).toHaveLength(1);
    expect(questions[0].body[0].type).toBe('text');
    expect(questions[0].body[0].content).toContain('**KOMPREHENSIF**');
    expect(questions[0].options?.[0].body[0].content).toContain('*mendalam*');
    expect(questions[0].discussion?.[0].content).toContain('**KOMPREHENSIF**');
  });

  it('should parse exactly 50 questions from generated SD Kelas 5 FULL file with valid properties', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../Soal/SD_Kelas5/2026-09-08/soal_sd5_FULL.txt');
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = parseMarkdown(content);

    expect(questions).toHaveLength(50);
    expect(questions[0].id).toBe(1);
    expect(questions[49].id).toBe(50);

    // Verify all 50 have options, answers, discussions, and labels
    for (let i = 0; i < 50; i++) {
      const q = questions[i];
      expect(q.id).toBe(i + 1);
      expect(q.type).toBe('MCQ');
      expect(q.options?.length).toBe(5);
      expect(['A', 'B', 'C', 'D', 'E']).toContain(q.correctAnswer);
      expect(q.discussion?.length).toBeGreaterThan(0);
      expect(q.labels?.length).toBeGreaterThan(0);
    }
  });
});

