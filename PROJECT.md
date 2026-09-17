# Project: ExamPreparer Modern Web Optimization Fortress

Konteks: Dokumen spesifikasi dan arsitektur utama untuk [[ORIGINAL_REQUEST]], mematuhi [[AGENTS]] (Exam Studio Cockpit Ergonomics, React Portal Mount Lifecycle, Fixed Overlay Guard).

## Architecture

ExamPreparer adalah aplikasi latihan ujian dan evaluasi psikotes/akademik modern berbasis Next.js 16 (App Router dengan Turbopack), React 19, Tailwind CSS v4, Dexie.js (IndexedDB offline sync), KaTeX, dan Recharts.

Arsitektur optimasi web modern ini mencakup 4 pilar subsistem:
1. **Rendering Fortress & Mathematical Stability (R1)**:
   - Synchronous math rendering via `katex.renderToString` dalam `useMemo` dengan `dangerouslySetInnerHTML`, mengeliminasi dual-pass empty span rendering dan Cumulative Layout Shift (CLS).
   - Strict DOM containment (`[contain:layout_style_paint]`) pada `QuestionRenderer` (Card & borderless).
   - Form ergonomics pada Essay textarea & Scratchpad (`field-sizing: content`, `spellCheck={false}`, `autoComplete="off"`, `autoCorrect="off"`, `autoCapitalize="off"`).
   - Stimulus memoization untuk menghentikan re-parsing markdown setiap detik saat timer berdetik.
2. **Dual-Surface Virtualization & Layout Containment (R2)**:
   - CSS `content-visibility: auto` dan `contain-intrinsic-size: auto 320px` pada seluruh kartu soal mode `all` di `ExamRunner.tsx` dan `src/app/exam/[id]/review/page.tsx` (Review Studio), mempertahankan anchor navigation (`#review-q-X`) sambil meniadakan beban layout/paint untuk 50 soal di luar viewport.
   - Eliminasi animasi slide berulang pada item virtual saat scrolling untuk menjamin 60 FPS scrolling mulus.
3. **View Transitions & Vestibular Motion Shield (R3 & R4)**:
   - Progressive View Transitions (`runSafeViewTransition` di `src/lib/viewTransitions.ts`) membungkus pergantian mode paginasi (`1` <-> `5` <-> `all`) dengan React `flushSync` dan fallback aman untuk browser lama.
   - Scoped transition pada question canvas viewport (`.exam-viewport-transition` / `exam-canvas`), menjaga Command Bar 56px dan bottom navigation bar tetap kokoh.
   - Sinkronisasi indeks dua arah (`handleQuestionActive`) dan focus management aksesibilitas (WCAG 2.4.3) pasca-transisi ke `id="question-card-${id}"`.
   - Vestibular Accessibility Shield di `src/app/globals.css`: `@media (prefers-reduced-motion: reduce)` menetralkan View Transitions, animasi `keycapPop` (scale 1.18x bounce), pulse, dan slide transitions, sambil mempercepat animasi universal ke `0.001ms !important` agar event Radix UI tetap berjalan.
   - Typography metrics smoothing via `font-size-adjust: from-font` pada body dan isolasi `font-size-adjust: none !important` pada elemen KaTeX.
4. **Dynamic Bundle Splitting & Zero-Regression Matrix (R5 & R6)**:
   - Dynamic import (`next/dynamic` dengan `{ ssr: false }`) untuk `ChartRenderer` di `ContentBlockRenderer.tsx`, memangkas Recharts (~500 KB) dari initial critical chunk pada ujian murni teks/matematika.
   - Ekstraksi `StudentTrendChart.tsx` dengan dynamic import pada portfolio siswa (`/student/[id]`).
   - Lazy-loading `AdminDashboard` pada `/adminDoor`.
   - Verifikasi ketat 100% pass pada 28 unit test Vitest dan zero-error Next.js production build.

