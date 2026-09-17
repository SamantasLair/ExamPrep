import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../src/lib/db';
import { batchSyncManager } from '../src/lib/batchSyncManager';

describe('Dexie IndexedDB Offline-First & BatchSyncManager Suite', () => {
  beforeEach(async () => {
    await db.sessions.clear();
    await db.answersQueue.clear();
    await db.scratchpads.clear();
    await db.flagged.clear();
    await db.offlineSubmissions.clear();
  });

  it('should store and retrieve exam session state correctly', async () => {
    await db.sessions.put({
      examId: 'test-exam-1',
      answers: { '1': 'B', '2': 'C' },
      tipsUsed: { '1': [0] },
      timeLeft: 3500,
      updatedAt: Date.now()
    });

    const session = await db.sessions.get('test-exam-1');
    expect(session).toBeDefined();
    expect(session?.answers['1']).toBe('B');
    expect(session?.timeLeft).toBe(3500);
  });

  it('should enqueue answers in answersQueue with synced=0', async () => {
    await batchSyncManager.enqueueAnswer('test-exam-1', '1', 'A');
    await batchSyncManager.enqueueAnswer('test-exam-1', '2', 'D');

    const pending = await db.answersQueue.where('synced').equals(0).toArray();
    expect(pending.length).toBe(2);
    expect(pending[0].questionId).toBe('1');
    expect(pending[0].answer).toBe('A');
    expect(pending[1].questionId).toBe('2');
    expect(pending[1].answer).toBe('D');
  });

  it('should persist scratchpad and flagged items independently', async () => {
    await db.scratchpads.put({
      examId: 'test-exam-1',
      content: 'Coretan rumus: x^2 + 5x + 6 = 0',
      updatedAt: Date.now()
    });

    await db.flagged.put({
      examId: 'test-exam-1',
      flags: { '1': true, '3': false },
      updatedAt: Date.now()
    });

    const scratch = await db.scratchpads.get('test-exam-1');
    const flags = await db.flagged.get('test-exam-1');

    expect(scratch?.content).toContain('Coretan rumus');
    expect(flags?.flags['1']).toBe(true);
  });

  it('should enqueue offline submissions and batch process them', async () => {
    const subId = await batchSyncManager.enqueueSubmission('test-exam-1', 'EXA-001', {
      test_id: 'test-exam-1',
      student_id: 'EXA-001',
      responses: { '1': 'A' },
      score: 80,
      status: 'finished'
    });

    expect(subId).toBeGreaterThan(0);

    const pending = await db.offlineSubmissions.where('status').equals('pending').toArray();
    expect(pending.length).toBe(1);
    expect(pending[0].studentId).toBe('EXA-001');

    // Run syncAllPending
    const success = await batchSyncManager.syncAllPending();
    expect(success).toBe(true);

    const updated = await db.offlineSubmissions.get(subId);
    expect(updated?.status).toBe('synced');
    expect(updated?.syncedAt).toBeDefined();

    // Check answers queue marked synced
    const remainingUnsynced = await db.answersQueue.where('synced').equals(0).count();
    expect(remainingUnsynced).toBe(0);
  });
});
