## 2026-09-16T11:25:08Z
You are the Project Orchestrator (teamwork_preview_orchestrator) for the project ExamPreparer.

Your Working Directory: C:\laragon\www\_MyCV\ExamPreparer\.agents\teamwork_preview_orchestrator_1
Project Root: C:\laragon\www\_MyCV\ExamPreparer
Authoritative Request: C:\laragon\www\_MyCV\ExamPreparer\.agents\ORIGINAL_REQUEST.md

The user has requested a full-scale multi-agent team ("Tim Penuh Skala Besar (Granular Module Breakdown)") to implement modern web optimizations across 6 core requirements:

1. R1. Question & Content Rendering Fortress:
   - Harden parsing & rendering in QuestionRenderer.tsx and ContentBlockRenderer.tsx.
   - Stable DOM isolation (contain: layout style paint on question item container).
   - Essay short-answer & scratchpad equipped with field-sizing: content, spellcheck="false", autoComplete="off".
   - KaTeX display/inline and Markdown text stability without layout reflows or clipping.

2. R2. Dual-Surface Virtualization & Layout Containment:
   - Eliminate DOM footprint bottleneck on 50-question mode ("all") in ExamRunner.tsx and app/exam/[id]/review/page.tsx.
   - CSS content-visibility: auto paired with contain-intrinsic-size: auto 320px on question cards outside initial viewport.
   - Parity in Review Studio for smooth 60fps scrolling across 50 questions with explanations.

3. R3. View Transitions & Paging Ergonomics:
   - Smooth transitions between pagination modes (1 Question <-> 5 Questions <-> All Questions) without FOUC or layout snap.
   - Wrap pagination mode changes in document.startViewTransition() with safe fallback to direct state update.
   - Synchronize active question number and accessibility focus management post-transition.

4. R4. Modern CSS & A11y Vestibular Guard:
   - Reduced Motion accessibility: @media (prefers-reduced-motion: reduce) disabling/accelerating micro-animations (keycapPop, pulse, slide transitions) in globals.css / layout.tsx.
   - Typography metrics fallback smoothing using font-size-adjust to curb CLS.

5. R5. Dynamic Bundle Splitting & Asset Optimization:
   - Dynamic import (next/dynamic with safe SSR options) for heavy analytics/visual libs (e.g. recharts in admin/student dashboards and external graphics modules) to trim initial JS bundle.

6. R6. Automated Testing & Zero-Regression Matrix:
   - Maintain 100% pass on all existing Vitest unit tests (`npm run test`).
   - Clean production build (`npm run build`) with zero TypeScript errors or lint failures.

STRICT CONSTRAINTS & WORKSPACE RULES:
- Read and adhere to AGENTS.md in project root (React Portal mount rules, zero-freeze failsafe timers, unified 56px command bar, 2-column cockpit ergonomics, tactile keycaps).
- No unauthorized git commit or git push commands.
- Decompose the work, dispatch tasks to specialist subagents, actively track lifecycle and progress in `.agents/teamwork_preview_orchestrator_1/progress.md` and `plan.md`.
- Keep `progress.md` updated at all times for sentinel monitoring.
- When all tasks are completed and verified via tests and build, report your victory/completion back to the sentinel with complete evidence so that the mandatory independent Victory Audit can proceed.
