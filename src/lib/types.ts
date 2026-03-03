/* ── Smart-Parser Types ── */

export type ChartType = 'BAR' | 'LINE' | 'PIE';

export interface ContentBlock {
  type: 'text' | 'math-inline' | 'math-block' | 'chart' | 'image';
  content: string;
  chartType?: ChartType;
  chartData?: { labels: string[]; datasets: { label?: string; data: number[] }[] };
}

export interface Option {
  key: string;
  body: ContentBlock[];
}

export interface Question {
  id: number;
  type: 'MCQ' | 'ESSAY';
  body: ContentBlock[];
  options?: Option[];
  correctAnswer?: string;
  discussion?: ContentBlock[];
}

/* ── Database Row Types ── */

export interface TestRow {
  id: string;
  title: string;
  description: string | null;
  raw_markdown: string;
  duration_minutes: number;
  start_at: string | null;
  end_at: string | null;
  passing_grade: number;
  show_answer: boolean;
  created_by: string | null;
  created_at: string;
}

export interface AttemptRow {
  id: string;
  test_id: string;
  user_id: string;
  responses: Record<string, string>;
  score: number;
  status: 'ongoing' | 'finished';
  started_at: string;
  finished_at: string | null;
}
