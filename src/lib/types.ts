/* ── Smart-Parser Types ── */

export type ChartType = 'BAR' | 'LINE' | 'PIE';

export interface ContentBlock {
  type: 'text' | 'math-inline' | 'math-block' | 'chart' | 'image' | 'code-block' | 'diagram';
  content: string;
  language?: string;
  chartType?: ChartType;
  chartData?: { labels: string[]; datasets: { label?: string; data: number[] }[] };
  diagramType?: 'functionPlot' | 'geometry' | '3d';
  diagramConfig?: Record<string, unknown>;
}

export interface Option {
  key: string;
  body: ContentBlock[];
}

export interface Question {
  id: string | number; // Updated to support UUIDs from DB
  stimulus_id?: string; // Links to Case Study
  stimulus_content?: string; // Markdown content of the Case Study
  chain_index?: number; // Ordering for chain questions
  type: 'MCQ' | 'ESSAY' | 'MULTI' | 'MATCHING' | 'FILL_BLANK';
  labels?: string[]; // E.g., ['OSN', 'Kelas 5', 'Matematika']
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
  raw_markdown: string; // Restored as single source of truth for the Editor
  duration_minutes: number;
  start_at: string | null;
  end_at: string | null;
  passing_grade: number;
  show_answer: boolean;
  immediate_feedback?: boolean;
  created_by: string | null;
  created_at: string;
}

export interface StimulusRow {
  id: string;
  content: string; // Markdown content for case study
}

export interface QuestionRow {
  id: string;
  stimulus_id: string | null;
  chain_index: number | null;
  body: string; // Markdown specific to this question
  type: 'MCQ' | 'ESSAY' | 'MULTI' | 'MATCHING' | 'FILL_BLANK';
  labels: Record<string, string[]>; // e.g. { difficulty: ['OSN'], age: ['Kelas 5'] }
  created_at: string;
}

export interface TestQuestionsRow {
  test_id: string;
  question_id: string;
  order: number;
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

export interface StudentRow {
  id: string; // Ex: SMA-001
  name: string;
  birthday: string | null;
  avatar_url: string | null;
  created_at: string;
}
