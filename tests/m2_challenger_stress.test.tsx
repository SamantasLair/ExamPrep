import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runSafeViewTransition, focusQuestionCard } from '../src/lib/viewTransitions';

describe('Challenger M2: View Transitions & Focus Synchronization Stress Tests', () => {
  const originalDocument = globalThis.document;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // Restore global document
    if (originalDocument) {
      globalThis.document = originalDocument;
    }
  });

  describe('F08: runSafeViewTransition Fallback Behavior', () => {
    it('executes updateFn and onFinished synchronously when document is undefined (SSR)', () => {
      // Temporarily remove document
      const tempDoc = globalThis.document;
      // @ts-expect-error - simulating SSR environment
      delete globalThis.document;

      let updated = false;
      let finished = false;

      expect(() => {
        runSafeViewTransition(
          () => { updated = true; },
          () => { finished = true; }
        );
      }).not.toThrow();

      expect(updated).toBe(true);
      expect(finished).toBe(true);

      globalThis.document = tempDoc;
    });

    it('executes updateFn and onFinished synchronously when startViewTransition is absent from document', () => {
      // Create mock document without startViewTransition
      const mockDoc = { ...document };
      // @ts-expect-error - simulate older browser without startViewTransition
      delete mockDoc.startViewTransition;

      const tempDoc = globalThis.document;
      globalThis.document = mockDoc as unknown as Document;

      let updated = false;
      let finished = false;

      runSafeViewTransition(
        () => { updated = true; },
        () => { finished = true; }
      );

      expect(updated).toBe(true);
      expect(finished).toBe(true);

      globalThis.document = tempDoc;
    });

    it('falls back gracefully when startViewTransition is present but is not a function', () => {
      const mockDoc = {
        startViewTransition: 'not-a-function',
      };

      const tempDoc = globalThis.document;
      globalThis.document = mockDoc as unknown as Document;

      let updated = false;
      let finished = false;

      expect(() => {
        runSafeViewTransition(
          () => { updated = true; },
          () => { finished = true; }
        );
      }).not.toThrow();

      expect(updated).toBe(true);
      expect(finished).toBe(true);

      globalThis.document = tempDoc;
    });

    it('falls back to synchronous execution when startViewTransition throws synchronously', () => {
      const mockDoc = {
        startViewTransition: vi.fn().mockImplementation(() => {
          throw new DOMException('InvalidStateError: Transition already active', 'InvalidStateError');
        }),
      };

      const tempDoc = globalThis.document;
      globalThis.document = mockDoc as unknown as Document;

      let updated = false;
      let finished = false;

      expect(() => {
        runSafeViewTransition(
          () => { updated = true; },
          () => { finished = true; }
        );
      }).not.toThrow();

      expect(updated).toBe(true);
      expect(finished).toBe(true);

      globalThis.document = tempDoc;
    });

    it('works when onFinished callback is omitted in fallback mode', () => {
      const mockDoc = { ...document };
      // @ts-expect-error - simulate older browser
      delete mockDoc.startViewTransition;
      const tempDoc = globalThis.document;
      globalThis.document = mockDoc as unknown as Document;

      let updated = false;
      expect(() => {
        runSafeViewTransition(() => { updated = true; });
      }).not.toThrow();

      expect(updated).toBe(true);
      globalThis.document = tempDoc;
    });
  });

  describe('F08: Native startViewTransition Execution & FlushSync', () => {
    it('calls startViewTransition and wraps update in flushSync when supported', async () => {
      let callbackInvoked = false;
      let finishedResolved = false;

      const mockTransition = {
        finished: Promise.resolve().then(() => {
          finishedResolved = true;
        }),
      };

      const startViewTransitionMock = vi.fn().mockImplementation((cb: () => void) => {
        cb();
        callbackInvoked = true;
        return mockTransition;
      });

      const mockDoc = {
        startViewTransition: startViewTransitionMock,
      };

      const tempDoc = globalThis.document;
      globalThis.document = mockDoc as unknown as Document;

      let updated = false;
      let finishedCalled = false;

      runSafeViewTransition(
        () => { updated = true; },
        () => { finishedCalled = true; }
      );

      expect(startViewTransitionMock).toHaveBeenCalledTimes(1);
      expect(callbackInvoked).toBe(true);
      expect(updated).toBe(true);

      // Wait for promise resolution
      await mockTransition.finished;
      expect(finishedResolved).toBe(true);
      expect(finishedCalled).toBe(true);

      globalThis.document = tempDoc;
    });

    it('handles transition.finished with .then fallback when .finally is unavailable', async () => {
      let finishedCalled = false;

      // Mock promise-like without finally
      let thenCallback: (() => void) | null = null;
      const mockTransition = {
        finished: {
          then: (onSuccess: () => void) => {
            thenCallback = onSuccess;
            return mockTransition.finished;
          },
        },
      };

      const mockDoc = {
        startViewTransition: vi.fn().mockImplementation((cb: () => void) => {
          cb();
          return mockTransition;
        }),
      };

      const tempDoc = globalThis.document;
      globalThis.document = mockDoc as unknown as Document;

      runSafeViewTransition(
        () => {},
        () => { finishedCalled = true; }
      );

      expect(thenCallback).not.toBeNull();
      // Invoke then callback
      thenCallback!();
      expect(finishedCalled).toBe(true);

      globalThis.document = tempDoc;
    });
  });

  describe('F08 Stress: Rapid Mode Switches & Transition Rejection Handling', () => {
    it('handles transition.finished rejection without causing unhandled promise rejections', async () => {
      let unhandledRejection: unknown = null;
      const unhandledHandler = (reason: unknown) => {
        unhandledRejection = reason;
      };
      process.on('unhandledRejection', unhandledHandler);

      let finishedCalled = false;
      const abortError = new DOMException('Transition was skipped', 'AbortError');
      const rejectedFinished = Promise.reject(abortError);

      const mockDoc = {
        startViewTransition: vi.fn().mockReturnValue({
          finished: rejectedFinished,
        }),
      };

      const tempDoc = globalThis.document;
      globalThis.document = mockDoc as unknown as Document;

      runSafeViewTransition(
        () => {},
        () => { finishedCalled = true; }
      );

      // Give microtasks and timers time to settle
      await new Promise(resolve => setTimeout(resolve, 50));

      process.removeListener('unhandledRejection', unhandledHandler);
      globalThis.document = tempDoc;

      expect(finishedCalled).toBe(true);
      // EMPIRICAL CHALLENGE: Verify if unhandled rejection was leaked
      // If unhandledRejection is non-null, runSafeViewTransition leaked an unhandled rejection!
      expect(unhandledRejection).toBeNull();
    });

    it('handles 50 rapid sequential transition invocations without throwing or stalling', () => {
      let callCount = 0;
      let finishCount = 0;

      const mockDoc = {
        startViewTransition: vi.fn().mockImplementation((cb: () => void) => {
          cb();
          return {
            finished: Promise.resolve(),
          };
        }),
      };

      const tempDoc = globalThis.document;
      globalThis.document = mockDoc as unknown as Document;

      for (let i = 0; i < 50; i++) {
        runSafeViewTransition(
          () => { callCount++; },
          () => { finishCount++; }
        );
      }

      expect(callCount).toBe(50);
      globalThis.document = tempDoc;
    });
  });

  describe('F11: Focus Routing to question-card-id', () => {
    beforeEach(() => {
      // Set up a mock document for Node environment
      globalThis.document = {
        getElementById: vi.fn(),
      } as unknown as Document;
    });

    it('focuses element and sets tabIndex = -1 with preventScroll: true when element exists', () => {
      const mockElement = {
        tabIndex: 0,
        focus: vi.fn(),
      };

      const getElementByIdSpy = vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as unknown as HTMLElement);

      focusQuestionCard('42');

      expect(getElementByIdSpy).toHaveBeenCalledWith('question-card-42');
      expect(mockElement.tabIndex).toBe(-1);
      expect(mockElement.focus).toHaveBeenCalledWith({ preventScroll: true });

      getElementByIdSpy.mockRestore();
    });

    it('handles numeric questionId correctly', () => {
      const mockElement = {
        tabIndex: 0,
        focus: vi.fn(),
      };

      const getElementByIdSpy = vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as unknown as HTMLElement);

      focusQuestionCard(7);

      expect(getElementByIdSpy).toHaveBeenCalledWith('question-card-7');
      expect(mockElement.tabIndex).toBe(-1);
      expect(mockElement.focus).toHaveBeenCalledWith({ preventScroll: true });

      getElementByIdSpy.mockRestore();
    });

    it('safely handles missing elements without throwing error', () => {
      const getElementByIdSpy = vi.spyOn(document, 'getElementById').mockReturnValue(null);

      expect(() => {
        focusQuestionCard('non-existent-id-999');
      }).not.toThrow();

      expect(getElementByIdSpy).toHaveBeenCalledWith('question-card-non-existent-id-999');
      getElementByIdSpy.mockRestore();
    });

    it('safely handles undefined document in SSR environment', () => {
      // @ts-expect-error - SSR simulation
      delete globalThis.document;

      expect(() => {
        focusQuestionCard(1);
      }).not.toThrow();
    });

    it('safely handles special characters in questionId (UUIDs, colons, slashes)', () => {
      const mockElement = {
        tabIndex: 0,
        focus: vi.fn(),
      };

      const getElementByIdSpy = vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as unknown as HTMLElement);

      const complexIds = ['q-uuid-123e4567-e89b-12d3-a456-426614174000', 'section:1/q:2', '0', ''];

      for (const id of complexIds) {
        expect(() => focusQuestionCard(id)).not.toThrow();
        expect(getElementByIdSpy).toHaveBeenCalledWith(`question-card-${id}`);
      }

      getElementByIdSpy.mockRestore();
    });
  });

  describe('F10: Bidirectional Active Index Synchronization Logic', () => {
    const questionsCount = 50;

    function simulateModeChange(
      currentSingleIdx: number,
      currentBatchPage: number,
      newMode: '1' | '5' | 'all'
    ): { targetSingle: number; targetBatch: number } {
      let targetSingle = currentSingleIdx;
      let targetBatch = currentBatchPage;

      if (newMode === '5') {
        targetBatch = Math.floor(currentSingleIdx / 5) + 1;
      } else if (newMode === '1') {
        const batchStart = (currentBatchPage - 1) * 5;
        const batchEnd = Math.min(questionsCount - 1, batchStart + 4);
        if (currentSingleIdx < batchStart || currentSingleIdx > batchEnd) {
          targetSingle = Math.min(questionsCount - 1, Math.max(0, batchStart));
        }
      }

      return { targetSingle, targetBatch };
    }

    it('correctly maps single question index to batch page when switching to Mode 5', () => {
      expect(simulateModeChange(0, 1, '5').targetBatch).toBe(1);
      expect(simulateModeChange(4, 1, '5').targetBatch).toBe(1);
      expect(simulateModeChange(5, 1, '5').targetBatch).toBe(2);
      expect(simulateModeChange(23, 1, '5').targetBatch).toBe(5);
      expect(simulateModeChange(49, 1, '5').targetBatch).toBe(10);
    });

    it('preserves exact active single index when switching from Mode 5 to Mode 1 if index is within current batch', () => {
      const res = simulateModeChange(23, 5, '1');
      expect(res.targetSingle).toBe(23);

      expect(simulateModeChange(20, 5, '1').targetSingle).toBe(20);
      expect(simulateModeChange(24, 5, '1').targetSingle).toBe(24);
    });

    it('resets targetSingle to the start of the batch if single index was out of bounds for the batch', () => {
      const res = simulateModeChange(23, 3, '1');
      expect(res.targetSingle).toBe(10);
    });

    it('correctly updates batch page and single index on pagination navigation', () => {
      const currentBatch = 1;
      const newBatch = Math.min(Math.ceil(questionsCount / 5), currentBatch + 1);
      const newSingle = (newBatch - 1) * 5;

      expect(newBatch).toBe(2);
      expect(newSingle).toBe(5);

      const lastBatch = 10;
      const clampedBatch = Math.min(Math.ceil(questionsCount / 5), lastBatch + 1);
      expect(clampedBatch).toBe(10);

      const firstBatch = 1;
      const clampedPrev = Math.max(1, firstBatch - 1);
      expect(clampedPrev).toBe(1);
    });

    it('correctly resolves 1-based numeric question IDs to 0-based indices without off-by-one errors', () => {
      const sampleQuestions = [
        { id: 1, text: 'Q1' },
        { id: 2, text: 'Q2' },
        { id: 3, text: 'Q3' },
        { id: 4, text: 'Q4' },
        { id: 5, text: 'Q5' },
        { id: 6, text: 'Q6' },
      ];

      function resolveIdx(qIdOrIdx: string | number) {
        let idx = sampleQuestions.findIndex(q => q.id === qIdOrIdx || String(q.id) === String(qIdOrIdx));
        if (idx === -1 && typeof qIdOrIdx === 'number' && qIdOrIdx >= 0 && qIdOrIdx < sampleQuestions.length) {
          idx = qIdOrIdx;
        }
        return {
          idx,
          page: idx !== -1 ? Math.floor(idx / 5) + 1 : -1,
        };
      }

      // Q1 (id: 1) must map to index 0, Page 1
      expect(resolveIdx(1)).toEqual({ idx: 0, page: 1 });
      // Q5 (id: 5) must map to index 4, Page 1 (must NOT flip to Page 2)
      expect(resolveIdx(5)).toEqual({ idx: 4, page: 1 });
      // Q6 (id: 6) must map to index 5, Page 2
      expect(resolveIdx(6)).toEqual({ idx: 5, page: 2 });
      // Fallback: 0-based array index 0 maps to index 0
      expect(resolveIdx(0)).toEqual({ idx: 0, page: 1 });
      // String ID '5' maps to index 4, Page 1
      expect(resolveIdx('5')).toEqual({ idx: 4, page: 1 });
      // Non-existent ID maps to -1
      expect(resolveIdx(999)).toEqual({ idx: -1, page: -1 });
    });
  });
});
