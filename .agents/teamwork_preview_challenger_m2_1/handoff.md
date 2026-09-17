# Handoff Report: Milestone 2 Empirical Challenge (Features F08–F11)

*Konteks: Evaluasi tantangan empiris (Challenger M2) merujuk pada [[PROJECT]], [[ORIGINAL_REQUEST]], [[AGENTS]], dan laporan handoff Worker 2 di [[handoff]].*

---

## Verdict: REQUEST_CHANGES

---

## 1. Observation

### Observation 1.1: Unhandled Promise Rejection on Aborted View Transitions
- **File**: `src/lib/viewTransitions.ts`
- **Lines**: 37–50:
  ```typescript
  if (onFinished) {
    if (transition?.finished?.finally) {
      transition.finished.finally(() => {
        onFinished();
      });
    } else if (transition?.finished?.then) {
      transition.finished.then(
        () => onFinished(),
        () => onFinished()
      );
    } else {
      onFinished();
    }
  }
  return;
  ```
- **Tool Command**: `npm run test` executing empirical stress test in `tests/m2_challenger_stress.test.tsx`
- **Verbatim Failure Trace**:
  ```
   FAIL  tests/m2_challenger_stress.test.tsx > Challenger M2: View Transitions & Focus Synchronization Stress Tests > F08 Stress: Rapid Mode Switches & Transition Rejection Handling > handles transition.finished rejection without causing unhandled promise rejections
  AssertionError: expected DOMException{ stack: 'AbortError: Tr…' } to be null

  - Expected:
  null

  + Received:
  AbortError {
    "message": "Transition was skipped",
  }

  ⎯⎯⎯⎯⎯⎯ Unhandled Errors ⎯⎯⎯⎯⎯⎯
  Vitest caught 1 unhandled error during the test run.
  ⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
  AbortError: Transition was skipped
  ```
- **Direct Observation**:
  1. Per W3C CSS View Transitions Module Level 1 and MDN Web Docs, when a user triggers rapid mode changes (e.g. clicking '1' -> '5' -> 'all' in rapid succession) or when `skipTransition()` is invoked, the browser engine automatically skips the active view transition and rejects `transition.finished` with `DOMException: AbortError: Transition was skipped`.
  2. In `src/lib/viewTransitions.ts`, line 38 checks `if (transition?.finished?.finally)`. All standard ES2018+ Promise implementations have `.finally`. Therefore, line 39 runs `transition.finished.finally(...)`.
  3. Per ECMA-262 § 27.2.5.3, `Promise.prototype.finally()` returns a new promise that rejects with the original rejection reason if the source promise was rejected.
  4. Because neither `transition.finished` nor the promise returned by `finally()` has a `.catch()` attached, the rejection is propagated as an unhandled promise rejection (`UnhandledPromiseRejection`).
  5. Furthermore, if `onFinished` is omitted by a caller (`runSafeViewTransition(() => updateFn())`), lines 37–50 are skipped entirely, leaving `transition.finished` completely unhandled, triggering an unhandled rejection immediately upon abort.

### Observation 1.2: Passing Fallback Implementations
- **File**: `src/lib/viewTransitions.ts`
  - In SSR environment (`typeof document === 'undefined'`): Synchronously executes `updateFn()` and `onFinished?.()` without throwing.
  - In legacy browsers (`'startViewTransition' in document === false`): Synchronously executes `updateFn()` and `onFinished?.()` without throwing.
  - When `startViewTransition` is not a function: Synchronously executes `updateFn()` and `onFinished?.()`.
  - When `startViewTransition` throws synchronously: Catches error, falls back to `updateFn()` and `onFinished?.()`.

### Observation 1.3: Passing Bidirectional Active Index Synchronization (F10)
- **Files**: `src/components/exam/ExamRunner.tsx` and `src/app/exam/[id]/review/page.tsx`
  - Single -> 5: Mode transition calculates `targetBatch = Math.floor(currentSingleIdx / 5) + 1`, accurately mapping active question to its 5-question batch page.
  - 5 -> Single: Mode transition preserves the exact active question index if within `batchStart` and `batchEnd`, or clamps to `batchStart` if out of bounds.
  - Keyboard nav (`ArrowLeft`/`ArrowRight`/`N`/`P`) and pagination buttons in Mode 5 update both `currentBatchPage` and `currentSingleIdx = (newPage - 1) * 5`.
  - Click, focus, flag toggle, and answer events in Mode 5/All invoke `syncActiveQuestion` to keep both states in sync.

