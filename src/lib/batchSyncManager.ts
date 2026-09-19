import {
  db,
  getPendingCourseDeltas,
  markCourseDeltasSynced,
  getCourseProgressLocal,
  type ProgressDeltaItem,
  type CourseProgressRecord
} from './db';
import { supabase } from './supabase';

export interface BatchSyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingQueueCount: number;
  lastSyncedAt: number | null;
  error: string | null;
}

type SyncListener = (status: BatchSyncStatus) => void;

class BatchSyncManager {
  private syncIntervalMs = 25000; // 25s periodic ticker for background sync
  private timer: ReturnType<typeof setInterval> | null = null;
  private isSyncing = false;
  private listeners: Set<SyncListener> = new Set();
  private lastSyncedAt: number | null = null;
  private lastError: string | null = null;
  private isOnline = typeof navigator !== 'undefined' && 'onLine' in navigator ? Boolean(navigator.onLine) : true;

  public setOnlineStatus(online: boolean) {
    this.isOnline = online;
    this.notify();
  }

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notify();
        this.syncAllPending();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notify();
      });

      // Tri-Trigger Sync: Visibility / Unload Flush
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && this.isOnline) {
          this.flushAll();
        }
      });
      window.addEventListener('pagehide', () => {
        if (this.isOnline) {
          this.flushAll();
        }
      });
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    this.emitStatus(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => this.emitStatus(l));
  }

  private async emitStatus(listener: SyncListener) {
    let pendingCount = 0;
    try {
      pendingCount = await db.answersQueue.where('synced').equals(0).count();
      const pendingSubmissions = await db.offlineSubmissions.where('status').equals('pending').count();
      const pendingDeltas = await db.progressDeltas.where('synced').equals(0).count();
      pendingCount += pendingSubmissions + pendingDeltas;
    } catch {
      // IndexedDB might not be accessible yet in SSR
    }

    listener({
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingQueueCount: pendingCount,
      lastSyncedAt: this.lastSyncedAt,
      error: this.lastError
    });
  }

  public startPeriodicSync() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.syncAllPending();
      }
    }, this.syncIntervalMs);
  }

  public stopPeriodicSync() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Enqueue a question answer change to Dexie IndexedDB
   */
  public async enqueueAnswer(examId: string, questionId: string, answer: string) {
    try {
      await db.answersQueue.add({
        examId,
        questionId,
        answer,
        timestamp: Date.now(),
        synced: 0
      });
      this.notify();
    } catch (e) {
      console.error('[BatchSyncManager] Failed to enqueue answer:', e);
    }
  }

  /**
   * Enqueue full exam submission to Dexie when offline or on failure
   */
  public async enqueueSubmission(examId: string, studentId: string | null, payload: any): Promise<number> {
    const id = await db.offlineSubmissions.add({
      examId,
      studentId,
      payload,
      status: 'pending',
      attempts: 0,
      createdAt: Date.now()
    });
    this.notify();
    return id as number;
  }

  /**
   * Sync Course Progress:
   * Mengambil pending deltas dari Dexie, mengelompokkan per courseId & userId,
   * dan mengirim ke Supabase via RPC sync_course_progress_batch dengan fallback REST upsert.
   */
  public async syncCourseProgress(courseId?: string, userId?: string): Promise<boolean> {
    if (!this.isOnline) return false;

    try {
      const deltas: ProgressDeltaItem[] = await getPendingCourseDeltas(courseId, userId);
      if (!deltas || deltas.length === 0) return true;

      // Group deltas by courseId and userId
      const grouped = new Map<string, { courseId: string; userId: string; deltas: ProgressDeltaItem[] }>();
      for (const d of deltas) {
        const key = `${d.courseId}_${d.userId}`;
        if (!grouped.has(key)) {
          grouped.set(key, { courseId: d.courseId, userId: d.userId, deltas: [] });
        }
        grouped.get(key)!.deltas.push(d);
      }

      const payloadList: Array<{
        user_id: string;
        course_id: string;
        completed_materials: string[];
        exercise_scores: Record<string, number>;
        quiz_scores: Record<string, number>;
        overall_progress: number;
        updated_at: string;
      }> = [];

      for (const group of grouped.values()) {
        const localRecord: CourseProgressRecord | undefined = await getCourseProgressLocal(group.courseId, group.userId);

        let completedMaterials = localRecord ? [...localRecord.completedMaterials] : [];
        let exerciseScores = localRecord ? { ...localRecord.exerciseScores } : {};
        let quizScores = localRecord ? { ...localRecord.quizScores } : {};
        let overallProgress = localRecord ? localRecord.overallProgress : 0;

        // Apply deltas in memory if needed
        for (const d of group.deltas) {
          if (d.entityType === 'MATERIAL_READ') {
            if (!completedMaterials.includes(d.entityId)) {
              completedMaterials.push(d.entityId);
            }
          } else if (d.entityType === 'EXERCISE_ANSWER') {
            const score = typeof d.payload === 'number' ? d.payload : Number((d.payload as any)?.score ?? 100);
            exerciseScores[d.entityId] = score;
          } else if (d.entityType === 'QUIZ_SUBMIT') {
            const score = typeof d.payload === 'number' ? d.payload : Number((d.payload as any)?.score ?? 100);
            quizScores[d.entityId] = score;
          }
        }

        payloadList.push({
          user_id: group.userId,
          course_id: group.courseId,
          completed_materials: completedMaterials,
          exercise_scores: exerciseScores,
          quiz_scores: quizScores,
          overall_progress: overallProgress,
          updated_at: new Date().toISOString()
        });
      }

      // Try RPC first
      let syncSuccess = false;
      try {
        const { error: rpcError } = await supabase.rpc('sync_course_progress_batch', {
          p_payload: payloadList
        });
        if (!rpcError) {
          syncSuccess = true;
        } else {
          console.warn('[BatchSyncManager] RPC sync_course_progress_batch failed, trying REST fallback:', rpcError.message);
        }
      } catch (rpcErr) {
        console.warn('[BatchSyncManager] RPC call exception, trying REST fallback:', rpcErr);
      }

      // REST Fallback if RPC failed or not available
      if (!syncSuccess) {
        const { error: restError } = await supabase
          .from('user_course_progress')
          .upsert(payloadList, { onConflict: 'user_id,course_id' });

        if (restError) {
          throw new Error(`REST fallback sync failed: ${restError.message}`);
        }
        syncSuccess = true;
      }

      if (syncSuccess) {
        const deltaIds = deltas.map(d => d.id!).filter(Boolean);
        await markCourseDeltasSynced(deltaIds);
        this.lastSyncedAt = Date.now();
        this.notify();
      }

      return syncSuccess;
    } catch (err: any) {
      console.error('[BatchSyncManager] Course progress sync error:', err);
      this.lastError = err?.message || 'Gagal sync course progress';
      this.notify();
      return false;
    }
  }

  /**
   * Milestone Instant Sync:
   * Bypass throttle untuk sinkronisasi instan saat menyelesaikan materi, latihan, atau kuis.
   */
  public async syncCourseMilestone(courseId: string, userId: string): Promise<boolean> {
    return await this.syncCourseProgress(courseId, userId);
  }

  /**
   * Flush all pending exam submissions, answers, and course progress immediately
   */
  public async flushAll(): Promise<void> {
    await Promise.allSettled([
      this.syncAllPending(),
      this.syncCourseProgress()
    ]);
  }

  /**
   * Perform sync for both individual answer changes, offline attempt submissions, and course progress
   */
  public async syncAllPending(): Promise<boolean> {
    if (!this.isOnline || this.isSyncing) return false;

    this.isSyncing = true;
    this.lastError = null;
    this.notify();

    try {
      // 1. Process Offline Submissions first
      const pendingSubmissions = await db.offlineSubmissions.where('status').equals('pending').toArray();
      for (const sub of pendingSubmissions) {
        try {
          const payload = { ...sub.payload, offline_sync_at: new Date().toISOString() };
          const { data, error } = await supabase.from('attempts').insert(payload).select().single();

          if (!error && data) {
            await db.offlineSubmissions.update(sub.id!, {
              status: 'synced',
              syncedAt: Date.now()
            });
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(`exaprep_finished_${sub.examId}`, data.id);
              localStorage.removeItem(`exaprep_offline_sync_${sub.examId}`);
            }
          } else {
            throw error || new Error('Sync attempt returned no data');
          }
        } catch (subErr: any) {
          console.warn('[BatchSyncManager] Submission sync retry failed:', subErr);
          await db.offlineSubmissions.update(sub.id!, {
            attempts: sub.attempts + 1,
            errorMessage: subErr?.message || 'Network error'
          });
        }
      }

      // 2. Mark processed answer queue items
      const pendingAnswers = await db.answersQueue.where('synced').equals(0).toArray();
      if (pendingAnswers.length > 0) {
        const ids = pendingAnswers.map(a => a.id!).filter(Boolean);
        await db.answersQueue.where('id').anyOf(ids).modify({ synced: 1 });
      }

      // 3. Process Course Progress Deltas
      await this.syncCourseProgress();

      this.lastSyncedAt = Date.now();
      return true;
    } catch (err: any) {
      this.lastError = err?.message || 'Gagal sinkronisasi';
      return false;
    } finally {
      this.isSyncing = false;
      this.notify();
    }
  }
}

export const batchSyncManager = new BatchSyncManager();