```mermaid
graph TD
    subgraph UI_Fortress [Sektor 1 & 2: Rendering Fortress & Virtualization]
        QR[QuestionRenderer.tsx] -->|contain: layout style paint| DOM_ISOLATION[DOM Subtree Containment]
        MR[MathRenderer.tsx] -->|katex.renderToString sinkron| NO_CLS[Zero-CLS KaTeX Math]
        ES[Essay & Scratchpad] -->|field-sizing: content + spellcheck: false| FORM_ERGO[Anti-Distraction Ergonomics]
        VIRT[Review Studio & ExamRunner] -->|content-visibility: auto + contain-intrinsic-size: auto 320px| FPS60[60 FPS 50-Question Virtualization]
    end

    subgraph Motion_A11y [Sektor 3: View Transitions & A11y Guard]
        VT[runSafeViewTransition] -->|document.startViewTransition + flushSync| SMOOTH_PAGE[Seamless 1-5-All Paging]
        FS[Focus & Index Sync] -->|focus question-card-id| WCAG[WCAG 2.4.3 Compliant Navigation]
        PRM[@media prefers-reduced-motion] -->|Neutralize keycapPop & pulse| VESTIBULAR[Vestibular Motion Safety]
        FSA[font-size-adjust: from-font] -->|Normalize fallback font x-height| CLS_SHIELD[CLS Elimination Shield]
    end

    subgraph Bundle_Matrix [Sektor 4: Bundle Optimization & Test Matrix]
        DYN[next/dynamic ssr:false] -->|Isolate Recharts ~500KB| BUNDLE_SLIM[Slim Initial JS Chunks]
        VTEST[Vitest 28/28 Unit Tests] -->|Pass Invariants| ZERO_REGRESS[Zero Regression Guarantee]
        NBUILD[Next.js Turbopack Build] -->|Exit Code 0| PROD_READY[Production Ready]
    end
```

---

## Feature Inventory

Setiap fitur yang teridentifikasi dari survei tercatat secara lengkap dengan penugasan milestone:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F01 | Synchronous KaTeX Render | Migrasi `MathRenderer.tsx` ke `katex.renderToString` sinkron dalam `useMemo` | M1 | Survey 1 (R1) |
| F02 | Card DOM Containment | Tambahkan `[contain:layout_style_paint]` pada Card dan wrapper `QuestionRenderer.tsx` | M1 | Survey 1 (R1) |
| F03 | Essay Input Ergonomics | Tambahkan `[field-sizing:content]`, `spellCheck={false}`, `autoComplete="off"` pada Textarea essay | M1 | Survey 1 (R1) |
| F04 | Scratchpad Ergonomics | Tambahkan `spellCheck={false}`, `autoComplete="off"` pada floating scratchpad di `ExamRunner.tsx` | M1 | Survey 1 (R1) |
| F05 | Stimulus Parsing Memoization | Gunakan `useMemo` untuk `parseMarkdown` stimulus agar tidak re-parse saat detik countdown timer berjalan | M1 | Survey 1 (R1) |
| F06 | Dual-Surface Virtualization | Tambahkan `[content-visibility:auto] [contain-intrinsic-size:auto_320px]` pada kartu Review Studio dan ExamRunner | M1 | Survey 1 (R2) |
| F07 | Virtual Scroll Animation Stutter Fix | Hapus animasi slide berulang pada item virtual `ExamRunner.tsx` saat scrolling | M1 | Survey 1 (R2) |
| F08 | View Transitions Utility | Implementasikan `runSafeViewTransition` di `src/lib/viewTransitions.ts` dengan `flushSync` dan fallback aman | M2 | Survey 2 (R3) |
| F09 | Scoped View Transition Canvas | Terapkan `.exam-viewport-transition` dan `view-transition-name: exam-canvas` pada kanvas soal di `ExamRunner.tsx` & `review/page.tsx` | M2 | Survey 2 (R3) |
| F10 | Active Question Index Sync | Sinkronisasi dua arah `currentSingleIdx` dan `currentBatchPage` saat menjawab/mengklik soal di mode 5 atau all | M2 | Survey 2 (R3) |
| F11 | Accessibility Focus Management | Route focus ke `id="question-card-${qId}"` setelah transisi paginasi selesai (WCAG 2.4.3) | M2 | Survey 2 (R3) |
| F12 | Vestibular Motion Shield | Tambahkan `@media (prefers-reduced-motion: reduce)` di `globals.css` menetralkan View Transitions, keycap pop, pulse, dan slide | M2 | Survey 2 (R4) |
| F13 | Typography Metrics Smoothing | Terapkan `font-size-adjust: from-font` pada body di `globals.css` untuk mencegah CLS saat font fallback swap | M2 | Survey 2 (R4) |
| F14 | KaTeX Font Isolation | Tambahkan `.katex, .katex-display { font-size-adjust: none !important; }` di `globals.css` | M2 | Survey 2 (R4) |
| F15 | Dynamic ChartRenderer in ContentBlock | Gunakan `next/dynamic` dengan `{ ssr: false }` untuk `ChartRenderer` di `ContentBlockRenderer.tsx` | M3 | Survey 3 (R5) |
| F16 | Student Trend Chart Extraction | Ekstrak `StudentTrendChart.tsx` dan gunakan `next/dynamic` di `src/app/student/[id]/page.tsx` | M3 | Survey 3 (R5) |
| F17 | Admin Dashboard Lazy Load | Gunakan `next/dynamic` untuk `AdminDashboard` di `src/app/adminDoor/page.tsx` | M3 | Survey 3 (R5) |
| F18 | E2E & Vitest Regression Suite | Verifikasi 100% lulus 28 unit test Vitest dan buat test suite verifikasi fitur baru | M4 | Survey 3 (R6) |
| F19 | Production Build & Lint Verification | Verifikasi clean Turbopack build (`npm run build`) dengan exit code 0 | M4 | Survey 3 (R6) |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Rendering Fortress & Dual-Surface Virtualization | F01, F02, F03, F04, F05, F06, F07 (R1 & R2) | none | DONE (Gate PASS: 55/55 Vitest, tsc clean, Turbopack clean, Auditor CLEAN) |
| M2 | View Transitions & Modern CSS / A11y Vestibular Guard | F08, F09, F10, F11, F12, F13, F14 (R3 & R4) | M1 | DONE (Gate PASS: 102/102 Vitest, tsc clean, Turbopack clean, Auditor CLEAN) |
| M3 | Dynamic Bundle Splitting & Asset Optimization | F15, F16, F17 (R5) | M1 | DONE (Gate PASS: 124/124 tests, tsc clean, Turbopack clean, Auditor CLEAN) |
| M4 | Automated Testing & Zero-Regression Matrix | F18, F19 (R6 - All 124 Vitest tests, TEST_READY.md published, Turbopack build clean, victory audit) | M1, M2, M3 | DONE (Gate PASS: 124/124 tests pass, TEST_READY.md published, Master Auditor CLEAN) |