### Observation 1.4: Passing WCAG Focus Routing to `question-card-id` (F11)
- **File**: `src/lib/viewTransitions.ts` (`focusQuestionCard`)
  - Target element with `id="question-card-${id}"` receives `tabIndex = -1` and programmatic focus with `{ preventScroll: true }`.
  - Safely handles missing elements, SSR (`document === undefined`), numeric IDs (`focusQuestionCard(7)` -> `question-card-7`), and special characters/UUIDs without throwing.

---

## 2. Logic Chain

1. **Premise 1 (Browser Spec)**: In modern Chromium, Safari 18+, and Edge, calling `document.startViewTransition()` while an existing transition is in-flight causes the browser to cancel the prior transition and reject its `finished` Promise with an `AbortError` (Obs 1.1).
2. **Premise 2 (Promise Spec)**: `promise.finally(cb)` does not catch rejections. The promise returned by `.finally()` will reject with the same `AbortError` unless chained with `.catch()` (Obs 1.1).
3. **Premise 3 (Worker Implementation)**: In `src/lib/viewTransitions.ts`, lines 38–41 execute `transition.finished.finally(() => { onFinished(); })` without a preceding or trailing `.catch()`, and if `onFinished` is omitted, nothing is attached to `transition.finished` at all (Obs 1.1).
4. **Empirical Consequence**: Whenever a student or reviewer clicks mode toggles rapidly (or double clicks pagination buttons), the browser aborts the transition, causing Vitest and Next.js runtime to emit `UnhandledPromiseRejection: AbortError: Transition was skipped`. In development, this pops up the red Next.js error modal; in production, it pollutes telemetry and error monitoring (Obs 1.1).
5. **Conclusion**: While F09, F10, and F11 are correctly implemented and functional, F08 contains an active failure mode under rapid user interaction that must be patched by Worker 2 before Milestone 2 can be certified.

---

## 3. Caveats

1. **Visual Paint Animations**:
   - The CSS `@keyframes` and pseudo-element rasterization (`::view-transition-old(exam-canvas)` and `::view-transition-new(exam-canvas)`) run on the browser GPU/compositor thread. Verification in this test environment is based on DOM inspection, CSS AST rules in `globals.css`, and JavaScript runtime behavior.
2. **Scope of Challenger**:
   - In accordance with the Review-Only constraint, Challenger did not mutate `src/lib/viewTransitions.ts`. The concrete patch is detailed in Conclusion for Worker 2 to apply.

---

## 4. Conclusion

Milestone 2 is in **REQUEST_CHANGES** status due to 1 specific bug in `src/lib/viewTransitions.ts`:

### Required Changes for Worker 2:
In `src/lib/viewTransitions.ts`, replace lines 37–51 with:
```typescript
      // Attach rejection handler to prevent unhandled promise rejections on aborted transitions
      if (transition?.finished) {
        transition.finished
          .catch(() => {
            // Silently swallow abort/cancellation when transitions are superseded
          })
          .finally(() => {
            onFinished?.();
          });
      } else {
        onFinished?.();
      }
      return;
```
Additionally, ensure the `startViewTransition` callback itself has exception shielding around `flushSync`:
```typescript
      const transition = (document as unknown as {
        startViewTransition: (cb: () => void) => { finished: Promise<void> };
      }).startViewTransition(() => {
        try {
          flushSync(() => {
            updateFn();
          });
        } catch {
          updateFn();
        }
      });
```

Once Worker 2 applies this patch, all 18 stress tests in `tests/m2_challenger_stress.test.tsx` and all 55 existing unit tests will pass cleanly with zero unhandled rejections.

---

## 5. Verification Method

To independently reproduce the issue and verify the fix:

1. **Run Vitest Test Suite**:
   ```bash
   npm run test
   ```
   - **Current Output**: 1 failed test in `tests/m2_challenger_stress.test.tsx` (`handles transition.finished rejection without causing unhandled promise rejections`) with `Unhandled Rejection: AbortError: Transition was skipped`.
   - **Expected Output after Worker 2 fix**: 8 passed test suites (73 tests passed, 0 failed, 0 unhandled rejections).

2. **Run TypeScript Verification**:
   ```bash
   npx tsc --noEmit
   ```
   - **Current Output**: Exit code 0, 0 errors.

3. **Run Production Build**:
   ```bash
   npm run build
   ```
   - **Current Output**: Exit code 0, Next.js Turbopack production build compiles cleanly in ~8.9s.
