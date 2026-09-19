'use client';

import React, { useState, useMemo, useEffect, useCallback, useTransition } from 'react';
import type { CourseQuiz, Question } from '@/lib/types';
import { parseMarkdownQuestion } from '@/lib/parser';
import { enqueueCourseDelta } from '@/lib/db';
import { batchSyncManager } from '@/lib/batchSyncManager';
import { ContentBlockList } from '@/components/exam/ContentBlockRenderer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Award,
  ArrowRight,
  Send,
  Sparkles,
} from 'lucide-react';

export type MasteryRating = 'Novice' | 'Competent' | 'Proficient' | 'Master';

export function getMasteryRating(score: number): MasteryRating {
  if (score >= 90) return 'Master';
  if (score >= 70) return 'Proficient';
  if (score >= 50) return 'Competent';
  return 'Novice';
}

export function getMasteryBadgeClass(rating: MasteryRating): string {
  switch (rating) {
    case 'Master':
      return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30';
    case 'Proficient':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
    case 'Competent':
      return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
    case 'Novice':
    default:
      return 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/30';
  }
}

export interface QuizAssessmentProps {
  courseId: string;
  userId: string;
  subchapterId?: string;
  quiz: CourseQuiz;
  rawMarkdown?: string;
  onPassed?: (quizId: string, score: number) => void;
  onNextSubChapter?: () => void;
  onRetry?: () => void;
  className?: string;
}

