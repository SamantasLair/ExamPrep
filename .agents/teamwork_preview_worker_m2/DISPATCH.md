## 2026-09-16T11:57:32Z

You are teamwork_preview_worker_m2.
Your working directory is: C:\laragon\www\_MyCV\ExamPreparer\.agents\teamwork_preview_worker_m2
Project root: C:\laragon\www\_MyCV\ExamPreparer

MANDATORY FIRST STEP:
Read C:\laragon\www\_MyCV\ExamPreparer\.agents\ORIGINAL_REQUEST.md, C:\laragon\www\_MyCV\ExamPreparer\AGENTS.md, and C:\laragon\www\_MyCV\ExamPreparer\PROJECT.md.
Also read the detailed Explorer 2 report with concrete code proposals at:
C:\laragon\www\_MyCV\ExamPreparer\.agents\teamwork_preview_explorer_survey_2\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP (You own and may edit ONLY these files):
- src/lib/viewTransitions.ts
- src/components/exam/ExamRunner.tsx
- src/app/exam/[id]/review/page.tsx
- src/app/globals.css
- src/app/layout.tsx

YOUR MISSION: Implement Milestone 2 (Features F08 through F14):
1. F08: Create src/lib/viewTransitions.ts implementing runSafeViewTransition(updateFn, onFinished) using document.startViewTransition + flushSync from 'react-dom', with a resilient fallback if startViewTransition is unsupported or throws.
2. F09: In src/app/globals.css, define .exam-viewport-transition { view-transition-name: exam-canvas; } and view-transition animation timings. Apply .exam-viewport-transition to the scrollable question canvas in ExamRunner.tsx and review/page.tsx so the top 56px Command Bar and bottom navigation bar remain rock-solid.
3. F10: Refactor handleModeChange in ExamRunner.tsx and review/page.tsx to use runSafeViewTransition. Add bidirectional active question index synchronization (sync currentSingleIdx and currentBatchPage when answering questions, toggling flags, or clicking cards in mode 5/all) so switching back to mode 1 remains on the actively viewed question.
4. F11: In runSafeViewTransition post-transition callback (transition.finished.finally), route programmatic focus to id={`question-card-${activeId}`} with tabIndex={-1} for WCAG 2.4.3 compliance.
5. F12: In src/app/globals.css, implement @media (prefers-reduced-motion: reduce) to neutralize view transitions (::view-transition-* animation: none !important), neutralize .animate-keycap-pop (transform: none !important), .animate-slide-*, .animate-fade-in, .animate-autosave-pulse, and .animate-pulse, while accelerating universal transitions to 0.001ms !important to preserve Radix UI lifecycle events.
6. F13: In src/app/globals.css, add font-size-adjust: from-font on body and monospace elements to curb Cumulative Layout Shift (CLS) during fallback font swaps.
7. F14: In src/app/globals.css, isolate KaTeX formulas with .katex, .katex-display, .katex-html { font-size-adjust: none !important; }. In src/app/layout.tsx, ensure display: 'swap' is set on Inter font.

VERIFICATION REQUIRED:
- Run Vitest tests: npm run test
- Run TypeScript check: npx tsc --noEmit
- Document the commands and exact output in your handoff report.
- Write handoff report to C:\laragon\www\_MyCV\ExamPreparer\.agents\teamwork_preview_worker_m2\handoff.md and send completion message via send_message to parent.
