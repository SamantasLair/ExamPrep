import { db } from './db';

/**
 * Cleanses all client-side persistent exam caches and Dexie tables.
 * Empties Dexie tables: sessions, answersQueue, scratchpads, flagged, testsCache,
 * offlineSubmissions, courseProgress, progressDeltas.
 * Cleanses localStorage keys starting with 'exaprep_' and 'exam_session_'.
 */
export async function clearAllLocalExamData(): Promise<void> {
  // 1. Clear Dexie IndexedDB tables
  try {
    await Promise.all([
      db.sessions.clear(),
      db.answersQueue.clear(),
      db.scratchpads.clear(),
      db.flagged.clear(),
      db.testsCache.clear(),
      db.offlineSubmissions.clear(),
      db.courseProgress.clear(),
      db.progressDeltas.clear(),
    ]);
  } catch (error) {
    console.error('Failed to clear some Dexie tables:', error);
  }

  // 2. Clear matching localStorage keys
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('exaprep_') || key.startsWith('exam_session_'))) {
          keysToRemove.push(key);
        }
      }
      for (const k of keysToRemove) {
        localStorage.removeItem(k);
      }
    } catch (error) {
      console.error('Failed to clear matching localStorage keys:', error);
    }
  }
}
