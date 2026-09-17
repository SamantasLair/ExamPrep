import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MathRenderer } from '../src/components/exam/MathRenderer';
import { QuestionRenderer } from '../src/components/exam/QuestionRenderer';
import type { Question } from '../src/lib/types';

describe('Challenger M1: MathRenderer Stress Test', () => {
  it('renders standard inline math synchronously without null/empty output', () => {
    const html = renderToStaticMarkup(<MathRenderer tex="E = mc^2" displayMode={false} />);
    expect(html).toContain('katex');
    expect(html).toContain('[contain:layout_style]');
    expect(html).toContain('inline-block');
  });

  it('renders standard display math with layout_paint containment and overflow scroll', () => {
    const html = renderToStaticMarkup(<MathRenderer tex="\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}" displayMode={true} />);
    expect(html).toContain('katex-display');
    expect(html).toContain('[contain:layout_paint]');
    expect(html).toContain('overflow-x-auto');
    expect(html).toContain('block my-3 text-center');
  });

  it('handles malformed LaTeX gracefully without throwing uncaught exceptions', () => {
    const malformedInputs = [
      '\\frac{1}', // missing denominator
      '\\sqrt{', // unclosed brace
      '\\notAValidKaTeXCommandName12345', // unknown macro
      '\\begin{pmatrix} 1 & 2', // unclosed environment
      '{{{{{{{{', // excessive unclosed braces
      '\\left( x + y', // unclosed left delimiter
      '\\overbrace{x}^{', // unclosed overbrace
      '\\text{unclosed', // unclosed text
    ];

    for (const badTex of malformedInputs) {
      expect(() => {
        const html = renderToStaticMarkup(<MathRenderer tex={badTex} displayMode={false} />);
        // KaTeX with throwOnError:false outputs an error span or fallback
        expect(html.length).toBeGreaterThan(0);
      }).not.toThrow();
    }
  });

  it('handles empty and whitespace-only LaTeX strings', () => {
    const emptyHtml = renderToStaticMarkup(<MathRenderer tex="" displayMode={false} />);
    expect(emptyHtml).toBeDefined();

    const wsHtml = renderToStaticMarkup(<MathRenderer tex="    " displayMode={true} />);
    expect(wsHtml).toBeDefined();
  });

  it('survives extreme display formulas (large matrices, long equations, deep nesting)', () => {
    // Very long single-line polynomial
    const longPoly = Array.from({ length: 100 }, (_, i) => `a_{${i}} x^{${i}}`).join(' + ') + ' = 0';
    const longHtml = renderToStaticMarkup(<MathRenderer tex={longPoly} displayMode={true} />);
    expect(longHtml).toContain('katex');
    expect(longHtml).toContain('[contain:layout_paint]');

    // Deep fraction stack (20 levels)
    let deepFrac = '1';
    for (let i = 0; i < 20; i++) {
      deepFrac = `\\frac{1}{1 + ${deepFrac}}`;
    }
    const deepHtml = renderToStaticMarkup(<MathRenderer tex={deepFrac} displayMode={true} />);
    expect(deepHtml).toContain('katex');

    // 10x10 matrix
    const matrixRows = Array.from({ length: 10 }, (_, r) =>
      Array.from({ length: 10 }, (_, c) => `${r * 10 + c}`).join(' & ')
    ).join(' \\\\ ');
    const matrixTex = `\\begin{pmatrix} ${matrixRows} \\end{pmatrix}`;
    const matrixHtml = renderToStaticMarkup(<MathRenderer tex={matrixTex} displayMode={true} />);
    expect(matrixHtml).toContain('katex');
  });

  it('does not execute raw script tags or unsafe HTML injection via LaTeX input', () => {
    const malicious = '<script>alert("xss")</script>';
    const html = renderToStaticMarkup(<MathRenderer tex={malicious} displayMode={false} />);
    // KaTeX escapes HTML tags in error/text mode, so raw <script> should not appear unescaped
    expect(html).not.toContain('<script>alert("xss")</script>');

    const fallbackMalicious = renderToStaticMarkup(<MathRenderer tex={'\\invalid{' + malicious} displayMode={false} />);
    expect(fallbackMalicious).not.toContain('<script>alert("xss")</script>');
  });
});

