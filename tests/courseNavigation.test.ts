import { describe, it, expect } from 'vitest';
import {
  calculateCourseProgress,
  isSubChapterLocked,
  getSubChapterContext,
  INITIAL_COURSES,
  SAMPLE_GEOM_CATEGORIES,
} from '@/lib/coursesMockData';
import type { Course, CourseCategory, CourseChapter, CourseSubChapter } from '@/lib/types';

describe('Course & Curriculum Navigation Test Suite (SW-T03)', () => {
  describe('1. Parsing and Progress Weight Calculation (calculateCourseProgress)', () => {
    it('returns 0% progress and zero units for a course with no categories or units (Zero Division Guard)', () => {
      const emptyCourse: Course = {
        id: 'empty-course',
        slug: 'empty-course',
        title: 'Empty Course',
        description: 'No categories',
        level: 'SMA',
        tags: [],
        estimated_hours: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        categories: [],
      };

      const result = calculateCourseProgress(emptyCourse);
      expect(result.overallPercentage).toBe(0);
      expect(result.totalUnits).toBe(0);
      expect(result.completedUnits).toBe(0);

      // Null / undefined safety
      expect(calculateCourseProgress(null).overallPercentage).toBe(0);
      expect(calculateCourseProgress(undefined).overallPercentage).toBe(0);
    });

    it('returns 0% when course has materials but none are completed', () => {
      const geomCourse = INITIAL_COURSES.find((c) => c.id === 'course-geom-01');
      expect(geomCourse).toBeDefined();

      const result = calculateCourseProgress(geomCourse, {
        completedMaterials: [],
        exerciseScores: {},
        quizScores: {},
      });

      expect(result.overallPercentage).toBe(0);
      expect(result.totalUnits).toBeGreaterThan(0);
      expect(result.completedUnits).toBe(0);
      expect(result.materialsCount).toBeGreaterThan(0);
      expect(result.completedMaterialsCount).toBe(0);
    });

    it('increases progress proportionally as materials, exercises, and quizzes are completed', () => {
      // Create a predictable synthetic course
      const testCourse: Course = {
        id: 'test-course-calc',
        slug: 'test-course-calc',
        title: 'Test Course Calc',
        description: 'Test calc',
        level: 'SMA',
        tags: ['Math'],
        estimated_hours: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        categories: [
          {
            id: 'cat-1',
            course_id: 'test-course-calc',
            title: 'Kategori 1',
            order_index: 1,
            chapters: [
              {
                id: 'chap-1',
                category_id: 'cat-1',
                title: 'Bab 1',
                order_index: 1,
                subchapters: [
                  {
                    id: 'sub-1',
                    chapter_id: 'chap-1',
                    title: 'Sub-bab 1',
                    order_index: 1,
                    materials: [
                      { id: 'm-1', subchapter_id: 'sub-1', title: 'Mat 1', content: 'C1', order_index: 1 },
                      { id: 'm-2', subchapter_id: 'sub-1', title: 'Mat 2', content: 'C2', order_index: 2 },
                    ],
                    exercises: [
                      { id: 'ex-1', subchapter_id: 'sub-1', title: 'Ex 1', question_ids: ['q1'], order_index: 1 },
                    ],
                    quizzes: [
                      { id: 'qz-1', subchapter_id: 'sub-1', title: 'Qz 1', question_ids: ['q2'], passing_score: 75, order_index: 1 },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      // Total units: 2 materials + 1 exercise + 1 quiz = 4 units
      const initial = calculateCourseProgress(testCourse);
      expect(initial.totalUnits).toBe(4);
      expect(initial.materialsCount).toBe(2);
      expect(initial.exercisesCount).toBe(1);
      expect(initial.quizzesCount).toBe(1);
      expect(initial.overallPercentage).toBe(0);

      // Step 1: Complete 1 material (1/4 = 25%)
      const step1 = calculateCourseProgress(testCourse, {
        completedMaterials: ['m-1'],
      });
      expect(step1.completedUnits).toBe(1);
      expect(step1.completedMaterialsCount).toBe(1);
      expect(step1.overallPercentage).toBe(25);

      // Step 2: Complete 2nd material + exercise (3/4 = 75%)
      const step2 = calculateCourseProgress(testCourse, {
        completedMaterials: ['m-1', 'm-2'],
        exerciseScores: { 'ex-1': 100 },
      });
      expect(step2.completedUnits).toBe(3);
      expect(step2.overallPercentage).toBe(75);

      // Step 3: Quiz attempted but below passing score (score 60 < 75) => still 75%
      const step3FailedQuiz = calculateCourseProgress(testCourse, {
        completedMaterials: ['m-1', 'm-2'],
        exerciseScores: { 'ex-1': 100 },
        quizScores: { 'qz-1': 60 },
      });
      expect(step3FailedQuiz.completedUnits).toBe(3);
      expect(step3FailedQuiz.passedQuizzesCount).toBe(0);
      expect(step3FailedQuiz.overallPercentage).toBe(75);

      // Step 4: Quiz passed (score 80 >= 75) => 4/4 = 100%
      const step4AllPassed = calculateCourseProgress(testCourse, {
        completedMaterials: ['m-1', 'm-2'],
        exerciseScores: { 'ex-1': 100 },
        quizScores: { 'qz-1': 80 },
      });
      expect(step4AllPassed.completedUnits).toBe(4);
      expect(step4AllPassed.passedQuizzesCount).toBe(1);
      expect(step4AllPassed.overallPercentage).toBe(100);
    });
  });

  describe('2. Curriculum Tree Hierarchy Navigation (Category -> Chapter -> Sub-chapter)', () => {
    it('correctly parses category, chapter, and subchapter relationships in sample geometry course', () => {
      const geomCourse = INITIAL_COURSES.find((c) => c.id === 'course-geom-01');
      expect(geomCourse).toBeDefined();
      expect(geomCourse?.categories?.length).toBeGreaterThanOrEqual(2);

      const cat1 = geomCourse!.categories![0];
      expect(cat1.id).toBe('cat-geom-01');
      expect(cat1.title).toContain('Fondasi Vektor');
      expect(cat1.chapters?.length).toBeGreaterThanOrEqual(2);

      const chap1 = cat1.chapters![0];
      expect(chap1.id).toBe('chap-geom-101');
      expect(chap1.category_id).toBe('cat-geom-01');
      expect(chap1.subchapters?.length).toBeGreaterThanOrEqual(2);

      const subChap1 = chap1.subchapters![0];
      expect(subChap1.id).toBe('sub-geom-101-1');
      expect(subChap1.chapter_id).toBe('chap-geom-101');
      expect(subChap1.materials?.length).toBeGreaterThan(0);
    });

    it('resolves contextual hierarchy via getSubChapterContext accurately', () => {
      const ctx = getSubChapterContext('course-geom-01', 'sub-geom-101-2');
      expect(ctx).toBeDefined();
      expect(ctx?.course.id).toBe('course-geom-01');
      expect(ctx?.category?.id).toBe('cat-geom-01');
      expect(ctx?.chapter?.id).toBe('chap-geom-101');
      expect(ctx?.subchapter?.id).toBe('sub-geom-101-2');
      expect(ctx?.subchapter?.title).toContain('Operasi Aljabar Vektor');

      // Works with course slug as well
      const ctxBySlug = getSubChapterContext('geometri-analitik-ruang', 'sub-geom-101-2');
      expect(ctxBySlug).toBeDefined();
      expect(ctxBySlug?.subchapter?.id).toBe('sub-geom-101-2');

      // Non-existent subchapter returns undefined
      const notFound = getSubChapterContext('course-geom-01', 'sub-non-existent');
      expect(notFound).toBeUndefined();
    });

    it('maintains strict sequential order_index ordering for categories, chapters, and subchapters', () => {
      for (const cat of SAMPLE_GEOM_CATEGORIES) {
        expect(typeof cat.order_index).toBe('number');
        let prevChapterOrder = 0;
        for (const chap of cat.chapters || []) {
          expect(chap.order_index).toBeGreaterThan(prevChapterOrder);
          prevChapterOrder = chap.order_index;

          let prevSubOrder = 0;
          for (const sub of chap.subchapters || []) {
            expect(sub.order_index).toBeGreaterThan(prevSubOrder);
            prevSubOrder = sub.order_index;
          }
        }
      }
    });
  });

  describe('3. Prerequisite Quiz Lock Status (isSubChapterLocked)', () => {
    const sampleQuizzes = [
      { id: 'quiz-pre-1', passing_score: 70 },
      { id: 'quiz-pre-2', passing_score: 80 },
    ];

    it('is unlocked when no quizzes are defined or list is empty', () => {
      expect(isSubChapterLocked([], {})).toBe(false);
      expect(isSubChapterLocked(undefined, {})).toBe(false);
    });

    it('is unlocked if no attempts have been made yet (unstarted prerequisite)', () => {
      expect(isSubChapterLocked(sampleQuizzes, {})).toBe(false);
    });

    it('is locked if any prerequisite quiz has been failed below passing score', () => {
      // First quiz scored 65 < 70 => locked
      const scoresFailed = {
        'quiz-pre-1': 65,
      };
      expect(isSubChapterLocked(sampleQuizzes, scoresFailed)).toBe(true);
    });

    it('is unlocked when all attempted prerequisite quizzes achieve passing scores', () => {
      const scoresPassed = {
        'quiz-pre-1': 70, // Exactly passing
        'quiz-pre-2': 85, // Above passing
      };
      expect(isSubChapterLocked(sampleQuizzes, scoresPassed)).toBe(false);
    });

    it('falls back to 70 passing score if passing_score is not specified', () => {
      const quizzesWithoutPassing = [{ id: 'quiz-default' }];

      expect(isSubChapterLocked(quizzesWithoutPassing, { 'quiz-default': 69 })).toBe(true);
      expect(isSubChapterLocked(quizzesWithoutPassing, { 'quiz-default': 70 })).toBe(false);
    });
  });
});
