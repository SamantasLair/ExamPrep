import Dexie, { type EntityTable, type Table } from 'dexie';

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

export interface ProgressDeltaItem {
  id?: number;
  courseId: string;
  userId: string;
  entityType: 'MATERIAL_READ' | 'EXERCISE_ANSWER' | 'QUIZ_SUBMIT';
  entityId: string;
  payload: unknown;
  timestamp: number;
  synced: number;
  retryCount: number;
}

export interface CourseProgressRecord {
  id: string;
  courseId: string;
  userId: string;
  completedMaterials: string[];
  exerciseScores: Record<string, number>;
  quizScores: Record<string, number>;
  overallProgress: number;
  updatedAt: number;
}

class ExamPreparerDatabase extends Dexie {
  sessions!: EntityTable<ExamSessionCache, 'examId'>;
  answersQueue!: EntityTable<AnswersQueueItem, 'id'>;
  scratchpads!: EntityTable<ScratchpadItem, 'examId'>;
  flagged!: EntityTable<FlaggedItem, 'examId'>;
  testsCache!: EntityTable<TestOfflineCache, 'id'>;
  offlineSubmissions!: EntityTable<OfflineAttemptSubmission, 'id'>;
  courseProgress!: Table<CourseProgressRecord, string>;
  progressDeltas!: Table<ProgressDeltaItem, number>;

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
    this.version(2).stores({
      courseProgress: 'id, [courseId+userId], courseId, userId, updatedAt',
      progressDeltas: '++id, [courseId+synced], [userId+synced], courseId, userId, entityType, timestamp, synced'
    });
  }
}

export const db = new ExamPreparerDatabase();

export async function saveCourseProgressLocal(progress: CourseProgressRecord): Promise<string> {
  return await db.courseProgress.put(progress);
}

export async function getCourseProgressLocal(courseId: string, userId: string): Promise<CourseProgressRecord | undefined> {
  const composite = await db.courseProgress.where('[courseId+userId]').equals([courseId, userId]).first();
  if (composite) return composite;
  return await db.courseProgress.get(`${courseId}_${userId}`) || await db.courseProgress.get(courseId);
}

export async function enqueueCourseDelta(delta: Omit<ProgressDeltaItem, 'id' | 'synced' | 'retryCount'> & { id?: number; synced?: number; retryCount?: number }): Promise<number> {
  const item: ProgressDeltaItem = {
    ...delta,
    synced: delta.synced ?? 0,
    retryCount: delta.retryCount ?? 0
  };
  return (await db.progressDeltas.add(item)) as number;
}

export async function getPendingCourseDeltas(courseId?: string, userId?: string): Promise<ProgressDeltaItem[]> {
  if (courseId) {
    return await db.progressDeltas.where('[courseId+synced]').equals([courseId, 0]).toArray();
  }
  if (userId) {
    return await db.progressDeltas.where('[userId+synced]').equals([userId, 0]).toArray();
  }
  return await db.progressDeltas.where('synced').equals(0).toArray();
}

export async function markCourseDeltasSynced(ids: number[]): Promise<number> {
  if (!ids.length) return 0;
  return await db.progressDeltas.where('id').anyOf(ids).modify({ synced: 1 });
}
