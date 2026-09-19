'use client';

import React, { useEffect, useState, useMemo, use, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimeBox } from '@/components/ui/AnimeBox';
import { CourseCommandBar } from '@/components/course/CourseCommandBar';
import { CurriculumTreeSidebar } from '@/components/course/CurriculumTreeSidebar';
import { ResizableSplitter } from '@/components/course/ResizableSplitter';
import { TheoryCanvas } from '@/components/course/TheoryCanvas';
import { OpenBookStudio } from '@/components/course/OpenBookStudio';
import { QuizAssessment } from '@/components/course/QuizAssessment';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getCourseByIdOrSlug, getSubChapterContext } from '@/lib/coursesMockData';
import {
  db,
  getCourseProgressLocal,
  saveCourseProgressLocal,
  type CourseProgressRecord
} from '@/lib/db';
import type {
  Course,
  CourseCategory,
  CourseChapter,
  CourseSubChapter,
  CourseMaterial,
  CourseExercise,
  CourseQuiz,
  StudentRow,
  UserCourseProgress,
  Question
} from '@/lib/types';
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  Award,
  AlertCircle,
  FileText,
  PlayCircle,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  SplitSquareVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string; subChapterId: string }> | { id: string; subChapterId: string };
}

type MobileActiveTab = 'theory' | 'practice';

