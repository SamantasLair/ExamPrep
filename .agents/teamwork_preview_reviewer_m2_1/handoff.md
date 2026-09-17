# Handoff Report: Review of Milestone 2 (Features F08 - F11)

**Reviewer Agent**: `teamwork_preview_reviewer_m2_1`  
**Working Directory**: `C:\laragon\www\_MyCV\ExamPreparer\.agents\teamwork_preview_reviewer_m2_1`  
**Verdict**: **REQUEST_CHANGES**  

---

## 1. Observation

### 1.1 Verified Passing Implementations
1. **Feature F08 — View Transitions Utility (`src/lib/viewTransitions.ts`)**:
   - Lines 19-67 implement `runSafeViewTransition(updateFn: () => void, onFinished?: () => void): void`.
   - Uses `document.startViewTransition` with `flushSync` from `'react-dom'`.
   - Resolves `onFinished` cleanly on `transition.finished.finally(...)` or `.then(ok, err)` fallback.
   - Provides resilient fallback on missing browser support or synchronous execution error.
2. **Feature F09 — Scoped View Transition Canvas (`src/app/globals.css`, `ExamRunner.tsx`, `review/page.tsx`)**:
   - `globals.css` (lines 226-234): `.exam-viewport-transition` configured with `view-transition-name: exam-canvas`.
   - `ExamRunner.tsx` (line 875) & `review/page.tsx` (line 468): Canvas container tagged with `exam-viewport-transition`.
   - Command Bar (`h-14`) and bottom navigation bar remain excluded from view-transition snapshotting, preventing jitter/flicker.
   - `@media (prefers-reduced-motion: reduce)` in `globals.css` (lines 240-245) disables view transitions cleanly.
3. **Feature F11 — Accessibility Focus Management (`src/lib/viewTransitions.ts`, `QuestionRenderer.tsx`)**:
   - `focusQuestionCard(questionId)` routes programmatic focus to `id="question-card-${questionId}"` with `tabIndex = -1` and `{ preventScroll: true }`, complying with WCAG 2.4.3 (Focus Order).
   - Card outer wrappers in `QuestionRenderer.tsx` (lines 71, 321, 329, 340) render `id={`question-card-${question.id}`}` and `tabIndex={-1}`.

### 1.2 Critical Defect Observed: Feature F10 Active Question Index & Page Hijack
- **Locations**:
  - `src/components/exam/ExamRunner.tsx` (lines 151-162):
    ```typescript
    const syncActiveQuestion = useCallback((qIdOrIdx: string | number) => {
      let idx = -1;
      if (typeof qIdOrIdx === 'number' && qIdOrIdx >= 0 && qIdOrIdx < questions.length && questions[qIdOrIdx]) {
        idx = qIdOrIdx;
      } else {
        idx = questions.findIndex(q => q.id === qIdOrIdx || q.id.toString() === qIdOrIdx.toString());
      }
      if (idx !== -1) {
        setCurrentSingleIdx(idx);
        setCurrentBatchPage(Math.floor(idx / 5) + 1);
      }
    }, [questions]);
    ```
  - `src/app/exam/[id]/review/page.tsx` (lines 120-131):
    ```typescript
    const syncActiveQuestion = useCallback((qIdOrIdx: string | number) => {
      let idx = -1;
      if (typeof qIdOrIdx === 'number' && qIdOrIdx >= 0 && qIdOrIdx < filteredQuestions.length && filteredQuestions[qIdOrIdx]) {
        idx = qIdOrIdx;
      } else {
        idx = filteredQuestions.findIndex(q => q.id === qIdOrIdx || q.id.toString() === qIdOrIdx.toString());
      }
      if (idx !== -1) {
        setCurrentSingleIdx(idx);
        setCurrentBatchPage(Math.floor(idx / 5) + 1);
      }
    }, [filteredQuestions]);
    ```
  - Call sites in `ExamRunner.tsx`:
    - Line 165 (`toggleFlag`): `syncActiveQuestion(qId)` — passes question ID (type `string | number`).
    - Line 208 (`onAnswerWrapped`): `syncActiveQuestion(qId)` — passes question ID.
    - Lines 592-593 (`renderQuestionCard`): `onClick={() => syncActiveQuestion(q.id)}` and `onFocusCapture={() => syncActiveQuestion(q.id)}` — passes `q.id`.
  - Call sites in `review/page.tsx`:
    - Lines 583-584: `onClick={() => syncActiveQuestion(q.id)}` and `onFocusCapture={() => syncActiveQuestion(q.id)}`
    - Lines 605-606: `onClick={() => syncActiveQuestion(item.question.id)}`
    - Lines 629-630: `onClick={() => syncActiveQuestion(q.id)}`

---

## 2. Logic Chain

1. In ExamPreparer, questions parsed via `parseMarkdown` (`src/lib/parser.ts:350`) have numeric IDs derived from `# Q(\d+)`:
   - Question 1 has `id: 1` and resides at index `0` of `questions[]`.
   - Question 2 has `id: 2` and resides at index `1` of `questions[]`.
   - Question 5 has `id: 5` and resides at index `4` of `questions[]` (Batch Page 1).