---

## Interface Contracts

### `src/components/exam/MathRenderer.tsx`
```typescript
interface MathRendererProps {
  tex: string;
  displayMode?: boolean;
}
// Render synchronously via katex.renderToString inside useMemo.
// Returns <span> with dangerouslySetInnerHTML={{ __html: html }}
// Contains [contain:layout_paint] for displayMode and [contain:layout_style] for inline.
```

### `src/components/exam/QuestionRenderer.tsx`
```typescript
interface QuestionRendererProps {
  question: Question;
  answer?: string;
  onAnswer?: (questionId: string | number, answer: string) => void;
  disabled?: boolean;
  borderless?: boolean;
  textSize?: 'sm' | 'base' | 'lg' | 'xl';
  showDiscussion?: boolean;
  showCorrectAnswer?: boolean;
  feedbackMode?: 'immediate' | 'post-exam' | 'none';
  onFlag?: (questionId: string | number) => void;
  flagged?: boolean;
  printMode?: boolean;
}
// Outer Card & borderless container MUST have: [contain:layout_style_paint]
// Outer element MUST have: id={`question-card-${question.id}`} tabIndex={-1}
// Textarea for ESSAY MUST have: spellCheck={false}, autoComplete="off", autoCorrect="off", autoCapitalize="off", [field-sizing:content]
```

### `src/lib/viewTransitions.ts`
```typescript
export function runSafeViewTransition(
  updateFn: () => void,
  onFinished?: () => void
): void;
// Uses document.startViewTransition + flushSync(updateFn) when available.
// Calls onFinished after transition.finished.finally.
// Fallback calls updateFn() immediately, followed by onFinished().
```

### `src/components/student/StudentTrendChart.tsx`
```typescript
interface StudentTrendChartProps {
  chartData: Array<{ attempt: string; score: number; label: string }>;
}
// Client component with Recharts LineChart, ResponsiveContainer width="100%" height="100%"
```

---

## Code Layout

- `src/components/exam/QuestionRenderer.tsx` — Universal question card renderer (R1, R3).
- `src/components/exam/ContentBlockRenderer.tsx` — Parser & renderer for question content blocks (R1, R5).
- `src/components/exam/MathRenderer.tsx` — KaTeX formula renderer (R1, R4).
- `src/components/exam/ExamRunner.tsx` — Test execution cockpit (R1, R2, R3).
- `src/components/exam/StimulusRenderer.tsx` — Stimulus passage renderer (R1).
- `src/app/exam/[id]/review/page.tsx` — 50-Question Review Studio (R2, R3).
- `src/lib/viewTransitions.ts` — View transitions utility helper with `flushSync` (R3).
- `src/app/globals.css` — Global stylesheets, `@media (prefers-reduced-motion: reduce)`, `font-size-adjust`, KaTeX shield (R4).
- `src/app/layout.tsx` — Root layout font configuration (R4).
- `src/components/student/StudentTrendChart.tsx` — Extracted student trend chart for dynamic import (R5).
- `src/app/student/[id]/page.tsx` — Student portfolio with dynamic chart (R5).
- `src/app/adminDoor/page.tsx` — Admin entrance with dynamic dashboard import (R5).
- `tests/` — Vitest unit test suites (R6).
