import Dexie, { type EntityTable } from 'dexie';

export interface ExamSessionCache {
  examId: string;
  studentId?: string;
  answers: Record<string, string>;
  tipsUsed: Record<string, number[]>;
  timeLeft: number;
  updatedAt: number;
}

export interface AnswersQueueItem {
  id?: number;
  examId: string;
  questionId: string;
  answer: string;
  timestamp: number;
  synced: number; // 0 = false, 1 = true
}

export interface ScratchpadItem {
  examId: string;
  content: string;
  updatedAt: number;
}

export interface FlaggedItem {
  examId: string;
  flags: Record<string, boolean>;
  updatedAt: number;
}

export interface TestOfflineCache {
  id: string;
  title: string;
  duration_minutes: number;
  passing_grade: number;
  raw_markdown: string;
  cachedAt: number;
}

export interface OfflineAttemptSubmission {
  id?: number;
  examId: string;
  studentId: string | null;
  payload: any;
  status: 'pending' | 'synced' | 'failed';
  attempts: number;
  createdAt: number;
  syncedAt?: number;
  errorMessage?: string;
}

class ExamPreparerDatabase extends Dexie {
  sessions!: EntityTable<ExamSessionCache, 'examId'>;
  answersQueue!: EntityTable<AnswersQueueItem, 'id'>;
  scratchpads!: EntityTable<ScratchpadItem, 'examId'>;
  flagged!: EntityTable<FlaggedItem, 'examId'>;
  testsCache!: EntityTable<TestOfflineCache, 'id'>;
  offlineSubmissions!: EntityTable<OfflineAttemptSubmission, 'id'>;

  constructor() {
    super('ExamPreparerDB');
    this.version(1).stores({
      sessions: 'examId, updatedAt',
      answersQueue: '++id, [examId+synced], examId, questionId, timestamp, synced',
      scratchpads: 'examId, updatedAt',
      flagged: 'examId, updatedAt',
      testsCache: 'id, cachedAt',
      offlineSubmissions: '++id, examId, status, createdAt'
    });
  }
}

export const db = new ExamPreparerDatabase();
