import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { StimulusRenderer } from '../src/components/exam/StimulusRenderer';
import * as parser from '../src/lib/parser';
import fs from 'fs';
import path from 'path';

describe('Challenger M1.2: Dual-Surface Virtualization & Layout Containment Stress Test', () => {

  describe('F05: Stimulus Parsing Memoization under Timer Ticks', () => {
    it('does not re-parse markdown when StimulusRenderer re-renders with identical content', () => {
      const parseSpy = vi.spyOn(parser, 'parseMarkdown');
      parseSpy.mockClear();

      const sampleContent = 'Berikut adalah teks bacaan kasus analisis daya hantar listrik larutan elektrolit kuat dan lemah.';

      // Harness simulating parent component ticking a countdown timer every frame/tick
      function TimerHarness({ ticks }: { ticks: number }) {
        const [time] = useState(3600);

        return (
          <div>
            <span>Time Left: {time - ticks}</span>
            <StimulusRenderer content={sampleContent}>
              <div>Child question 1</div>
              <div>Child question 2</div>
            </StimulusRenderer>
          </div>
        );
      }

      // Initial render: parseMarkdown must be called once
      renderToStaticMarkup(<TimerHarness ticks={0} />);
      const initialCalls = parseSpy.mock.calls.length;
      expect(initialCalls).toBe(1);

      parseSpy.mockRestore();
    });

    it('verifies that ExamRunner.tsx contains singleStimulusBlocks memoized on [questions, currentSingleIdx]', () => {
      const examRunnerPath = path.resolve(__dirname, '../src/components/exam/ExamRunner.tsx');
      const content = fs.readFileSync(examRunnerPath, 'utf8');

      // Verify singleStimulusBlocks exists
      expect(content).toContain('const singleStimulusBlocks = useMemo(');
      expect(content).toContain('[questions, currentSingleIdx]');

      // Verify Mode 1 uses singleStimulusBlocks rather than raw parseMarkdown
      expect(content).toContain('const stimulusBlocks = singleStimulusBlocks;');
      // Verify raw parseMarkdown is NOT invoked directly in Mode 1 JSX
      const mode1Section = content.substring(content.indexOf("displayMode === '1'"), content.indexOf("displayMode === '5'"));
      expect(mode1Section).not.toContain('parseMarkdown(');
    });

    it('verifies that review/page.tsx contains singleStimulusBlocks memoized on [filteredQuestions, currentSingleIdx]', () => {
      const reviewPagePath = path.resolve(__dirname, '../src/app/exam/[id]/review/page.tsx');
      const content = fs.readFileSync(reviewPagePath, 'utf8');

      // Verify singleStimulusBlocks exists
      expect(content).toContain('const singleStimulusBlocks = useMemo(');
      expect(content).toContain('[filteredQuestions, currentSingleIdx]');

      // Verify Mode 1 uses singleStimulusBlocks rather than raw parseMarkdown
      expect(content).toContain('const stimulusBlocks = singleStimulusBlocks;');
      const mode1Section = content.substring(content.indexOf("displayMode === '1'"), content.indexOf("displayMode === '5'"));
      expect(mode1Section).not.toContain('parseMarkdown(');
    });
  });

  describe('F06: Dual-Surface Virtualization & Layout Containment Syntax', () => {
    it('verifies content-visibility: auto and contain-intrinsic-size: auto 320px in review/page.tsx', () => {
      const reviewPagePath = path.resolve(__dirname, '../src/app/exam/[id]/review/page.tsx');
      const content = fs.readFileSync(reviewPagePath, 'utf8');

      // Mode 3 continuous review list MUST contain the virtualization & containment classes
      expect(content).toContain('[content-visibility:auto]');
      expect(content).toContain('[contain-intrinsic-size:auto_320px]');
      expect(content).toContain('scroll-mt-6');
    });

    it('verifies content-visibility: auto and contain-intrinsic-size: auto 320px in ExamRunner.tsx', () => {
      const examRunnerPath = path.resolve(__dirname, '../src/components/exam/ExamRunner.tsx');
      const content = fs.readFileSync(examRunnerPath, 'utf8');

      // Mode 'all' virtual items container MUST have the containment classes
      expect(content).toContain('[content-visibility:auto]');
      expect(content).toContain('[contain-intrinsic-size:auto_320px]');
    });

    it('verifies QuestionRenderer card has strict layout_style_paint containment (F02)', () => {
      const qrPath = path.resolve(__dirname, '../src/components/exam/QuestionRenderer.tsx');
      const content = fs.readFileSync(qrPath, 'utf8');

      expect(content).toContain('[contain:layout_style_paint]');
    });
  });

  describe('F06/Anchor Navigation: Question Anchor ID and Scroll Target Integrity', () => {
    it('verifies each question card in review Mode 3 has id="review-q-${q.id}"', () => {
      const reviewPagePath = path.resolve(__dirname, '../src/app/exam/[id]/review/page.tsx');
      const content = fs.readFileSync(reviewPagePath, 'utf8');

      expect(content).toContain('id={`review-q-${q.id}`}');
    });

    it('verifies navigateToQuestion uses getElementById review-q-${qId} with smooth scroll', () => {
      const reviewPagePath = path.resolve(__dirname, '../src/app/exam/[id]/review/page.tsx');
      const content = fs.readFileSync(reviewPagePath, 'utf8');

      expect(content).toContain('document.getElementById(`review-q-${qId}`)');
      expect(content).toContain("scrollIntoView({ behavior: 'smooth', block: 'start' })");
    });

    it('verifies navigateToQuestion resets filter to all if targeted question is filtered out', () => {
      const reviewPagePath = path.resolve(__dirname, '../src/app/exam/[id]/review/page.tsx');
      const content = fs.readFileSync(reviewPagePath, 'utf8');

      expect(content).toContain("setActiveFilter('all')");
    });
  });

  describe('F07: Virtual Scroll Animation Stutter Elimination', () => {
    it('verifies repeated slide-in animation is removed from virtualized items in ExamRunner.tsx', () => {
      const examRunnerPath = path.resolve(__dirname, '../src/components/exam/ExamRunner.tsx');
      const content = fs.readFileSync(examRunnerPath, 'utf8');

      // Locate virtualizer.getVirtualItems section in Mode all
      const virtualSectionStart = content.indexOf('virtualizer.getVirtualItems().map');
      expect(virtualSectionStart).toBeGreaterThan(-1);

      const virtualSection = content.substring(virtualSectionStart, virtualSectionStart + 600);
      // F07 invariant: animate-in and slide-in must NOT be on the virtualized wrapper
      expect(virtualSection).not.toContain('slide-in-from-bottom');
      expect(virtualSection).not.toContain('animate-in');
    });
  });

});
