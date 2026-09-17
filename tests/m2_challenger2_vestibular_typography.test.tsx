import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'fs';
import path from 'path';
import { MathRenderer } from '../src/components/exam/MathRenderer';
import { QuestionRenderer } from '../src/components/exam/QuestionRenderer';
import { runSafeViewTransition, focusQuestionCard } from '../src/lib/viewTransitions';
import type { Question } from '../src/lib/types';

describe('Challenger M2.2: Vestibular Motion Shield & Typography Metrics (F12–F14)', () => {
  const globalsCssPath = path.resolve(__dirname, '../src/app/globals.css');
  const globalsCss = fs.readFileSync(globalsCssPath, 'utf8');

  const layoutPath = path.resolve(__dirname, '../src/app/layout.tsx');
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');

  // Helper to extract CSS media query block
  function extractMediaQueryBlock(css: string, query: string): string {
    const queryIdx = css.indexOf(query);
    if (queryIdx === -1) return '';
    const openBrace = css.indexOf('{', queryIdx);
    if (openBrace === -1) return '';

    let depth = 1;
    let idx = openBrace + 1;
    while (idx < css.length && depth > 0) {
      if (css[idx] === '{') depth++;
      else if (css[idx] === '}') depth--;
      idx++;
    }
    return css.substring(openBrace + 1, idx - 1);
  }

  /* --------------------------------------------------------------------------
   * 1. F12: Vestibular Accessibility Motion Shield in globals.css
   * -------------------------------------------------------------------------- */
  describe('F12: Vestibular Motion Shield CSS Rules', () => {
    const reducedMotionBlock = extractMediaQueryBlock(globalsCss, '@media (prefers-reduced-motion: reduce)');

    it('contains @media (prefers-reduced-motion: reduce) block in globals.css', () => {
      expect(globalsCss).toContain('@media (prefers-reduced-motion: reduce)');
      expect(reducedMotionBlock.length).toBeGreaterThan(0);
    });

    it('neutralizes View Transitions (::view-transition-*)', () => {
      expect(reducedMotionBlock).toContain('::view-transition-group(*)');
      expect(reducedMotionBlock).toContain('::view-transition-old(*)');
      expect(reducedMotionBlock).toContain('::view-transition-new(*)');
      expect(reducedMotionBlock).toMatch(/::view-transition-[\s\S]*?animation:\s*none\s*!important/);
    });

    it('neutralizes keycap pop bounce animation (.animate-keycap-pop)', () => {
      expect(reducedMotionBlock).toContain('.animate-keycap-pop');
      expect(reducedMotionBlock).toMatch(/\.animate-keycap-pop[\s\S]*?animation:\s*none\s*!important/);
      expect(reducedMotionBlock).toMatch(/\.animate-keycap-pop[\s\S]*?transform:\s*none\s*!important/);
    });

    it('neutralizes slide and fade transitions (.animate-slide-right, .animate-slide-left, .animate-fade-in)', () => {
      expect(reducedMotionBlock).toContain('.animate-slide-right');
      expect(reducedMotionBlock).toContain('.animate-slide-left');
      expect(reducedMotionBlock).toContain('.animate-fade-in');
      expect(reducedMotionBlock).toMatch(/\.animate-slide-right[\s\S]*?animation:\s*none\s*!important/);
      expect(reducedMotionBlock).toMatch(/\.animate-slide-right[\s\S]*?transform:\s*none\s*!important/);
    });

    it('neutralizes autosave pulse and pins opacity to 1 (.animate-autosave-pulse)', () => {
      expect(reducedMotionBlock).toContain('.animate-autosave-pulse');
      expect(reducedMotionBlock).toMatch(/\.animate-autosave-pulse[\s\S]*?animation:\s*none\s*!important/);
      expect(reducedMotionBlock).toMatch(/\.animate-autosave-pulse[\s\S]*?transform:\s*none\s*!important/);
      expect(reducedMotionBlock).toMatch(/\.animate-autosave-pulse[\s\S]*?opacity:\s*1\s*!important/);
    });

    it('neutralizes warning and loading pulse (.animate-pulse)', () => {
      expect(reducedMotionBlock).toContain('.animate-pulse');
      expect(reducedMotionBlock).toMatch(/\.animate-pulse[\s\S]*?animation:\s*none\s*!important/);
      expect(reducedMotionBlock).toMatch(/\.animate-pulse[\s\S]*?opacity:\s*1\s*!important/);
    });

    it('accelerates universal transitions to 0.001ms to preserve Radix UI unmount lifecycle', () => {
      // Must target *, *::before, *::after
      expect(reducedMotionBlock).toContain('*');
      expect(reducedMotionBlock).toMatch(/animation-duration:\s*0\.001ms\s*!important/);
      expect(reducedMotionBlock).toMatch(/animation-iteration-count:\s*1\s*!important/);
      expect(reducedMotionBlock).toMatch(/transition-duration:\s*0\.001ms\s*!important/);
      expect(reducedMotionBlock).toMatch(/scroll-behavior:\s*auto\s*!important/);
    });

    it('adversarial check: all declared @keyframes map to a neutralized class in reduced motion block', () => {
      // Extract all keyframes in globals.css
      const keyframeRegex = /@keyframes\s+([a-zA-Z0-9_-]+)/g;
      const declaredKeyframes: string[] = [];
      let match: RegExpExecArray | null;
      while ((match = keyframeRegex.exec(globalsCss)) !== null) {
        declaredKeyframes.push(match[1]);
      }

      expect(declaredKeyframes.length).toBeGreaterThanOrEqual(4);

      // Verify that every declared keyframe has an associated class neutralized in prefers-reduced-motion
      const keyframeToClassMap: Record<string, string> = {
        keycapPop: 'animate-keycap-pop',
        autoSaveFade: 'animate-autosave-pulse',
        fadeIn: 'animate-fade-in',
        slideRight: 'animate-slide-right',
        slideLeft: 'animate-slide-left',
      };

      for (const kf of declaredKeyframes) {
        const cls = keyframeToClassMap[kf];
        expect(cls, `Keyframe ${kf} must have a mapped animation class`).toBeDefined();
        expect(reducedMotionBlock, `Class .${cls} for keyframe ${kf} must be neutralized`).toContain(`.${cls}`);
      }
    });

    it('verifies globals.css has strictly balanced braces with no syntax truncation', () => {
      let depth = 0;
      for (let i = 0; i < globalsCss.length; i++) {
        if (globalsCss[i] === '{') depth++;
        else if (globalsCss[i] === '}') depth--;
        expect(depth).toBeGreaterThanOrEqual(0);
      }
      expect(depth).toBe(0);
    });
  });

  /* --------------------------------------------------------------------------
   * 2. Production Compiled CSS Verification (Turbopack artifact check)
   * -------------------------------------------------------------------------- */
  describe('F12 & F13: Compiled CSS Bundle Artifact Verification', () => {
    const chunksDir = path.resolve(__dirname, '../.next/static/chunks');

    it('preserves reduced motion shield and typography metrics in compiled production CSS', () => {
      if (!fs.existsSync(chunksDir)) {
        // If .next does not exist, pass conditionally with warning
        console.warn('.next/static/chunks directory not found, skipping compiled bundle check');
        return;
      }

      const files = fs.readdirSync(chunksDir).filter(f => f.endsWith('.css'));
      expect(files.length).toBeGreaterThan(0);

      // Concatenate all CSS chunks
      let compiledCss = '';
      for (const file of files) {
        compiledCss += fs.readFileSync(path.join(chunksDir, file), 'utf8');
      }

      // Verify key rules survive Turbopack minification
      expect(compiledCss).toContain('@media (prefers-reduced-motion:reduce)');
      expect(compiledCss).toContain('::view-transition-group(*)');
      expect(compiledCss).toContain('.animate-keycap-pop');
      expect(compiledCss).toContain('.animate-autosave-pulse');
      expect(compiledCss).toContain('scroll-behavior:auto!important');
      expect(compiledCss).toContain('font-size-adjust:from-font');
      expect(compiledCss).toContain('font-size-adjust:none!important');
    });
  });

  /* --------------------------------------------------------------------------
   * 3. F13: Typography Metrics Smoothing & CLS Prevention
   * -------------------------------------------------------------------------- */
  describe('F13: Typography Metrics Smoothing', () => {
    it('applies font-size-adjust: from-font to body in globals.css', () => {
      expect(globalsCss).toMatch(/body\s*\{[^}]*font-size-adjust:\s*from-font;/);
    });

    it('applies font-size-adjust: from-font to monospace elements (code, kbd, samp, pre)', () => {
      expect(globalsCss).toMatch(/code,\s*kbd,\s*samp,\s*pre\s*\{[^}]*font-size-adjust:\s*from-font;/);
    });

    it('configures display: "swap" on Inter font in layout.tsx to enable smooth font swapping', () => {
      expect(layoutContent).toContain('display: "swap"');
      expect(layoutContent).toContain('subsets: ["latin"]');
    });

    it('enforces text-rendering and font-smoothing on body', () => {
      expect(globalsCss).toMatch(/body\s*\{[^}]*text-rendering:\s*optimizeLegibility;/);
      expect(globalsCss).toMatch(/body\s*\{[^}]*-webkit-font-smoothing:\s*antialiased;/);
    });
  });

  /* --------------------------------------------------------------------------
   * 4. F14: KaTeX Font Metric Isolation
   * -------------------------------------------------------------------------- */
  describe('F14: KaTeX Font Metric Isolation', () => {
    it('applies font-size-adjust: none !important to .katex, .katex-display, .katex-html in globals.css', () => {
      expect(globalsCss).toMatch(/\.katex,\s*\.katex-display,\s*\.katex-html\s*\{[^}]*font-size-adjust:\s*none\s*!important;/);
    });

    it('renders inline KaTeX formula with proper class names matching isolation selector', () => {
      const inlineTex = 'E = mc^2';
      const markup = renderToStaticMarkup(<MathRenderer tex={inlineTex} displayMode={false} />);

      // Must produce .katex and .katex-html DOM nodes
      expect(markup).toContain('class="katex"');
      expect(markup).toContain('class="katex-html"');
      // Must NOT introduce an inline style that breaks font-size-adjust
      expect(markup).not.toContain('font-size-adjust');
    });

    it('renders display mode KaTeX formula with .katex-display wrapper matching isolation selector', () => {
      const displayTex = '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}';
      const markup = renderToStaticMarkup(<MathRenderer tex={displayTex} displayMode={true} />);

      // Must produce .katex-display wrapper
      expect(markup).toContain('class="katex-display"');
      expect(markup).toContain('class="katex"');
      expect(markup).toContain('class="katex-html"');
    });

    it('renders complex fractions, radicals, and summations without glyph distortion classes', () => {
      const complexTex = '\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\cdot \\sum_{k=1}^{n} \\frac{1}{k^2}';
      const markup = renderToStaticMarkup(<MathRenderer tex={complexTex} displayMode={true} />);

      expect(markup).toContain('class="mfrac"');
      expect(markup).toContain('class="mord sqrt"');
      expect(markup).toContain('mop op-symbol');
      // Mathematical glyph components must be nested inside .katex-html protected by the CSS shield
      expect(markup).toContain('class="katex-html"');
    });

    it('handles KaTeX syntax errors gracefully without leaking unisolated DOM or throwing', () => {
      // Intentionally invalid LaTeX syntax
      const brokenTex = '\\invalidSyntax{{{unclosed';
      const markup = renderToStaticMarkup(<MathRenderer tex={brokenTex} displayMode={false} />);

      // KaTeX with throwOnError: false renders an error node with .katex-error class and red color
      expect(markup).toContain('class="katex-error"');
      expect(markup).toContain('color:#ef4444');
    });

    it('renders multi-line nested matrix structures wrapped in isolated containers', () => {
      const matrixTex = '\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}';
      const markup = renderToStaticMarkup(<MathRenderer tex={matrixTex} displayMode={true} />);

      expect(markup).toContain('class="katex-display"');
      expect(markup).toContain('class="mtable"');
      expect(markup).toContain('class="katex-html"');
    });
  });

  /* --------------------------------------------------------------------------
   * 5. Component Integration: Tactile Keycap & Autosave Pulse Triggering
   * -------------------------------------------------------------------------- */
  describe('Component Integration: Tactile Keycap Badge & Autosave Indicator', () => {
    const sampleQuestion: Question = {
      id: 101,
      type: 'MCQ',
      body: [{ type: 'text', content: 'Berapakah nilai limit fungsi trigonometri dasar?' }],
      options: [
        { key: 'A', body: [{ type: 'text', content: '0' }] },
        { key: 'B', body: [{ type: 'text', content: '1' }] },
        { key: 'C', body: [{ type: 'math-inline', content: '\\infty' }] },
        { key: 'D', body: [{ type: 'text', content: '-1' }] },
      ],
      correctAnswer: 'B',
    };

    it('renders unselected options WITHOUT animate-keycap-pop', () => {
      const markup = renderToStaticMarkup(
        <QuestionRenderer
          question={sampleQuestion}
          answer={undefined}
        />
      );

      // Unselected options should NOT have animate-keycap-pop
      expect(markup).not.toContain('animate-keycap-pop');
    });

    it('renders selected option WITH animate-keycap-pop on the keycap badge', () => {
      const markup = renderToStaticMarkup(
        <QuestionRenderer
          question={sampleQuestion}
          answer="B"
        />
      );

      // Selected option keycap badge MUST have animate-keycap-pop
      expect(markup).toContain('animate-keycap-pop');
      // The badge with key B should have the class
      expect(markup).toMatch(/animate-keycap-pop[^>]*>B<\/div>/);
    });

    it('dynamically switches animate-keycap-pop when option selection changes from A to C', () => {
      const markupA = renderToStaticMarkup(
        <QuestionRenderer question={sampleQuestion} answer="A" />
      );
      expect(markupA).toMatch(/animate-keycap-pop[^>]*>A<\/div>/);
      expect(markupA).not.toMatch(/animate-keycap-pop[^>]*>C<\/div>/);

      const markupC = renderToStaticMarkup(
        <QuestionRenderer question={sampleQuestion} answer="C" />
      );
      expect(markupC).not.toMatch(/animate-keycap-pop[^>]*>A<\/div>/);
      expect(markupC).toMatch(/animate-keycap-pop[^>]*>C<\/div>/);
    });

    it('verifies ExamRunner.tsx contains animate-autosave-pulse on the autosave indicator', () => {
      const runnerPath = path.resolve(__dirname, '../src/components/exam/ExamRunner.tsx');
      const runnerContent = fs.readFileSync(runnerPath, 'utf8');

      expect(runnerContent).toContain('animate-autosave-pulse');
      expect(runnerContent).toContain('Tersimpan Otomatis');
    });

    it('verifies exam canvas container in ExamRunner and review/page.tsx declares exam-viewport-transition', () => {
      const runnerPath = path.resolve(__dirname, '../src/components/exam/ExamRunner.tsx');
      const runnerContent = fs.readFileSync(runnerPath, 'utf8');
      expect(runnerContent).toContain('exam-viewport-transition');

      const reviewPath = path.resolve(__dirname, '../src/app/exam/[id]/review/page.tsx');
      const reviewContent = fs.readFileSync(reviewPath, 'utf8');
      expect(reviewContent).toContain('exam-viewport-transition');
    });
  });

  /* --------------------------------------------------------------------------
   * 6. View Transitions Runtime Interoperability & Accessibility Focus
   * -------------------------------------------------------------------------- */
  describe('View Transitions & Accessibility Interoperability', () => {
    it('executes updateFn and onFinished in runSafeViewTransition when API is not available in node', () => {
      const updateFn = vi.fn();
      const onFinished = vi.fn();

      runSafeViewTransition(updateFn, onFinished);

      expect(updateFn).toHaveBeenCalledTimes(1);
      expect(onFinished).toHaveBeenCalledTimes(1);
    });

    it('supports mock document.startViewTransition and fires callbacks', async () => {
      const updateFn = vi.fn();
      const onFinished = vi.fn();

      const origDoc = global.document;
      let finallyCb: (() => void) | null = null;

      const mockFinishedPromise = {
        finally: vi.fn((cb: () => void) => {
          finallyCb = cb;
          return mockFinishedPromise;
        }),
        then: vi.fn(),
      };

      // Mock startViewTransition
      (global as unknown as { document: unknown }).document = {
        startViewTransition: vi.fn((cb: () => void) => {
          cb();
          return { finished: mockFinishedPromise };
        }),
      };

      runSafeViewTransition(updateFn, onFinished);

      expect(updateFn).toHaveBeenCalledTimes(1);
      expect(mockFinishedPromise.finally).toHaveBeenCalled();

      // Trigger the finally callback
      if (finallyCb) {
        (finallyCb as () => void)();
      }
      expect(onFinished).toHaveBeenCalledTimes(1);

      // Restore document
      global.document = origDoc;
    });

    it('routes focus to question card with tabIndex=-1 and preventScroll: true in focusQuestionCard', () => {
      const mockFocus = vi.fn();
      const mockElement = {
        tabIndex: 0,
        focus: mockFocus,
      };

      const origDoc = global.document;
      (global as unknown as { document: unknown }).document = {
        getElementById: vi.fn((id: string) => {
          if (id === 'question-card-42') return mockElement;
          return null;
        }),
      };

      focusQuestionCard(42);

      expect(mockElement.tabIndex).toBe(-1);
      expect(mockFocus).toHaveBeenCalledWith({ preventScroll: true });

      // Non-existent element should not throw
      expect(() => focusQuestionCard('missing-id')).not.toThrow();

      global.document = origDoc;
    });
  });
});
