# Execution Plan — Modern Web Optimization Fortress

## Goal
Implement modern web optimizations across 6 core requirements:
- R1: Question & Content Rendering Fortress (QuestionRenderer.tsx, ContentBlockRenderer.tsx, field-sizing: content, contain: layout style paint, KaTeX stability)
- R2: Dual-Surface Virtualization & Layout Containment (content-visibility: auto, contain-intrinsic-size: auto 320px in ExamRunner.tsx & review/page.tsx)
- R3: View Transitions & Paging Ergonomics (document.startViewTransition with fallback, focus sync)
- R4: Modern CSS & A11y Vestibular Guard (prefers-reduced-motion in globals.css/layout.tsx, font-size-adjust)
- R5: Dynamic Bundle Splitting & Asset Optimization (next/dynamic for heavy chart/analytics libs)
- R6: Automated Testing & Zero-Regression Matrix (100% Vitest pass, clean Next.js build)

## Phase Breakdown
1. **Phase 0: Survey & Specification Mapping**
   - 3 parallel Explorers:
     - Explorer 1: R1 & R2 (QuestionRenderer, ContentBlockRenderer, ExamRunner, review/page.tsx, rendering & containment).
     - Explorer 2: R3 & R4 (Pagination logic in ExamRunner, view transitions, globals.css, typography, reduced motion).
     - Explorer 3: R5 & R6 (Next.js config, bundle composition, recharts usage in admin/student dashboards, Vitest suites & build setup).
   - Merge reports into root `PROJECT.md`.
2. **Phase 1: Implementation of Core Rendering & Virtualization (R1, R2)**
   - Explorer -> Worker -> Reviewers (2) -> Challengers (2) -> Auditor -> Gate
3. **Phase 2: Implementation of View Transitions, Modern CSS & A11y (R3, R4)**
   - Explorer -> Worker -> Reviewers (2) -> Challengers (2) -> Auditor -> Gate
4. **Phase 3: Implementation of Dynamic Bundle Splitting (R5)**
   - Explorer -> Worker -> Reviewers (2) -> Challengers (2) -> Auditor -> Gate
5. **Phase 4: Full E2E & Vitest Testing, Build Verification & Victory Reporting (R6)**
   - Test writers & verification workers verify all Vitest tests pass and Next.js build passes.
   - Comprehensive Victory Report to parent sentinel.
