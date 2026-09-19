'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import type { CourseExercise, Question } from '@/lib/types';
import { parseMarkdown } from '@/lib/parser';
import { enqueueCourseDelta } from '@/lib/db';
import { ActivePracticeCanvas } from './ActivePracticeCanvas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FileText,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';

export interface OpenBookStudioProps {
  courseId: string;
  userId: string;
  exercise: CourseExercise;
  guideMarkdown?: string;
  onComplete?: (exerciseId: string, finalScore: number) => void;
  className?: string;
}

export function OpenBookStudio({
  courseId,
  userId,
  exercise,
  guideMarkdown,
  onComplete,
  className,
}: OpenBookStudioProps) {
  const [, startTransition] = useTransition();

  // Parse questions from raw markdown if provided, or fallback to exercise.questions
  const questions: Question[] = useMemo(() => {
    if (exercise.questions && exercise.questions.length > 0) {
      return exercise.questions;
    }
    if (exercise.material_content) {
      return parseMarkdown(exercise.material_content);
    }
    return [];
  }, [exercise]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittedStatus, setSubmittedStatus] = useState<Record<string, boolean>>({});

  // Active guide content: exercise guide or fallback material_content
  const activeGuide = guideMarkdown || exercise.material_content || '';

  const activeQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  // Calculate real-time summary statistics
  const answeredCount = Object.keys(answers).length;
  const gradedCount = Object.keys(submittedStatus).length;
  const correctCount = useMemo(() => {
    return questions.filter((q) => {
      const ans = answers[String(q.id)];
      return submittedStatus[String(q.id)] && ans === q.correctAnswer;
    }).length;
  }, [questions, answers, submittedStatus]);

  // Handle single question selection
  const handleSelectAnswer = (qId: string | number, answerKey: string) => {
    setAnswers((prev) => ({
      ...prev,
      [String(qId)]: answerKey,
    }));
  };

  // Handle single question submission & sync to Dexie
  const handleSubmitAnswer = async (
    qId: string | number,
    answerKey: string,
    isCorrect: boolean
  ) => {
    setSubmittedStatus((prev) => ({
      ...prev,
      [String(qId)]: true,
    }));

    // Save delta answer to Dexie.js for resilient offline-first persistence
    try {
      await enqueueCourseDelta({
        courseId,
        userId,
        entityType: 'EXERCISE_ANSWER',
        entityId: `${exercise.id}_${qId}`,
        timestamp: Date.now(),
        payload: {
          exerciseId: exercise.id,
          questionId: String(qId),
          selectedAnswer: answerKey,
          isCorrect,
          answeredAt: new Date().toISOString(),
        },
      });
    } catch {
      // Offline fallback: keep local session state intact
    }
  };

  // Keyboard navigation & tactile shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not capture shortcuts when user is typing in form inputs
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
      } else if (['a', 'b', 'c', 'd', 'e'].includes(e.key.toLowerCase())) {
        if (activeQuestion && !submittedStatus[String(activeQuestion.id)]) {
          handleSelectAnswer(activeQuestion.id, e.key.toUpperCase());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeQuestion, totalQuestions, submittedStatus]);

  const handleFinishExercise = () => {
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
    onComplete?.(exercise.id, score);
  };

  return (
    <div className={cn('flex flex-col h-screen w-full bg-background overflow-hidden', className)}>
      {/* Unified Studio Command Bar (56px) */}
      <header className="h-14 border-b border-border/80 bg-card/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-10 select-none">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="truncate">
            <h1 className="text-sm font-semibold text-foreground truncate">
              {exercise.title || 'Studio Latihan Open-Book'}
            </h1>
            <p className="text-[11px] text-muted-foreground truncate">
              Model Asesmen Terbuka & Panduan Mandiri
            </p>
          </div>
        </div>

        {/* Real-time KPI Status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-muted/50 border border-border/70 text-xs">
            <span className="text-muted-foreground font-medium">Tuntas Dinilai:</span>
            <span className="font-semibold text-foreground">
              {gradedCount} / {totalQuestions}
            </span>
            <Separator orientation="vertical" className="h-3 mx-0.5" />
            <span className="text-muted-foreground font-medium">Akurasi:</span>
            <span className="font-semibold text-emerald-600">
              {gradedCount > 0 ? Math.round((correctCount / gradedCount) * 100) : 0}%
            </span>
          </div>

          {gradedCount === totalQuestions && totalQuestions > 0 && (
            <Button
              size="sm"
              onClick={handleFinishExercise}
              className="text-xs font-semibold h-8 px-3 gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Selesai Latihan</span>
            </Button>
          )}
        </div>
      </header>

      {/* Split Studio Main Content: Desktop 2-Column Split */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Kolom Kiri: Panel Materi Pengantar / Panduan Rujukan (45%) */}
        <section className="w-full lg:w-[45%] h-1/2 lg:h-full border-b lg:border-b-0 lg:border-r border-border/80 flex flex-col min-h-0 bg-muted/15">
          <div className="h-10 px-4 border-b border-border/60 bg-muted/30 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Materi Rujukan & Panduan Teori
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] h-5 border-border/60 font-medium">
              Open-Book Reference
            </Badge>
          </div>

          <ScrollArea className="flex-1 p-5 sm:p-6">
            {activeGuide ? (
              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-wrap font-normal">
                {activeGuide}
              </div>
            ) : (
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2">
                <Layers className="w-8 h-8 stroke-[1.5] text-muted-foreground/60" />
                <p className="text-sm font-medium">Materi panduan tidak disertakan pada modul ini.</p>
                <p className="text-xs text-muted-foreground/80">
                  Gunakan pengetahuan konsep mandiri atau buka tombol petunjuk di panel latihan.
                </p>
              </div>
            )}
          </ScrollArea>
        </section>

        {/* Kolom Kanan: Kanvas Latihan Interaktif (55%) */}
        <section className="w-full lg:w-[55%] h-1/2 lg:h-full flex flex-col min-h-0 bg-background">
          {/* Top Question Matrix Bar */}
          <div className="h-11 px-4 border-b border-border/60 bg-card flex items-center justify-between gap-3 shrink-0">
            {/* Horizontal Question Index Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {questions.map((q, idx) => {
                const isSelected = idx === currentIndex;
                const isAnswered = !!answers[String(q.id)];
                const isGraded = !!submittedStatus[String(q.id)];
                const isCorrect = isGraded && answers[String(q.id)] === q.correctAnswer;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      'w-7 h-7 rounded-md text-xs font-semibold flex items-center justify-center transition-all shrink-0 border',
                      isSelected && 'ring-2 ring-primary ring-offset-1',
                      isGraded
                        ? isCorrect
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-rose-600 text-white border-rose-600'
                        : isAnswered
                        ? 'bg-primary/15 text-primary border-primary/40'
                        : 'bg-muted/40 text-muted-foreground border-border/70 hover:bg-muted'
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs font-semibold px-1 text-muted-foreground">
                {currentIndex + 1}/{Math.max(1, totalQuestions)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={currentIndex >= totalQuestions - 1}
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Question Viewport */}
          <ScrollArea className="flex-1 p-5 sm:p-6">
            {activeQuestion ? (
              <div className="max-w-2xl mx-auto pb-8">
                <ActivePracticeCanvas
                  key={activeQuestion.id}
                  question={activeQuestion}
                  questionNumber={currentIndex + 1}
                  totalQuestions={totalQuestions}
                  selectedAnswer={answers[String(activeQuestion.id)]}
                  onSelectAnswer={handleSelectAnswer}
                  onSubmitAnswer={handleSubmitAnswer}
                  submitted={!!submittedStatus[String(activeQuestion.id)]}
                />
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 text-muted-foreground space-y-3">
                <Sparkles className="w-8 h-8 stroke-[1.5] text-muted-foreground/60" />
                <p className="text-sm font-medium">Belum ada butir soal dalam latihan ini.</p>
              </div>
            )}
          </ScrollArea>
        </section>
      </div>
    </div>
  );
}