describe('Challenger M1: QuestionRenderer Stress Test', () => {
  const baseMcq: Question = {
    id: 1,
    type: 'MCQ',
    body: [{ type: 'text', content: 'Hitung nilai dari $x$ bila $2x + 6 = 10$:' }],
    options: [
      { key: 'A', body: [{ type: 'text', content: '1' }] },
      { key: 'B', body: [{ type: 'text', content: '2' }] },
      { key: 'C', body: [{ type: 'text', content: '3' }] },
      { key: 'D', body: [{ type: 'text', content: '4' }] },
    ],
    correctAnswer: 'B',
    discussion: [{ type: 'text', content: '$2x = 4 \\implies x = 2$. Opsi yang tepat adalah B.' }],
    labels: ['Aljabar', 'Matematika'],
  };

  const baseEssay: Question = {
    id: 2,
    type: 'ESSAY',
    body: [{ type: 'text', content: 'Jelaskan konsep dasar hukum termodinamika ke-2!' }],
    correctAnswer: 'ESSAY',
    discussion: [{ type: 'text', content: 'Entropi total dari sistem terisolasi selalu meningkat.' }],
    labels: ['Fisika', 'Termodinamika'],
  };

  it('verifies DOM layout containment and accessibility attributes (F02)', () => {
    // 1. Standard Card Mode
    const cardHtml = renderToStaticMarkup(<QuestionRenderer question={baseMcq} />);
    expect(cardHtml).toContain('id="question-card-1"');
    expect(cardHtml).toContain('tabindex="-1"');
    expect(cardHtml).toContain('[contain:layout_style_paint]');

    // 2. Borderless Mode
    const borderlessHtml = renderToStaticMarkup(<QuestionRenderer question={baseMcq} borderless />);
    expect(borderlessHtml).toContain('id="question-card-1"');
    expect(borderlessHtml).toContain('tabindex="-1"');
    expect(borderlessHtml).toContain('[contain:layout_style_paint]');

    // 3. ShowOnlyDiscussion Mode
    const discussionHtml = renderToStaticMarkup(<QuestionRenderer question={baseMcq} showOnlyDiscussion />);
    expect(discussionHtml).toContain('id="question-card-1"');
    expect(discussionHtml).toContain('tabindex="-1"');
    expect(discussionHtml).toContain('[contain:layout_style_paint]');

    // 4. Print Mode
    const printHtml = renderToStaticMarkup(<QuestionRenderer question={baseMcq} printMode />);
    expect(printHtml).toContain('id="question-card-1"');
    expect(printHtml).toContain('tabindex="-1"');
  });

  it('verifies Essay textarea ergonomics attributes (F03)', () => {
    const essayHtml = renderToStaticMarkup(<QuestionRenderer question={baseEssay} answer="Jawaban awal" />);
    expect(essayHtml).toMatch(/spellcheck="false"/i);
    expect(essayHtml).toMatch(/autocomplete="off"/i);
    expect(essayHtml).toMatch(/autocorrect="off"/i);
    expect(essayHtml).toMatch(/autocapitalize="off"/i);
    expect(essayHtml).toContain('[field-sizing:content]');
    expect(essayHtml).toContain('Jawaban awal');
  });

  it('handles empty answers (undefined and empty string) across MCQ and Essay', () => {
    // MCQ with undefined answer
    const mcqUndef = renderToStaticMarkup(<QuestionRenderer question={baseMcq} answer={undefined} />);
    expect(mcqUndef).not.toContain('animate-keycap-pop');

    // MCQ with empty string answer
    const mcqEmpty = renderToStaticMarkup(<QuestionRenderer question={baseMcq} answer="" />);
    expect(mcqEmpty).not.toContain('animate-keycap-pop');

    // Essay with undefined answer
    const essayUndef = renderToStaticMarkup(<QuestionRenderer question={baseEssay} answer={undefined} />);
    expect(essayUndef).toMatch(/spellcheck="false"/i);

    // Essay with empty string answer
    const essayEmpty = renderToStaticMarkup(<QuestionRenderer question={baseEssay} answer="" />);
    expect(essayEmpty).toMatch(/spellcheck="false"/i);
  });

  it('handles massive essay inputs and special characters gracefully', () => {
    // 50,000 characters input
    const massiveText = 'Paragraf panjang evaluasi sains '.repeat(1500);
    const massiveHtml = renderToStaticMarkup(<QuestionRenderer question={baseEssay} answer={massiveText} />);
    expect(massiveHtml.length).toBeGreaterThan(massiveText.length);

    // Special characters: quotes, newlines, emojis, math symbols, html tags
    const specialText = 'Line 1: "Quotes" & \'single quotes\'\nLine 2: <script>alert("XSS")</script>\nLine 3: 🎉🔥🚀 ∑∫_{0}^{1} x dx = 0.5\nLine 4: RTL نص عربي & CJK 漢字';
    const specialHtml = renderToStaticMarkup(<QuestionRenderer question={baseEssay} answer={specialText} />);
    // HTML in textarea should be escaped
    expect(specialHtml).not.toContain('<script>alert("XSS")</script>');
    expect(specialHtml).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    expect(specialHtml).toContain('🎉🔥🚀');
    expect(specialHtml).toContain('نص عربي');
    expect(specialHtml).toContain('漢字');
  });

  it('handles graded vs neutral feedback modes accurately', () => {
    // Graded - Correct Answer
    const gradedCorrect = renderToStaticMarkup(
      <QuestionRenderer question={baseMcq} answer="B" showCorrectAnswer feedbackMode="graded" />
    );
    expect(gradedCorrect).toContain('Benar');
    expect(gradedCorrect).toContain('border-emerald-500');

    // Graded - Wrong Answer
    const gradedWrong = renderToStaticMarkup(
      <QuestionRenderer question={baseMcq} answer="C" showCorrectAnswer feedbackMode="graded" />
    );
    expect(gradedWrong).toContain('Salah');
    expect(gradedWrong).toContain('border-rose-500');

    // Neutral Feedback Mode
    const neutral = renderToStaticMarkup(
      <QuestionRenderer question={baseMcq} answer="A" showCorrectAnswer feedbackMode="neutral" />
    );
    expect(neutral).toContain('Jawaban: A');
    expect(neutral).not.toContain('Benar');
    expect(neutral).not.toContain('Salah');
  });

  it('handles edge case questions (missing options, empty body, tips with penalty)', () => {
    // MCQ with empty options array
    const emptyOptionsQ: Question = {
      id: 99,
      type: 'MCQ',
      body: [{ type: 'text', content: 'Soal tanpa opsi' }],
      correctAnswer: 'A',
    };
    expect(() => renderToStaticMarkup(<QuestionRenderer question={emptyOptionsQ} />)).not.toThrow();

    // Question with tips and penalty enabled
    const tipsQ: Question = {
      id: 100,
      type: 'MCQ',
      body: [{ type: 'text', content: 'Soal dengan tips' }],
      correctAnswer: 'A',
      tips: [
        { type: 'THEORY', content: [{ type: 'text', content: 'Gunakan hukum Ohm V = IR' }] },
        { type: 'PRACTICE', content: [{ type: 'text', content: 'Hitung I = 10 / 2 = 5 A' }] },
      ],
    };

    const tipsHtmlUnused = renderToStaticMarkup(
      <QuestionRenderer question={tipsQ} enableTipPenalty tipPenaltyTheory="10, 20" />
    );
    expect(tipsHtmlUnused).toContain('Buka Tip Teori');
    expect(tipsHtmlUnused).toContain('-10% Nilai');

    const tipsHtmlUsed = renderToStaticMarkup(
      <QuestionRenderer question={tipsQ} usedTips={[0]} />
    );
    expect(tipsHtmlUsed).toContain('Tip Teori');
    expect(tipsHtmlUsed).toContain('Gunakan hukum Ohm V = IR');
  });

  it('handles math with inequality operators (<, >), comments (%), and newlines', () => {
    const mathInequality = renderToStaticMarkup(<MathRenderer tex="x < 5 \land y > 10" displayMode={false} />);
    expect(mathInequality).toContain('katex');

    const mathComment = renderToStaticMarkup(<MathRenderer tex={"% this is a comment\nx + y = z"} displayMode={true} />);
    expect(mathComment).toContain('katex');

    const mathMultiline = renderToStaticMarkup(<MathRenderer tex="a = b \\ c = d" displayMode={true} />);
    expect(mathMultiline).toContain('katex');
  });

  it('handles question with mixed content blocks (code, image, math, text)', () => {
    const complexQ: Question = {
      id: 201,
      type: 'MCQ',
      body: [
        { type: 'text', content: 'Perhatikan kode Python berikut:' },
        { type: 'code-block', content: 'def solve(x):\n  return x * 2', language: 'python' },
        { type: 'math-block', content: 'f(x) = 2x' },
        { type: 'image', content: 'https://example.com/graph.png' },
      ],
      options: [
        { key: 'A', body: [{ type: 'math-inline', content: 'f(3) = 6' }] },
        { key: 'B', body: [{ type: 'math-inline', content: 'f(3) = 9' }] },
      ],
      correctAnswer: 'A',
    };

    const html = renderToStaticMarkup(<QuestionRenderer question={complexQ} textSize="large" />);
    expect(html).toContain('text-lg');
    expect(html).toContain('solve(x)');
    expect(html).toContain('https://example.com/graph.png');
    expect(html).toContain('katex');
  });

  it('handles disabled state cleanly on both MCQ and Essay', () => {
    const disabledMcqHtml = renderToStaticMarkup(<QuestionRenderer question={baseMcq} disabled />);
    expect(disabledMcqHtml).toContain('cursor-default');

    const disabledEssayHtml = renderToStaticMarkup(<QuestionRenderer question={baseEssay} disabled />);
    expect(disabledEssayHtml).toContain('disabled=""');
  });

  it('renders all 50 questions from INITIAL_TESTS[0] across all display modes without throwing', async () => {
    const { INITIAL_TESTS } = await import('../src/lib/mockData');
    const { parseMarkdown } = await import('../src/lib/parser');
    const questions = parseMarkdown(INITIAL_TESTS[0].raw_markdown);
    expect(questions).toHaveLength(50);

    for (const q of questions) {
      // 1. Default Card Mode (unanswered)
      expect(() => renderToStaticMarkup(<QuestionRenderer question={q} />)).not.toThrow();

      // 2. Borderless Mode
      expect(() => renderToStaticMarkup(<QuestionRenderer question={q} borderless />)).not.toThrow();

      // 3. Graded Mode with answer = 'A'
      expect(() =>
        renderToStaticMarkup(
          <QuestionRenderer question={q} answer="A" showCorrectAnswer feedbackMode="graded" />
        )
      ).not.toThrow();

      // 4. Graded Mode with correct answer
      expect(() =>
        renderToStaticMarkup(
          <QuestionRenderer question={q} answer={q.correctAnswer} showCorrectAnswer feedbackMode="graded" />
        )
      ).not.toThrow();

      // 5. Print Mode
      expect(() => renderToStaticMarkup(<QuestionRenderer question={q} printMode />)).not.toThrow();

      // 6. Discussion Only Mode
      expect(() => renderToStaticMarkup(<QuestionRenderer question={q} showOnlyDiscussion />)).not.toThrow();

      // 7. Flagged & Tips used
      expect(() =>
        renderToStaticMarkup(<QuestionRenderer question={q} flagged usedTips={[0, 1]} />)
      ).not.toThrow();
    }
  });

  it('renders all 50 questions from SD_Kelas5 FULL file with KaTeX and complex layouts', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const { parseMarkdown } = await import('../src/lib/parser');

    const filePath = path.resolve(__dirname, '../Soal/SD_Kelas5/2026-09-08/soal_sd5_FULL.txt');
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = parseMarkdown(content);
    expect(questions).toHaveLength(50);

    for (const q of questions) {
      const html = renderToStaticMarkup(
        <QuestionRenderer
          question={q}
          answer={q.correctAnswer}
          showDiscussion
          showCorrectAnswer
          feedbackMode="graded"
        />
      );
      expect(html).toContain(`id="question-card-${q.id}"`);
      expect(html).toContain('[contain:layout_style_paint]');
    }
  });
});

