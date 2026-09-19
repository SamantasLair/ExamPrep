import 'fake-indexeddb/auto';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Question } from '../src/lib/types';
import { ActivePracticeCanvas } from '../src/components/course/ActivePracticeCanvas';
import {
  getMasteryRating,
  getMasteryBadgeClass,
  type MasteryRating,
} from '../src/components/course/QuizAssessment';
import { db, enqueueCourseDelta } from '../src/lib/db';

describe('Course Exercise & Quiz Regression Test Suite (SW-T04)', () => {
  beforeEach(async () => {
    await db.courseProgress.clear();
    await db.progressDeltas.clear();
  });

  /* --------------------------------------------------------------------------
   * 1. Pengujian Interaksi OpenBook Exercise: Pemilihan Opsi, Instant Feedback & Pembahasan
   * -------------------------------------------------------------------------- */
  describe('1. OpenBook Exercise Interaction & Instant Feedback', () => {
    const sampleExerciseQuestion: Question = {
      id: 101,
      type: 'MCQ',
      body: [{ type: 'text', content: 'Apakah satuan turunan dari gaya dalam Sistem Internasional (SI)?' }],
      options: [
        { key: 'A', body: [{ type: 'text', content: 'Joule (J)' }] },
        { key: 'B', body: [{ type: 'text', content: 'Newton (N)' }] },
        { key: 'C', body: [{ type: 'text', content: 'Watt (W)' }] },
        { key: 'D', body: [{ type: 'text', content: 'Pascal (Pa)' }] },
      ],
      correctAnswer: 'B',
      discussion: [
        { type: 'text', content: 'Gaya memiliki satuan Newton (N) yang setara dengan kg.m/s^2 berdasarkan Hukum II Newton.' },
      ],
      tips: [
        { type: 'THEORY', content: [{ type: 'text', content: 'Gaya dirumuskan sebagai F = m . a' }] },
        { type: 'PRACTICE', content: [{ type: 'text', content: 'Massa dalam kg dan percepatan dalam m/s^2' }] },
      ],
    };

    it('renders MCQ options with tactile keycaps [A-D] in initial unsubmitted state', () => {
      const markup = renderToStaticMarkup(
        React.createElement(ActivePracticeCanvas, {
          question: sampleExerciseQuestion,
          questionNumber: 1,
          totalQuestions: 5,
          selectedAnswer: undefined,
          onSelectAnswer: vi.fn(),
        })
      );

      expect(markup).toContain('Latihan 1 / 5');
      expect(markup).toContain('Pilihan Ganda');
      expect(markup).toContain('Apakah satuan turunan dari gaya');
      expect(markup).toContain('Joule (J)');
      expect(markup).toContain('Newton (N)');
      expect(markup).toContain('Watt (W)');
      expect(markup).toContain('Pascal (Pa)');
      expect(markup).toContain('Cek Jawaban');
      // Discussion should be hidden before submit
      expect(markup).not.toContain('Pembahasan Detail &amp; Kunci Jawaban');
      expect(markup).not.toContain('Hukum II Newton');
    });

    it('highlights selected answer with tactile primary ring and badge styles', () => {
      const markup = renderToStaticMarkup(
        React.createElement(ActivePracticeCanvas, {
          question: sampleExerciseQuestion,
          questionNumber: 1,
          totalQuestions: 5,
          selectedAnswer: 'B',
          onSelectAnswer: vi.fn(),
          submitted: false,
        })
      );

      // Selected keycap B has active styling
      expect(markup).toContain('bg-primary text-primary-foreground border-primary');
      // Submit button should not be disabled
      expect(markup).toContain('Cek Jawaban');
    });

    it('reveals instant feedback and full discussion when submitted with correct answer', () => {
      const markup = renderToStaticMarkup(
        React.createElement(ActivePracticeCanvas, {
          question: sampleExerciseQuestion,
          questionNumber: 1,
          totalQuestions: 5,
          selectedAnswer: 'B',
          onSelectAnswer: vi.fn(),
          submitted: true,
        })
      );

      // Instant feedback status
      expect(markup).toContain('Jawaban Tepat');
      expect(markup).toContain('border-emerald-500');
      // Discussion block revealed
      expect(markup).toContain('Pembahasan Detail &amp; Kunci Jawaban');
      expect(markup).toContain('Kunci: B');
      expect(markup).toContain('Hukum II Newton');
    });

    it('displays error feedback and discussion when submitted with wrong answer', () => {
      const markup = renderToStaticMarkup(
        React.createElement(ActivePracticeCanvas, {
          question: sampleExerciseQuestion,
          questionNumber: 1,
          totalQuestions: 5,
          selectedAnswer: 'A',
          onSelectAnswer: vi.fn(),
          submitted: true,
        })
      );

      // Instant feedback badge
      expect(markup).toContain('Belum Tepat');
      // Wrong pick indicator style
      expect(markup).toContain('border-rose-500');
      // Correct answer is highlighted in green
      expect(markup).toContain('border-emerald-500');
      // Discussion is still displayed to help the learner understand why
      expect(markup).toContain('Pembahasan Detail &amp; Kunci Jawaban');
      expect(markup).toContain('Kunci: B');
    });

    it('renders question stimulus when stimulus_content is present', () => {
      const questionWithStimulus: Question = {
        ...sampleExerciseQuestion,
        stimulus_content: 'Bacalah teks eksperimen pengukuran massa dan percepatan berikut dengan seksama.',
      };

      const markup = renderToStaticMarkup(
        React.createElement(ActivePracticeCanvas, {
          question: questionWithStimulus,
          questionNumber: 2,
          totalQuestions: 5,
          onSelectAnswer: vi.fn(),
        })
      );

      expect(markup).toContain('Konteks Soal');
      expect(markup).toContain('Bacalah teks eksperimen pengukuran massa');
    });
  });

  /* --------------------------------------------------------------------------
   * 2. Pengujian Sistem Petunjuk Bertahap (Progressive Hint Disclosure)
   * -------------------------------------------------------------------------- */
  describe('2. Progressive Hint Disclosure System', () => {
    const questionWithTips: Question = {
      id: 202,
      type: 'MCQ',
      body: [{ type: 'text', content: 'Hitung energi kinetik benda bermassa 2 kg yang melaju dengan kecepatan 3 m/s!' }],
      options: [
        { key: 'A', body: [{ type: 'text', content: '6 J' }] },
        { key: 'B', body: [{ type: 'text', content: '9 J' }] },
        { key: 'C', body: [{ type: 'text', content: '18 J' }] },
        { key: 'D', body: [{ type: 'text', content: '36 J' }] },
      ],
      correctAnswer: 'B',
      tips: [
        { type: 'THEORY', content: [{ type: 'text', content: 'Energi kinetik adalah energi yang dimiliki benda bergerak.' }] },
        { type: 'PRACTICE', content: [{ type: 'text', content: 'Gunakan persamaan Ek = 1/2 . m . v^2' }] },
      ],
    };

    it('calculates available hint levels correctly based on question tips structure', () => {
      const theoryTips = (questionWithTips.tips || []).filter((t) => t.type === 'THEORY');
      const practiceTips = (questionWithTips.tips || []).filter((t) => t.type === 'PRACTICE');
      const maxHintLevel = (theoryTips.length > 0 ? 1 : 0) + (practiceTips.length > 0 ? 1 : 0);

      expect(theoryTips).toHaveLength(1);
      expect(practiceTips).toHaveLength(1);
      expect(maxHintLevel).toBe(2);
    });

    it('verifies Progressive Hint button label state machine', () => {
      // Simulation of hint level progression
      function getHintButtonText(hintLevel: number, maxHintLevel: number): string {
        if (hintLevel === 0) return 'Buka Petunjuk';
        if (hintLevel === 1 && maxHintLevel > 1) return 'Buka Petunjuk Rumus';
        return 'Petunjuk Terbuka';
      }

      expect(getHintButtonText(0, 2)).toBe('Buka Petunjuk');
      expect(getHintButtonText(1, 2)).toBe('Buka Petunjuk Rumus');
      expect(getHintButtonText(2, 2)).toBe('Petunjuk Terbuka');
    });

    it('handles questions without tips gracefully with maxHintLevel = 0', () => {
      const questionWithoutTips: Question = {
        id: 203,
        type: 'MCQ',
        body: [{ type: 'text', content: 'Soal tanpa tips' }],
        options: [{ key: 'A', body: [{ type: 'text', content: 'Opsi A' }] }],
        correctAnswer: 'A',
      };

      const theoryTips = (questionWithoutTips.tips || []).filter((t) => t.type === 'THEORY');
      const practiceTips = (questionWithoutTips.tips || []).filter((t) => t.type === 'PRACTICE');
      const maxHintLevel = (theoryTips.length > 0 ? 1 : 0) + (practiceTips.length > 0 ? 1 : 0);

      expect(maxHintLevel).toBe(0);

      const markup = renderToStaticMarkup(
        React.createElement(ActivePracticeCanvas, {
          question: questionWithoutTips,
          onSelectAnswer: vi.fn(),
        })
      );

      // Button "Buka Petunjuk" must not be rendered when question has 0 tips
      expect(markup).not.toContain('Buka Petunjuk');
    });
  });

  /* --------------------------------------------------------------------------
   * 3. Pengujian Evaluasi Kuis: Skor Persentase & Validasi Kelulusan berbasis passing_score
   * -------------------------------------------------------------------------- */
  describe('3. Quiz Evaluation: Percentage Score & Passing Score Validation', () => {
    const mockQuizQuestions: Question[] = [
      { id: 1, type: 'MCQ', body: [{ type: 'text', content: 'Q1' }], correctAnswer: 'A' },
      { id: 2, type: 'MCQ', body: [{ type: 'text', content: 'Q2' }], correctAnswer: 'B' },
      { id: 3, type: 'MCQ', body: [{ type: 'text', content: 'Q3' }], correctAnswer: 'C' },
      { id: 4, type: 'MCQ', body: [{ type: 'text', content: 'Q4' }], correctAnswer: 'D' },
      { id: 5, type: 'MCQ', body: [{ type: 'text', content: 'Q5' }], correctAnswer: 'A' },
    ];

    function evaluateQuizAnswers(
      questions: Question[],
      answers: Record<string, string>,
      passingScore: number
    ) {
      let correctCount = 0;
      for (const q of questions) {
        const userAns = answers[String(q.id)];
        if (userAns && userAns === q.correctAnswer) {
          correctCount++;
        }
      }
      const totalQuestions = questions.length;
      const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
      const passed = score >= passingScore;
      const rating = getMasteryRating(score);

      return { score, correctCount, totalQuestions, passed, rating };
    }

    it('calculates 100% score and marks as passed when all 5 answers are correct', () => {
      const userAnswers = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'A' };
      const result = evaluateQuizAnswers(mockQuizQuestions, userAnswers, 70);

      expect(result.score).toBe(100);
      expect(result.correctCount).toBe(5);
      expect(result.passed).toBe(true);
      expect(result.rating).toBe('Master');
    });

    it('calculates 80% score and passes with default passing_score 70%', () => {
      const userAnswers = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'B' }; // 4/5 correct
      const result = evaluateQuizAnswers(mockQuizQuestions, userAnswers, 70);

      expect(result.score).toBe(80);
      expect(result.correctCount).toBe(4);
      expect(result.passed).toBe(true);
      expect(result.rating).toBe('Proficient');
    });

    it('fails when score is 60% with passing_score 70%', () => {
      const userAnswers = { '1': 'A', '2': 'B', '3': 'C', '4': 'A', '5': 'B' }; // 3/5 correct
      const result = evaluateQuizAnswers(mockQuizQuestions, userAnswers, 70);

      expect(result.score).toBe(60);
      expect(result.correctCount).toBe(3);
      expect(result.passed).toBe(false);
      expect(result.rating).toBe('Competent');
    });

    it('validates custom passing_score boundary conditions (e.g. strict 85% or lenient 50%)', () => {
      const userAnswers = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'B' }; // 80%

      // Strict passing_score 85% -> 80% fails
      const strictResult = evaluateQuizAnswers(mockQuizQuestions, userAnswers, 85);
      expect(strictResult.score).toBe(80);
      expect(strictResult.passed).toBe(false);

      // Lenient passing_score 50% -> 80% passes
      const lenientResult = evaluateQuizAnswers(mockQuizQuestions, userAnswers, 50);
      expect(lenientResult.score).toBe(80);
      expect(lenientResult.passed).toBe(true);
    });

    it('handles completely unanswered quiz returning 0% score and failed status', () => {
      const emptyAnswers = {};
      const result = evaluateQuizAnswers(mockQuizQuestions, emptyAnswers, 70);

      expect(result.score).toBe(0);
      expect(result.correctCount).toBe(0);
      expect(result.passed).toBe(false);
      expect(result.rating).toBe('Novice');
    });

    it('persists quiz submission delta to Dexie IndexedDB when submitted', async () => {
      const courseId = 'course-phys-101';
      const userId = 'student-001';
      const quizId = 'quiz-subchapter-1';

      const deltaId = await enqueueCourseDelta({
        courseId,
        userId,
        entityType: 'QUIZ_SUBMIT',
        entityId: quizId,
        timestamp: Date.now(),
        payload: {
          quizId,
          score: 85,
          passed: true,
          rating: 'Proficient',
        },
      });

      expect(deltaId).toBeGreaterThan(0);

      const pending = await db.progressDeltas.where('synced').equals(0).toArray();
      expect(pending).toHaveLength(1);
      expect(pending[0].entityType).toBe('QUIZ_SUBMIT');
      expect((pending[0].payload as { score: number }).score).toBe(85);
    });
  });

  /* --------------------------------------------------------------------------
   * 4. Pengujian Penentuan Badge Mastery Rating: Novice, Competent, Proficient, Master
   * -------------------------------------------------------------------------- */
  describe('4. Mastery Rating Calculation & Visual Badge Styling', () => {
    it("classifies score < 50 as 'Novice'", () => {
      expect(getMasteryRating(0)).toBe('Novice');
      expect(getMasteryRating(25)).toBe('Novice');
      expect(getMasteryRating(49)).toBe('Novice');
      expect(getMasteryRating(49.9)).toBe('Novice');
      expect(getMasteryBadgeClass('Novice')).toContain('border-zinc-500/30');
    });

    it("classifies score 50 - 69 as 'Competent'", () => {
      expect(getMasteryRating(50)).toBe('Competent');
      expect(getMasteryRating(55)).toBe('Competent');
      expect(getMasteryRating(69)).toBe('Competent');
      expect(getMasteryBadgeClass('Competent')).toContain('border-blue-500/30');
    });

    it("classifies score 70 - 89 as 'Proficient'", () => {
      expect(getMasteryRating(70)).toBe('Proficient');
      expect(getMasteryRating(75)).toBe('Proficient');
      expect(getMasteryRating(89)).toBe('Proficient');
      expect(getMasteryBadgeClass('Proficient')).toContain('border-emerald-500/30');
    });

    it("classifies score 90 - 100 as 'Master'", () => {
      expect(getMasteryRating(90)).toBe('Master');
      expect(getMasteryRating(95)).toBe('Master');
      expect(getMasteryRating(100)).toBe('Master');
      expect(getMasteryBadgeClass('Master')).toContain('border-purple-500/30');
    });

    it('returns valid badge classes for all possible MasteryRating variants', () => {
      const ratings: MasteryRating[] = ['Novice', 'Competent', 'Proficient', 'Master'];
      for (const rating of ratings) {
        const badgeClass = getMasteryBadgeClass(rating);
        expect(badgeClass).toBeDefined();
        expect(typeof badgeClass).toBe('string');
        expect(badgeClass.length).toBeGreaterThan(0);
      }
    });
  });
});