export function QuizAssessment({
  courseId,
  userId,
  subchapterId,
  quiz,
  rawMarkdown,
  onPassed,
  onNextSubChapter,
  onRetry,
  className,
}: QuizAssessmentProps) {
  const [, startTransition] = useTransition();

  // Parse questions from raw markdown if provided, or fallback to quiz.questions
  const questions: Question[] = useMemo(() => {
    if (quiz.questions && quiz.questions.length > 0) {
      return quiz.questions;
    }
    if (rawMarkdown) {
      return parseMarkdownQuestion(rawMarkdown);
    }
    return [];
  }, [quiz, rawMarkdown]);

  const totalQuestions = questions.length;
  const passingScore = quiz.passing_score ?? 70;

  // Navigation & Answers state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEvaluated, setIsEvaluated] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    correctCount: number;
    passed: boolean;
    rating: MasteryRating;
  } | null>(null);

  const activeQuestion: Question | undefined = questions[currentIndex];
  const activeAnswer = activeQuestion ? answers[String(activeQuestion.id)] : undefined;

  // Counts
  const answeredCount = useMemo(() => {
    return Object.keys(answers).filter((k) => answers[k] !== undefined && answers[k] !== '').length;
  }, [answers]);

  const progressPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // Handle Answer Selection
  const handleSelectAnswer = useCallback(
    (questionId: string | number, answerKey: string) => {
      if (isEvaluated) return;
      startTransition(() => {
        setAnswers((prev) => ({
          ...prev,
          [String(questionId)]: answerKey,
        }));
      });
    },
    [isEvaluated]
  );

  // Keyboard navigation & tactile shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
      } else if (['a', 'b', 'c', 'd', 'e'].includes(e.key.toLowerCase())) {
        if (activeQuestion && !isEvaluated) {
          handleSelectAnswer(activeQuestion.id, e.key.toUpperCase());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeQuestion, totalQuestions, isEvaluated, handleSelectAnswer]);

  // Execute Submission & Evaluation
  const handleConfirmSubmit = async () => {
    setIsSubmitDialogOpen(false);
    setIsSubmitting(true);

    let correctCount = 0;
    for (const q of questions) {
      const userAns = answers[String(q.id)];
      if (userAns && userAns === q.correctAnswer) {
        correctCount++;
      }
    }

    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = score >= passingScore;
    const rating = getMasteryRating(score);

    const result = {
      score,
      correctCount,
      passed,
      rating,
    };

    setEvaluationResult(result);
    setIsEvaluated(true);

    try {
      // 1. Enqueue to Dexie IndexedDB
      await enqueueCourseDelta({
        courseId,
        userId,
        entityType: 'QUIZ_SUBMIT',
        entityId: quiz.id,
        timestamp: Date.now(),
        payload: {
          quizId: quiz.id,
          subchapterId,
          score,
          correctCount,
          totalQuestions,
          passed,
          rating,
          answers,
          submittedAt: new Date().toISOString(),
        },
      });

      // 2. Immediate synchronization to Supabase via batchSyncManager
      await batchSyncManager.syncCourseMilestone(courseId, userId);
    } catch (err) {
      console.warn('[QuizAssessment] Offline fallback persisted, sync will retry in background:', err);
    } finally {
      setIsSubmitting(false);
      if (passed) {
        onPassed?.(quiz.id, score);
      }
    }
  };

  // Reset/Retry Quiz
  const handleRetryQuiz = () => {
    setAnswers({});
    setIsEvaluated(false);
    setEvaluationResult(null);
    setCurrentIndex(0);
    onRetry?.();
  };

  // If evaluated, show Evaluation Result Gate View
  if (isEvaluated && evaluationResult) {
    const { score, correctCount, passed, rating } = evaluationResult;
    const ratingBadgeClass = getMasteryBadgeClass(rating);

    return (
      <div className={cn('max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6 animate-in fade-in duration-200', className)}>
        {/* Result Header Card */}
        <Card className="border-border/80 shadow-sm overflow-hidden">
          <div
            className={cn(
              'h-2 w-full',
              passed ? 'bg-emerald-500' : 'bg-rose-500'
            )}
          />
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn('text-xs font-semibold px-2.5 py-0.5 border', ratingBadgeClass)}>
                    Mastery: {rating}
                  </Badge>
                  <Badge variant={passed ? 'default' : 'destructive'} className="text-xs font-semibold px-2.5 py-0.5">
                    {passed ? 'Sub-bab Tuntas!' : 'Belum Memenuhi Syarat'}
                  </Badge>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground pt-1">
                  Hasil Evaluasi: {quiz.title}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Batas Kelulusan: {passingScore}% (Skor Anda: {score}%)
                </p>
              </div>

              {/* Circular or Bold Score Box */}
              <div
                className={cn(
                  'flex flex-col items-center justify-center min-w-[90px] h-[90px] rounded-2xl border px-4 shadow-2xs',
                  passed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
                )}
              >
                <span className="text-3xl font-black tracking-tight">{score}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Skor Akhir</span>
              </div>
            </div>

            <Separator />

            {/* Score Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/70">
                <span className="text-xs text-muted-foreground font-medium block">Total Soal</span>
                <span className="text-lg font-bold text-foreground">{totalQuestions}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/70">
                <span className="text-xs text-muted-foreground font-medium block">Jawaban Benar</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{correctCount}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/70">
                <span className="text-xs text-muted-foreground font-medium block">Jawaban Salah</span>
                <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
                  {totalQuestions - correctCount}
                </span>
              </div>
            </div>

            {/* Mastery Criteria Callout */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/70 text-xs space-y-2">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <Award className="w-4 h-4 text-primary" />
                <span>Skala Penilaian Mastery:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-muted-foreground">
                <div className={cn('p-2 rounded-lg border text-center', rating === 'Novice' && 'border-primary font-semibold text-foreground bg-primary/5')}>
                  <div>Novice</div>
                  <div className="text-[11px]">&lt; 50%</div>
                </div>
                <div className={cn('p-2 rounded-lg border text-center', rating === 'Competent' && 'border-primary font-semibold text-foreground bg-primary/5')}>
                  <div>Competent</div>
                  <div className="text-[11px]">50 - 69%</div>
                </div>
                <div className={cn('p-2 rounded-lg border text-center', rating === 'Proficient' && 'border-primary font-semibold text-foreground bg-primary/5')}>
                  <div>Proficient</div>
                  <div className="text-[11px]">70 - 89%</div>
                </div>
                <div className={cn('p-2 rounded-lg border text-center', rating === 'Master' && 'border-primary font-semibold text-foreground bg-primary/5')}>
                  <div>Master</div>
                  <div className="text-[11px]">90 - 100%</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleRetryQuiz}
                className="w-full sm:w-auto text-xs font-semibold gap-2 h-9 border-border/80"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Ulangi Kuis
              </Button>
              {passed && onNextSubChapter && (
                <Button
                  type="button"
                  onClick={onNextSubChapter}
                  className="w-full sm:w-auto text-xs font-semibold gap-2 h-9 shadow-xs"
                >
                  Lanjut ke Materi Berikutnya
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Question Review List */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            Tinjauan Jawaban & Pembahasan
          </h3>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const userAns = answers[String(q.id)];
              const isCorrect = userAns === q.correctAnswer;
              const hasAnswered = !!userAns;

              return (
                <Card key={q.id} className="border-border/70">
                  <CardContent className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5">
                          Soal {idx + 1}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {q.type === 'MCQ' ? 'Pilihan Ganda' : 'Esai'}
                        </span>
                      </div>
                      <Badge
                        variant={isCorrect ? 'default' : 'destructive'}
                        className={cn(
                          'text-xs font-semibold px-2 py-0.5',
                          isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        )}
                      >
                        {isCorrect ? 'Benar' : hasAnswered ? 'Salah' : 'Tidak Dijawab'}
                      </Badge>
                    </div>

                    {/* Question Body */}
                    <div className="text-sm text-foreground/90 font-normal leading-relaxed">
                      <ContentBlockList blocks={q.body} />
                    </div>

                    {/* Options Review */}
                    {q.type === 'MCQ' && q.options && (
                      <div className="space-y-1.5 pt-1">
                        {q.options.map((opt) => {
                          const isOptCorrect = opt.key === q.correctAnswer;
                          const isOptPicked = userAns === opt.key;
                          const isWrongPick = isOptPicked && !isOptCorrect;

                          return (
                            <div
                              key={opt.key}
                              className={cn(
                                'flex items-start gap-3 p-2.5 rounded-lg border text-xs leading-relaxed transition-colors',
                                isOptCorrect && 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200',
                                isWrongPick && 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200',
                                !isOptCorrect && !isWrongPick && 'bg-card border-border/60 text-muted-foreground'
                              )}
                            >
                              <div
                                className={cn(
                                  'w-5 h-5 rounded text-[11px] font-bold flex items-center justify-center shrink-0 border mt-0.5',
                                  isOptCorrect
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : isWrongPick
                                    ? 'bg-rose-600 text-white border-rose-600'
                                    : 'bg-muted/70 text-muted-foreground border-border/80'
                                )}
                              >
                                {opt.key}
                              </div>
                              <div className="flex-1">
                                <ContentBlockList blocks={opt.body} />
                              </div>
                              <div className="shrink-0 flex items-center pt-0.5">
                                {isOptCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                {isWrongPick && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Discussion Section */}
                    {q.discussion && q.discussion.length > 0 && (
                      <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs space-y-1.5 mt-2">
                        <div className="font-semibold text-primary flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Pembahasan Soal {idx + 1}:</span>
                        </div>
                        <div className="text-muted-foreground leading-relaxed">
                          <ContentBlockList blocks={q.discussion} />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz Answering View
  return (
    <div className={cn('flex flex-col min-h-[500px] w-full max-w-4xl mx-auto space-y-6', className)}>
      {/* Quiz Assessment Command Header (56px ergonomic bar) */}
      <div className="h-14 border border-border/80 bg-card rounded-2xl px-4 sm:px-6 flex items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <HelpCircle className="w-4 h-4 text-primary" />
          </div>
          <div className="truncate">
            <h2 className="text-sm font-semibold text-foreground truncate">
              {quiz.title || 'Kuis Penentu Progres'}
            </h2>
            <p className="text-[11px] text-muted-foreground truncate">
              Batas Kelulusan: {passingScore}%
            </p>
          </div>
        </div>

        {/* Progress & Submit Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-muted/50 border border-border/70 text-xs">
            <span className="text-muted-foreground font-medium">Terjawab:</span>
            <span className="font-semibold text-foreground">
              {answeredCount} / {totalQuestions}
            </span>
          </div>

          <Button
            size="sm"
            onClick={() => setIsSubmitDialogOpen(true)}
            disabled={isSubmitting || totalQuestions === 0}
            className="text-xs font-semibold h-8 px-3 gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kumpulkan Kuis</span>
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 px-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progres Pengerjaan</span>
          <span className="font-semibold text-foreground">{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-1.5" />
      </div>

      {/* Main Cockpit Layout: Question & Question Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Active Question Canvas (8 cols on lg) */}
        <div className="lg:col-span-8">
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 sm:p-6 space-y-6">
              {activeQuestion ? (
                <>
                  {/* Question Header & Type */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 border-border/80">
                        Soal {currentIndex + 1} / {totalQuestions}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">
                        {activeQuestion.type === 'MCQ' ? 'Pilihan Ganda' : 'Pertanyaan Terbuka'}
                      </span>
                    </div>

                    {activeAnswer ? (
                      <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5">
                        Dipilih: {activeAnswer}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground px-2 py-0.5 border-dashed">
                        Belum Dijawab
                      </Badge>
                    )}
                  </div>

                  {/* Question Content */}
                  <div className="text-sm font-normal leading-relaxed text-foreground/95 max-w-[75ch]">
                    <ContentBlockList blocks={activeQuestion.body} />
                  </div>

                  {/* Multiple Choice Options with Tactile Keycaps */}
                  {activeQuestion.type === 'MCQ' && activeQuestion.options && (
                    <div className="space-y-2.5 pt-1 max-w-[75ch]">
                      {activeQuestion.options.map((opt) => {
                        const isSelected = activeAnswer === opt.key;

                        return (
                          <div
                            key={opt.key}
                            onClick={() => handleSelectAnswer(activeQuestion.id, opt.key)}
                            className={cn(
                              'group relative flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border transition-all duration-150 cursor-pointer select-none text-sm',
                              'hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-muted/30',
                              isSelected
                                ? 'border-primary bg-primary/[0.04] ring-1 ring-primary/25 shadow-2xs'
                                : 'border-border/70 bg-card'
                            )}
                          >
                            {/* Tactile Keycap Badge */}
                            <div
                              className={cn(
                                'w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center shrink-0 border transition-all mt-0.5 shadow-2xs',
                                isSelected
                                  ? 'bg-primary text-primary-foreground border-primary scale-105'
                                  : 'bg-muted/60 text-muted-foreground border-border/80 group-hover:border-zinc-400 group-hover:text-foreground'
                              )}
                            >
                              {opt.key}
                            </div>

                            {/* Option Content */}
                            <div className="flex-1 text-sm font-normal leading-relaxed text-foreground/90 pt-0.5">
                              <ContentBlockList blocks={opt.body} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Stepper Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/60">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentIndex === 0}
                      className="text-xs font-semibold gap-1.5 h-8 px-3 border-border/80"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Sebelumnya
                    </Button>

                    <span className="text-xs text-muted-foreground font-medium">
                      Navigasi Keyboard: [A - E] & [Panah Kiri/Kanan]
                    </span>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                      disabled={currentIndex >= totalQuestions - 1}
                      className="text-xs font-semibold gap-1.5 h-8 px-3 border-border/80"
                    >
                      Selanjutnya
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  Tidak ada soal yang tersedia untuk kuis ini.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Question Matrix & Cockpit Status (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <span className="text-xs font-semibold text-foreground">Daftar Soal</span>
                <span className="text-xs text-muted-foreground">
                  {answeredCount} / {totalQuestions} Terisi
                </span>
              </div>

              {/* Number Grid Matrix */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = !!answers[String(q.id)];

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={cn(
                        'h-9 rounded-lg text-xs font-semibold flex items-center justify-center border transition-all cursor-pointer select-none',
                        isCurrent && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                        isAnswered
                          ? 'bg-primary text-primary-foreground border-primary font-bold shadow-2xs'
                          : 'bg-card border-border/70 text-foreground hover:bg-muted'
                      )}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <Separator />

              {/* Information Legend */}
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary border border-primary shrink-0" />
                  <span>Sudah Terjawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-card border border-border/70 shrink-0" />
                  <span>Belum Terjawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border-2 border-primary shrink-0" />
                  <span>Posisi Saat Ini</span>
                </div>
              </div>

              <Separator />

              {/* Complete Confirmation Button */}
              <Button
                type="button"
                onClick={() => setIsSubmitDialogOpen(true)}
                disabled={isSubmitting || totalQuestions === 0}
                className="w-full text-xs font-semibold h-9 gap-2 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                Selesaikan dan Kumpulkan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog Without Close Button Trap (Safe Modal Dialog) */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-1">
              <AlertCircle className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-base font-semibold text-foreground">
              Konfirmasi Pengumpulan Kuis
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              {answeredCount < totalQuestions ? (
                <span>
                  Anda baru menjawab <strong>{answeredCount}</strong> dari <strong>{totalQuestions}</strong> soal.
                  Soal yang belum dijawab akan dihitung sebagai salah. Yakin ingin mengumpulkan sekarang?
                </span>
              ) : (
                <span>
                  Seluruh {totalQuestions} soal telah dijawab. Nilai Anda akan dihitung langsung untuk penentu
                  kelulusan bab ini.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSubmitDialogOpen(false)}
              disabled={isSubmitting}
              className="text-xs font-semibold border-border/80"
            >
              Periksa Kembali
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
              className="text-xs font-semibold gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Mengumpulkan...' : 'Ya, Kumpulkan Sekarang'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