export default function SubChapterLearningPage(props: PageProps) {
  // 1. Resolve Next.js Dynamic Route Params safely
  const resolvedParams = props.params instanceof Promise ? use(props.params) : props.params;
  const courseId = resolvedParams.id;
  const subChapterId = resolvedParams.subChapterId;

  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  // 2. Data states
  const [course, setCourse] = useState<Course | null>(null);
  const [activeCategory, setActiveCategory] = useState<CourseCategory | null>(null);
  const [activeChapter, setActiveChapter] = useState<CourseChapter | null>(null);
  const [activeSubChapter, setActiveSubChapter] = useState<CourseSubChapter | null>(null);
  const [student, setStudent] = useState<StudentRow | null>(null);
  const [progress, setProgress] = useState<UserCourseProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 3. UI and layout states
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [splitRatio, setSplitRatio] = useState<number>(55); // 55% Theory, 45% Practice default
  const [mobileTab, setMobileTab] = useState<MobileActiveTab>('theory');
  const [practiceMode, setPracticeMode] = useState<'openbook' | 'quiz'>('openbook');

  // Load Course Context and Student Data
  useEffect(() => {
    let isMounted = true;

    // A. Resolve SubChapter Context
    const ctx = getSubChapterContext(courseId, subChapterId);
    if (ctx && isMounted) {
      setCourse(ctx.course);
      setActiveCategory(ctx.category || null);
      setActiveChapter(ctx.chapter || null);
      setActiveSubChapter(ctx.subchapter || null);
    } else {
      const fallbackCourse = getCourseByIdOrSlug(courseId);
      if (fallbackCourse && isMounted) {
        setCourse(fallbackCourse);
      }
    }

    // B. Resolve Active Student
    let currentStudentId = 'EXA-001';
    const savedStudentStr = localStorage.getItem('exaprep_student');
    if (savedStudentStr) {
      try {
        const parsed = JSON.parse(savedStudentStr);
        if (isMounted) setStudent(parsed);
        currentStudentId = parsed.id;
      } catch {
        /* ignore parsing error */
      }
    }

    // C. Load Progress Record from Dexie
    async function fetchProgress() {
      try {
        const rec = await getCourseProgressLocal(courseId, currentStudentId);
        if (rec && isMounted) {
          setProgress({
            id: rec.id,
            user_id: rec.userId,
            course_id: rec.courseId,
            completed_materials: rec.completedMaterials || [],
            exercise_scores: rec.exerciseScores || {},
            quiz_scores: rec.quizScores || {},
            overall_progress: rec.overallProgress || 0,
            updated_at: new Date(rec.updatedAt).toISOString()
          });
        }
      } catch (err) {
        console.warn('[SubChapterLearningPage] Failed to load local progress:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProgress();

    return () => {
      isMounted = false;
    };
  }, [courseId, subChapterId]);

  // Derived Active Sub-units
  const activeMaterial: CourseMaterial | undefined = activeSubChapter?.materials?.[0];
  const activeExercise: CourseExercise | undefined = activeSubChapter?.exercises?.[0];
  const activeQuiz: CourseQuiz | undefined = activeSubChapter?.quizzes?.[0];

  // Calculated mastery for this specific subChapter
  const subChapterMastery = useMemo(() => {
    if (!activeSubChapter) return 0;
    const materials = activeSubChapter.materials || [];
    const exercises = activeSubChapter.exercises || [];
    const quizzes = activeSubChapter.quizzes || [];

    const totalUnits = materials.length + exercises.length + quizzes.length;
    if (totalUnits === 0) return 100;

    const completedMaterialsSet = new Set(progress?.completed_materials || []);
    const completedMatCount = materials.filter((m) => completedMaterialsSet.has(m.id)).length;

    const exerciseScores = progress?.exercise_scores || {};
    const completedExCount = exercises.filter((e) => exerciseScores[e.id] !== undefined).length;

    const quizScores = progress?.quiz_scores || {};
    const completedQuizCount = quizzes.filter(
      (q) => (quizScores[q.id] || 0) >= (q.passing_score ?? 70)
    ).length;

    const completedUnits = completedMatCount + completedExCount + completedQuizCount;
    return Math.round((completedUnits / totalUnits) * 100);
  }, [activeSubChapter, progress]);

  // Material completed callback
  const handleMaterialCompleted = (materialId: string) => {
    const studentId = student?.id || 'EXA-001';
    setProgress((prev) => {
      const prevCompleted = prev?.completed_materials || [];
      const updatedMaterials = prevCompleted.includes(materialId)
        ? prevCompleted
        : [...prevCompleted, materialId];

      const newProgress: UserCourseProgress = {
        id: prev?.id || `${courseId}_${studentId}`,
        user_id: studentId,
        course_id: courseId,
        completed_materials: updatedMaterials,
        exercise_scores: prev?.exercise_scores || {},
        quiz_scores: prev?.quiz_scores || {},
        overall_progress: prev?.overall_progress || 10,
        updated_at: new Date().toISOString()
      };

      // Persist to Dexie
      const rec: CourseProgressRecord = {
        id: newProgress.id,
        courseId,
        userId: studentId,
        completedMaterials: updatedMaterials,
        exerciseScores: newProgress.exercise_scores,
        quizScores: newProgress.quiz_scores,
        overallProgress: newProgress.overall_progress,
        updatedAt: Date.now()
      };
      saveCourseProgressLocal(rec).catch(() => {});

      return newProgress;
    });
  };

  // Exercise completed callback
  const handleExerciseCompleted = (exerciseId: string, finalScore: number) => {
    const studentId = student?.id || 'EXA-001';
    setProgress((prev) => {
      const updatedScores = {
        ...(prev?.exercise_scores || {}),
        [exerciseId]: finalScore
      };

      const newProgress: UserCourseProgress = {
        id: prev?.id || `${courseId}_${studentId}`,
        user_id: studentId,
        course_id: courseId,
        completed_materials: prev?.completed_materials || [],
        exercise_scores: updatedScores,
        quiz_scores: prev?.quiz_scores || {},
        overall_progress: Math.min(100, (prev?.overall_progress || 10) + 15),
        updated_at: new Date().toISOString()
      };

      const rec: CourseProgressRecord = {
        id: newProgress.id,
        courseId,
        userId: studentId,
        completedMaterials: newProgress.completed_materials,
        exerciseScores: updatedScores,
        quizScores: newProgress.quiz_scores,
        overallProgress: newProgress.overall_progress,
        updatedAt: Date.now()
      };
      saveCourseProgressLocal(rec).catch(() => {});

      return newProgress;
    });
  };

  // Quiz passed callback
  const handleQuizPassed = (quizId: string, finalScore: number) => {
    const studentId = student?.id || 'EXA-001';
    setProgress((prev) => {
      const updatedQuizScores = {
        ...(prev?.quiz_scores || {}),
        [quizId]: finalScore
      };

      const newProgress: UserCourseProgress = {
        id: prev?.id || `${courseId}_${studentId}`,
        user_id: studentId,
        course_id: courseId,
        completed_materials: prev?.completed_materials || [],
        exercise_scores: prev?.exercise_scores || {},
        quiz_scores: updatedQuizScores,
        overall_progress: Math.min(100, (prev?.overall_progress || 10) + 25),
        updated_at: new Date().toISOString()
      };

      const rec: CourseProgressRecord = {
        id: newProgress.id,
        courseId,
        userId: studentId,
        completedMaterials: newProgress.completed_materials,
        exerciseScores: newProgress.exercise_scores,
        quizScores: updatedQuizScores,
        overallProgress: newProgress.overall_progress,
        updatedAt: Date.now()
      };
      saveCourseProgressLocal(rec).catch(() => {});

      return newProgress;
    });
  };

  // SubChapter Navigation Handler
  const handleSelectSubChapter = (targetSubChapterId: string) => {
    startTransition(() => {
      router.push(`/course/${courseId}/learn/${targetSubChapterId}`);
    });
  };

  // Next SubChapter Trigger
  const handleNextSubChapter = () => {
    if (!course?.categories) return;
    const allSubChapters: CourseSubChapter[] = [];
    course.categories.forEach((cat) => {
      (cat.chapters || []).forEach((chap) => {
        (chap.subchapters || []).forEach((sub) => {
          allSubChapters.push(sub);
        });
      });
    });

    const currentIdx = allSubChapters.findIndex((s) => s.id === subChapterId);
    if (currentIdx !== -1 && currentIdx < allSubChapters.length - 1) {
      const nextSub = allSubChapters[currentIdx + 1];
      router.push(`/course/${courseId}/learn/${nextSub.id}`);
    } else {
      router.push(`/course/${courseId}`);
    }
  };

  // Guard: Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs text-muted-foreground font-medium">Memuat Studio Belajar...</span>
        </div>
      </div>
    );
  }

  // Guard: Course or SubChapter Not Found
  if (!course || !activeSubChapter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground space-y-4">
        <Card className="p-8 max-w-md w-full text-center space-y-4 rounded-2xl border-border/70">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-foreground">Sub-bab Tidak Ditemukan</h2>
            <p className="text-xs text-muted-foreground">
              Modul kurikulum dengan ID <span className="font-mono font-semibold">"{subChapterId}"</span> tidak tersedia dalam kursus ini.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/course/${courseId}`)}
              className="text-xs rounded-lg"
            >
              Kembali ke Silabus
            </Button>
            <Button
              size="sm"
              onClick={() => router.push('/course')}
              className="text-xs rounded-lg"
            >
              Katalog Kursus
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Generate fallback sample questions if exercise has none embedded
  const sampleExerciseQuestions: Question[] = [
    {
      id: `q-ex-${subChapterId}-1`,
      type: 'MCQ',
      body: [
        {
          type: 'text',
          content: `Tentukan komponen atau karakteristik utama yang berkaitan dengan materi: **${activeSubChapter.title}**!`
        }
      ],
      options: [
        { key: 'A', body: [{ type: 'text', content: 'Memenuhi prinsip ortogonalitas dan panjang satuan pada ruang Euclid.' }] },
        { key: 'B', body: [{ type: 'text', content: 'Hanya berlaku pada ruang satu dimensi.' }] },
        { key: 'C', body: [{ type: 'text', content: 'Menghasilkan skalar negatif tanpa arah yang valid.' }] },
        { key: 'D', body: [{ type: 'text', content: 'Tidak dapat direpresentasikan secara analitis.' }] }
      ],
      correctAnswer: 'A',
      discussion: [
        {
          type: 'text',
          content: `Konsep dasar pada modul ini berakar pada struktur aljabar vektor dan ruang Euclid dimensi tiga.`
        }
      ],
      tips: [
        {
          type: 'THEORY',
          content: [{ type: 'text', content: 'Tinjau kembali definisi ruang Euclid dan basis ortonormal standar.' }]
        },
        {
          type: 'PRACTICE',
          content: [{ type: 'text', content: 'Gunakan sifat dasar perkalian titik dan panjang vektor.' }]
        }
      ]
    }
  ];

  const sampleQuizQuestions: Question[] = [
    {
      id: `q-quiz-${subChapterId}-1`,
      type: 'MCQ',
      body: [
        {
          type: 'text',
          content: `Berdasarkan pembelajaran pada sub-bab ini, pernyataan manakah yang benar secara matematis?`
        }
      ],
      options: [
        { key: 'A', body: [{ type: 'text', content: 'Dua vektor tak-nol saling tegak lurus jika perkalian skalarnya sama dengan nol.' }] },
        { key: 'B', body: [{ type: 'text', content: 'Perkalian silang selalu bersifat komutatif.' }] },
        { key: 'C', body: [{ type: 'text', content: 'Panjang vektor dapat bernilai negatif pada ruang dimensi tiga.' }] },
        { key: 'D', body: [{ type: 'text', content: 'Vektor posisi tidak memiliki titik tangkap di pusat koordinat.' }] }
      ],
      correctAnswer: 'A',
      discussion: [
        {
          type: 'text',
          content: `Dua vektor tegak lurus jika dan hanya jika $\\vec{u} \\cdot \\vec{v} = 0$.`
        }
      ]
    }
  ];

  // Enriched exercise & quiz instances with fallback questions
  const enrichedExercise: CourseExercise = activeExercise
    ? {
        ...activeExercise,
        questions: activeExercise.questions?.length ? activeExercise.questions : sampleExerciseQuestions
      }
    : {
        id: `ex-${subChapterId}-default`,
        subchapter_id: subChapterId,
        title: `Latihan Mandiri: ${activeSubChapter.title}`,
        material_content: activeMaterial?.content,
        question_ids: [`q-ex-${subChapterId}-1`],
        questions: sampleExerciseQuestions,
        order_index: 1
      };

  const enrichedQuiz: CourseQuiz = activeQuiz
    ? {
        ...activeQuiz,
        questions: activeQuiz.questions?.length ? activeQuiz.questions : sampleQuizQuestions
      }
    : {
        id: `quiz-${subChapterId}-default`,
        subchapter_id: subChapterId,
        title: `Kuis Uji Pemahaman: ${activeSubChapter.title}`,
        question_ids: [`q-quiz-${subChapterId}-1`],
        questions: sampleQuizQuestions,
        passing_score: 70,
        order_index: 1
      };

  return (
    <AnimeBox
      preset="page"
      className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden select-none"
    >
      {/* 1. TOP COMMAND BAR 56px (h-14) */}
      <CourseCommandBar
        courseTitle={course.title}
        courseId={course.id}
        categoryTitle={activeCategory?.title}
        chapterTitle={activeChapter?.title}
        subChapterTitle={activeSubChapter.title}
        masteryPercentage={subChapterMastery}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        backHref={`/course/${course.id}`}
        rightSlot={
          <div className="hidden lg:flex items-center gap-1.5 bg-muted/30 border border-border/60 rounded-xl p-1">
            <Button
              type="button"
              variant={practiceMode === 'openbook' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPracticeMode('openbook')}
              className={cn(
                'h-7 px-2.5 text-xs font-semibold rounded-lg transition-all',
                practiceMode === 'openbook' ? 'shadow-2xs' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Sparkles className="size-3 mr-1 text-amber-500" />
              <span>Latihan Mandiri</span>
            </Button>
            <Button
              type="button"
              variant={practiceMode === 'quiz' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPracticeMode('quiz')}
              className={cn(
                'h-7 px-2.5 text-xs font-semibold rounded-lg transition-all',
                practiceMode === 'quiz' ? 'shadow-2xs' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Award className="size-3 mr-1 text-emerald-500" />
              <span>Kuis Evaluasi</span>
            </Button>
          </div>
        }
      />

      {/* 2. MOBILE SEGMENTED TAB SWITCHER (< 1024px) */}
      <div className="lg:hidden h-11 border-b border-border/70 bg-card/95 px-3 flex items-center justify-between gap-2 shrink-0 z-20">
        <div className="flex items-center gap-1 w-full bg-muted/50 p-1 rounded-xl border border-border/60">
          <button
            type="button"
            onClick={() => setMobileTab('theory')}
            className={cn(
              'flex-1 h-8 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer',
              mobileTab === 'theory'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <BookOpen className="size-3.5 text-primary" />
            <span>Materi Teori</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('practice')}
            className={cn(
              'flex-1 h-8 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer',
              mobileTab === 'practice'
                ? 'bg-background text-foreground shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Sparkles className="size-3.5 text-amber-500" />
            <span>Latihan Mandiri</span>
          </button>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative" ref={containerRef}>
        {/* Left Drawer: Curriculum Tree Sidebar */}
        {sidebarOpen && (
          <div className="shrink-0 h-full border-r border-border/80 z-20 bg-background">
            <CurriculumTreeSidebar
              categories={course.categories || []}
              progress={progress}
              activeSubChapterId={subChapterId}
              onSelectSubChapter={handleSelectSubChapter}
              isCollapsedDefault={false}
              className="h-full"
            />
          </div>
        )}

        {/* 4. SPLIT-VIEW STUDIO WORKSPACE */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 min-w-0 overflow-hidden bg-background">
          {/* PANEL KIRI: MATERI TEORI */}
          <section
            style={{
              width: splitRatio === 100 ? '100%' : `${splitRatio}%`
            }}
            className={cn(
              'h-full flex flex-col min-h-0 min-w-0 border-r border-border/80 overflow-hidden transition-[width] duration-75',
              'hidden lg:flex', // Desktop default: visible based on splitRatio
              mobileTab === 'theory' && '!flex !w-full' // Mobile view override
            )}
          >
            {activeMaterial ? (
              <TheoryCanvas
                courseId={course.id}
                materialId={activeMaterial.id}
                userId={student?.id || 'EXA-001'}
                title={activeMaterial.title}
                markdownContent={activeMaterial.content}
                estimatedMinutes={activeMaterial.estimated_read_minutes || 10}
                initialCompleted={progress?.completed_materials.includes(activeMaterial.id)}
                onMarkCompleted={handleMaterialCompleted}
                className="h-full"
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-2">
                <FileText className="size-8 stroke-[1.5] text-muted-foreground/60" />
                <h3 className="text-sm font-semibold text-foreground">Ringkasan Konsep Dasar</h3>
                <p className="text-xs max-w-sm">
                  Materi pengantar untuk sub-bab <span className="font-semibold">{activeSubChapter.title}</span> sedang dipersiapkan. Silakan lanjutkan ke modul latihan.
                </p>
              </div>
            )}
          </section>

          {/* DESKTOP RESIZABLE SPLITTER (Only on lg: screens and when not in Zen 100:0 mode) */}
          <div className="hidden lg:flex h-full">
            <ResizableSplitter
              splitRatio={splitRatio}
              onRatioChange={(newRatio) => setSplitRatio(newRatio)}
              minRatio={20}
              maxRatio={85}
              containerRef={containerRef}
            />
          </div>

          {/* PANEL KANAN: STUDIO LATIHAN & KUIS */}
          {splitRatio < 100 && (
            <section
              style={{
                width: `${100 - splitRatio}%`
              }}
              className={cn(
                'h-full flex flex-col min-h-0 min-w-0 bg-background overflow-hidden transition-[width] duration-75',
                'hidden lg:flex', // Desktop default: visible based on remaining ratio
                mobileTab === 'practice' && '!flex !w-full' // Mobile view override
              )}
            >
              {/* Practice / Quiz Sub-Header for Mobile & Quick Toggling */}
              <div className="h-10 px-4 border-b border-border/60 bg-muted/30 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  {practiceMode === 'openbook' ? (
                    <>
                      <Sparkles className="size-3.5 text-amber-500" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Latihan Mandiri (Open-Book)
                      </span>
                    </>
                  ) : (
                    <>
                      <Award className="size-3.5 text-emerald-500" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Kuis Evaluasi Sub-Bab
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPracticeMode((prev) => (prev === 'openbook' ? 'quiz' : 'openbook'))}
                    className="h-6 px-2 text-[11px] font-semibold text-primary hover:bg-primary/10 rounded-md"
                  >
                    {practiceMode === 'openbook' ? 'Buka Kuis' : 'Buka Latihan'}
                  </Button>
                </div>
              </div>

              {/* Viewport Content: OpenBookStudio vs QuizAssessment */}
              <div className="flex-1 min-h-0 overflow-hidden">
                {practiceMode === 'openbook' ? (
                  <OpenBookStudio
                    courseId={course.id}
                    userId={student?.id || 'EXA-001'}
                    exercise={enrichedExercise}
                    guideMarkdown={activeMaterial?.content}
                    onComplete={handleExerciseCompleted}
                    className="h-full"
                  />
                ) : (
                  <QuizAssessment
                    courseId={course.id}
                    userId={student?.id || 'EXA-001'}
                    subchapterId={activeSubChapter.id}
                    quiz={enrichedQuiz}
                    onPassed={handleQuizPassed}
                    onNextSubChapter={handleNextSubChapter}
                    className="h-full"
                  />
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </AnimeBox>
  );
}
