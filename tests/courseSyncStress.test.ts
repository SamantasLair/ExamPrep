import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  db,
  saveCourseProgressLocal,
  getCourseProgressLocal,
  enqueueCourseDelta,
  getPendingCourseDeltas,
  type CourseProgressRecord
} from '../src/lib/db';
import { batchSyncManager } from '../src/lib/batchSyncManager';
import { mockSupabaseClient, resetMockData } from '../src/lib/mockSupabase';

describe('Course Offline-First & Batch Sync Stress Test Suite (SW-T05)', () => {
  beforeEach(async () => {
    await db.courseProgress.clear();
    await db.progressDeltas.clear();
    await db.answersQueue.clear();
    await db.offlineSubmissions.clear();
    batchSyncManager.setOnlineStatus(true);
    resetMockData();
  });

  afterEach(() => {
    batchSyncManager.stopPeriodicSync();
    vi.restoreAllMocks();
  });

  // 1. Pengujian penyimpanan state progress instan ke Dexie courseProgress (0ms offline update)
  it('1. should perform 0ms instant offline save and retrieval of courseProgress in Dexie', async () => {
    const courseId = 'course-snbt-2026';
    const userId = 'user-test-001';

    const progressRecord: CourseProgressRecord = {
      id: `${courseId}_${userId}`,
      courseId,
      userId,
      completedMaterials: ['mat-01', 'mat-02'],
      exerciseScores: { 'ex-01': 100, 'ex-02': 85 },
      quizScores: { 'quiz-01': 90 },
      overallProgress: 65,
      updatedAt: Date.now()
    };

    const startTime = performance.now();
    const savedKey = await saveCourseProgressLocal(progressRecord);
    const saveDuration = performance.now() - startTime;

    expect(savedKey).toBe(`${courseId}_${userId}`);
    expect(saveDuration).toBeLessThan(100);

    const fetched = await getCourseProgressLocal(courseId, userId);
    expect(fetched).toBeDefined();
    expect(fetched?.courseId).toBe(courseId);
    expect(fetched?.userId).toBe(userId);
    expect(fetched?.completedMaterials).toEqual(['mat-01', 'mat-02']);
    expect(fetched?.exerciseScores['ex-01']).toBe(100);
    expect(fetched?.quizScores['quiz-01']).toBe(90);
    expect(fetched?.overallProgress).toBe(65);
  });

  // 2. Pengujian antrean delta progressDeltas (enqueue saat mutasi jawaban/materi)
  it('2. should enqueue progress deltas with synced=0 upon answer and material mutations', async () => {
    const courseId = 'course-snbt-2026';
    const userId = 'user-test-002';

    const deltaMatId = await enqueueCourseDelta({
      courseId,
      userId,
      entityType: 'MATERIAL_READ',
      entityId: 'mat-01',
      payload: { completedAt: Date.now() },
      timestamp: Date.now()
    });

    const deltaExId = await enqueueCourseDelta({
      courseId,
      userId,
      entityType: 'EXERCISE_ANSWER',
      entityId: 'ex-01',
      payload: { score: 100, selected: 'C' },
      timestamp: Date.now()
    });

    const deltaQuizId = await enqueueCourseDelta({
      courseId,
      userId,
      entityType: 'QUIZ_SUBMIT',
      entityId: 'quiz-01',
      payload: { score: 95, passed: true },
      timestamp: Date.now()
    });

    expect(deltaMatId).toBeGreaterThan(0);
    expect(deltaExId).toBeGreaterThan(deltaMatId);
    expect(deltaQuizId).toBeGreaterThan(deltaExId);

    const pending = await getPendingCourseDeltas(courseId, userId);
    expect(pending.length).toBe(3);
    expect(pending.every(d => d.synced === 0)).toBe(true);

    const matDelta = pending.find(d => d.entityType === 'MATERIAL_READ');
    expect(matDelta?.entityId).toBe('mat-01');

    const exDelta = pending.find(d => d.entityType === 'EXERCISE_ANSWER');
    expect(exDelta?.entityId).toBe('ex-01');
    expect((exDelta?.payload as any)?.score).toBe(100);
  });

  // 3. Pengujian batching & aggregasi deltas saat sinkronisasi periodik (20–30s throttle)
  it('3. should batch and aggregate multiple deltas during periodic sync ticker (25s)', async () => {
    const courseId = 'course-snbt-batch';
    const userId = 'user-batch-001';

    // Seed local progress baseline
    await saveCourseProgressLocal({
      id: `${courseId}_${userId}`,
      courseId,
      userId,
      completedMaterials: ['mat-01'],
      exerciseScores: { 'ex-01': 80 },
      quizScores: {},
      overallProgress: 20,
      updatedAt: Date.now()
    });

    // Enqueue 9 rapid deltas
    for (let i = 2; i <= 6; i++) {
      await enqueueCourseDelta({
        courseId,
        userId,
        entityType: 'MATERIAL_READ',
        entityId: `mat-0${i}`,
        payload: {},
        timestamp: Date.now()
      });
    }

    for (let i = 2; i <= 5; i++) {
      await enqueueCourseDelta({
        courseId,
        userId,
        entityType: 'EXERCISE_ANSWER',
        entityId: `ex-0${i}`,
        payload: { score: 90 + i },
        timestamp: Date.now()
      });
    }

    const pendingBefore = await getPendingCourseDeltas(courseId, userId);
    expect(pendingBefore.length).toBe(9);

    // Trigger syncAllPending (the method invoked by periodic 25s ticker)
    const syncSuccess = await batchSyncManager.syncAllPending();
    expect(syncSuccess).toBe(true);

    // Deltas should now be marked synced=1
    const pendingAfter = await getPendingCourseDeltas(courseId, userId);
    expect(pendingAfter.length).toBe(0);

    // Verify aggregated record stored in remote mockSupabase (user_course_progress table)
    const { data: remoteRecords } = await mockSupabaseClient
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId);

    expect(remoteRecords).toBeDefined();
    expect(remoteRecords?.length).toBe(1);

    const remote = remoteRecords![0];
    // Aggregation check: completed_materials must contain mat-01 to mat-06
    expect(remote.completed_materials).toContain('mat-01');
    expect(remote.completed_materials).toContain('mat-02');
    expect(remote.completed_materials).toContain('mat-06');
    expect(remote.exercise_scores['ex-01']).toBe(80);
    expect(remote.exercise_scores['ex-05']).toBe(95);
  });

  // 4. Pengujian milestone bypass sync (saat kuis submit langsung memicu instant flush)
  it('4. should bypass throttle interval and trigger instant flush upon quiz milestone submit', async () => {
    const courseId = 'course-snbt-milestone';
    const userId = 'user-milestone-001';

    await saveCourseProgressLocal({
      id: `${courseId}_${userId}`,
      courseId,
      userId,
      completedMaterials: ['mat-01'],
      exerciseScores: {},
      quizScores: {},
      overallProgress: 30,
      updatedAt: Date.now()
    });

    // User completes a quiz
    await enqueueCourseDelta({
      courseId,
      userId,
      entityType: 'QUIZ_SUBMIT',
      entityId: 'quiz-milestone-final',
      payload: { score: 96, passed: true },
      timestamp: Date.now()
    });

    // Milestone event: calls syncCourseMilestone directly without waiting 25s
    const syncSuccess = await batchSyncManager.syncCourseMilestone(courseId, userId);
    expect(syncSuccess).toBe(true);

    // Verify queue is immediately emptied
    const remainingDeltas = await getPendingCourseDeltas(courseId, userId);
    expect(remainingDeltas.length).toBe(0);

    // Verify remote received instant quiz submission
    const { data: remoteRecords } = await mockSupabaseClient
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId);

    expect(remoteRecords?.length).toBe(1);
    expect(remoteRecords![0].quiz_scores['quiz-milestone-final']).toBe(96);
  });

  // 5. Pengujian idempotensi delta (tidak terjadi duplikasi pencatatan skor)
  it('5. should guarantee delta idempotency preventing duplicate score and material entries', async () => {
    const courseId = 'course-snbt-idempotency';
    const userId = 'user-idem-001';

    await saveCourseProgressLocal({
      id: `${courseId}_${userId}`,
      courseId,
      userId,
      completedMaterials: ['mat-alpha'],
      exerciseScores: { 'ex-alpha': 90 },
      quizScores: {},
      overallProgress: 40,
      updatedAt: Date.now()
    });

    // Enqueue duplicate deltas (e.g. repeated user double-clicks or retries)
    await enqueueCourseDelta({
      courseId,
      userId,
      entityType: 'MATERIAL_READ',
      entityId: 'mat-alpha', // Already in base
      payload: {},
      timestamp: Date.now()
    });

    await enqueueCourseDelta({
      courseId,
      userId,
      entityType: 'MATERIAL_READ',
      entityId: 'mat-beta',
      payload: {},
      timestamp: Date.now()
    });

    await enqueueCourseDelta({
      courseId,
      userId,
      entityType: 'MATERIAL_READ',
      entityId: 'mat-beta', // Duplicate read of beta
      payload: {},
      timestamp: Date.now() + 1
    });

    await enqueueCourseDelta({
      courseId,
      userId,
      entityType: 'EXERCISE_ANSWER',
      entityId: 'ex-alpha',
      payload: 95, // Overwrite ex-alpha score
      timestamp: Date.now()
    });

    await enqueueCourseDelta({
      courseId,
      userId,
      entityType: 'EXERCISE_ANSWER',
      entityId: 'ex-alpha',
      payload: 95, // Duplicate score submission
      timestamp: Date.now() + 1
    });

    // First sync run
    const successFirst = await batchSyncManager.syncCourseProgress(courseId, userId);
    expect(successFirst).toBe(true);

    // Second sync run immediately (re-sync simulation)
    const successSecond = await batchSyncManager.syncCourseProgress(courseId, userId);
    expect(successSecond).toBe(true);

    const { data: remoteData } = await mockSupabaseClient
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId);

    expect(remoteData?.length).toBe(1);
    const row = remoteData![0];

    // Array should have unique material IDs without duplication
    const completedList = row.completed_materials;
    const uniqueMaterials = Array.from(new Set(completedList));
    expect(completedList.length).toBe(uniqueMaterials.length);
    expect(completedList).toContain('mat-alpha');
    expect(completedList).toContain('mat-beta');

    // Exercise scores should have exactly the single latest score
    expect(row.exercise_scores['ex-alpha']).toBe(95);
    expect(Object.keys(row.exercise_scores).length).toBe(1);
  });
});
