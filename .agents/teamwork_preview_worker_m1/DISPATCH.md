## 2026-09-16T11:34:02Z

You are teamwork_preview_worker_m1.
Your working directory is: C:\laragon\www\_MyCV\ExamPreparer\.agents\teamwork_preview_worker_m1
Project root: C:\laragon\www\_MyCV\ExamPreparer

MANDATORY FIRST STEP:
Read C:\laragon\www\_MyCV\ExamPreparer\.agents\ORIGINAL_REQUEST.md, C:\laragon\www\_MyCV\ExamPreparer\AGENTS.md, and C:\laragon\www\_MyCV\ExamPreparer\PROJECT.md.
Also read the detailed Explorer 1 report with concrete code proposals at:
C:\laragon\www\_MyCV\ExamPreparer\.agents\teamwork_preview_explorer_survey_1\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP (You own and may edit ONLY these files):
- src/components/exam/MathRenderer.tsx
- src/components/exam/QuestionRenderer.tsx
- src/components/exam/StimulusRenderer.tsx
- src/components/exam/ExamRunner.tsx
- src/app/exam/[id]/review/page.tsx

YOUR MISSION: Implement Milestone 1 (Features F01 through F07):
1. F01: Migrate MathRenderer.tsx to synchronous katex.renderToString inside useMemo with dangerouslySetInnerHTML and containment classes ([contain:layout_paint] for displayMode, [contain:layout_style] for inline) to eliminate dual-pass empty span rendering and CLS.
2. F02: Add DOM containment [contain:layout_style_paint] to QuestionRenderer.tsx (both Card and borderless containers). Add id={`question-card-${question.id}`} and tabIndex={-1}.
3. F03: Add [field-sizing:content], spellCheck={false}, autoComplete="off", autoCorrect="off", autoCapitalize="off" to essay textarea in QuestionRenderer.tsx.
4. F04: Add spellCheck={false}, autoComplete="off", autoCorrect="off", autoCapitalize="off" to floating scratchpad textarea in ExamRunner.tsx.
5. F05: Memoize markdown stimulus parsing (useMemo) in StimulusRenderer.tsx, ExamRunner.tsx, and review/page.tsx to stop re-parsing markdown on every countdown timer tick.
6. F06: Apply [content-visibility:auto] [contain-intrinsic-size:auto_320px] to question cards outside initial viewport in review/page.tsx (mode "all") and ExamRunner.tsx virtual items container.
7. F07: Remove the repeating slide animation from virtual items during scroll in ExamRunner.tsx to maintain smooth 60fps scrolling.

VERIFICATION REQUIRED:
- Run Vitest tests: npm run test
- Run TypeScript check: npx tsc --noEmit
- Document the commands and exact output in your handoff report.
- Write handoff report to C:\laragon\www\_MyCV\ExamPreparer\.agents\teamwork_preview_worker_m1\handoff.md and send completion message via send_message to parent.