2. When the user interacts with Question 1 (clicks option, types essay, flags, or clicks card), `syncActiveQuestion(1)` is invoked with `qIdOrIdx = 1`.
3. `typeof qIdOrIdx === 'number'` is `true`, and `1 >= 0 && 1 < questions.length` is `true`.
4. The condition evaluates to `true`, directly setting `idx = 1`.
   - **Index 1 corresponds to Question 2**, not Question 1!
   - `currentSingleIdx` is desynchronized by +1.
5. When the user interacts with Question 5 (`id: 5`, at index `4` on Page 1):
   - `idx` is set to `5` (Question 6, on Page 2).
   - `setCurrentBatchPage(Math.floor(5 / 5) + 1)` calculates `Math.floor(1) + 1 = 2`.
   - **The batch page immediately flips from Page 1 to Page 2**, unexpectedly jumping away from the question the student is answering.
6. When keyboard shortcuts (`A-E`, `1-5`) are pressed in Mode 5 (`ExamRunner.tsx:375`), they operate on `questions[currentSingleIdx]`. Because `currentSingleIdx` was set to the wrong question, the answer is recorded against the incorrect question.
7. Switching back from Mode 5 or Mode All to Mode 1 via `handleModeChange('1')` relies on `currentSingleIdx`. Due to the corruption, the user lands on the wrong question.

### Empirical Reproduction Proof
Executed command:
```bash
node -e "
const questions = [
  { id: 1, text: 'Q1' },
  { id: 2, text: 'Q2' },
  { id: 3, text: 'Q3' },
  { id: 4, text: 'Q4' },
  { id: 5, text: 'Q5' },
  { id: 6, text: 'Q6' }
];

function syncActiveQuestionCurrent(qIdOrIdx) {
  let idx = -1;
  if (typeof qIdOrIdx === 'number' && qIdOrIdx >= 0 && qIdOrIdx < questions.length && questions[qIdOrIdx]) {
    idx = qIdOrIdx;
  } else {
    idx = questions.findIndex(q => q.id === qIdOrIdx || q.id.toString() === qIdOrIdx.toString());
  }
  const page = Math.floor(idx / 5) + 1;
  return { idx, targetQuestion: questions[idx]?.text, page };
}

console.log('Clicking Q1 (id: 1):', syncActiveQuestionCurrent(1));
console.log('Clicking Q5 (id: 5):', syncActiveQuestionCurrent(5));
"
```
**Output**:
```
Clicking Q1 (id: 1): { idx: 1, targetQuestion: 'Q2', page: 1 }
Clicking Q5 (id: 5): { idx: 5, targetQuestion: 'Q6', page: 2 }
```
**Proof**: Clicking Q1 targets Q2 (off-by-one). Clicking Q5 targets Q6 and changes the active page to 2.

---

## 3. Caveats

- Unit tests (`npm run test`) currently pass (55/55) because the existing test suite does not include a test specifically asserting `syncActiveQuestion` with numeric `Question.id`.
- The type check (`npx tsc --noEmit`) passes because `qIdOrIdx` accepts `string | number`, hiding the semantic confusion between ID and array index.

---

## 4. Conclusion & Required Changes

**Verdict**: **REQUEST_CHANGES**

Worker 2 must fix the index resolution logic in both `src/components/exam/ExamRunner.tsx` and `src/app/exam/[id]/review/page.tsx`.

### Recommended Fix:
Look up by Question ID first. Only if no matching Question ID is found, fallback to checking if it is a valid 0-based array index:

In `src/components/exam/ExamRunner.tsx`:
```typescript
const syncActiveQuestion = useCallback((qIdOrIdx: string | number) => {
  let idx = questions.findIndex(q => q.id === qIdOrIdx || String(q.id) === String(qIdOrIdx));
  if (idx === -1 && typeof qIdOrIdx === 'number' && qIdOrIdx >= 0 && qIdOrIdx < questions.length) {
    idx = qIdOrIdx;
  }
  if (idx !== -1) {
    setCurrentSingleIdx(idx);
    setCurrentBatchPage(Math.floor(idx / 5) + 1);
  }
}, [questions]);
```

In `src/app/exam/[id]/review/page.tsx`:
```typescript
const syncActiveQuestion = useCallback((qIdOrIdx: string | number) => {
  let idx = filteredQuestions.findIndex(q => q.id === qIdOrIdx || String(q.id) === String(qIdOrIdx));
  if (idx === -1 && typeof qIdOrIdx === 'number' && qIdOrIdx >= 0 && qIdOrIdx < filteredQuestions.length) {
    idx = qIdOrIdx;
  }
  if (idx !== -1) {
    setCurrentSingleIdx(idx);
    setCurrentBatchPage(Math.floor(idx / 5) + 1);
  }
}, [filteredQuestions]);
```

---

## 5. Verification Method

1. **Empirical Reproduction Verification**:
   Execute the verification script to verify that with the fixed logic:
   - Clicking Q1 (`id: 1`) produces `{ idx: 0, targetQuestion: 'Q1', page: 1 }`.
   - Clicking Q5 (`id: 5`) produces `{ idx: 4, targetQuestion: 'Q5', page: 1 }`.
2. **Project Tests**:
   ```bash
   npm run test
   ```
   Must pass 100%.
3. **TypeScript Validation**:
   ```bash
   npx tsc --noEmit
   ```
   Must exit with code 0.
