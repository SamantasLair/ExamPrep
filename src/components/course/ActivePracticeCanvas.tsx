'use client';

import { useState, useTransition } from 'react';
import type { Question } from '@/lib/types';
import { ContentBlockList } from '@/components/exam/ContentBlockRenderer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Lightbulb,
  BookOpen,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronDown,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export interface ActivePracticeCanvasProps {
  question: Question;
  questionNumber?: number;
  totalQuestions?: number;
  selectedAnswer?: string;
  onSelectAnswer: (questionId: string | number, answerKey: string) => void;
  onSubmitAnswer?: (questionId: string | number, answerKey: string, isCorrect: boolean) => void;
  submitted?: boolean;
  disabled?: boolean;
}

export function ActivePracticeCanvas({
  question,
  questionNumber = 1,
  totalQuestions = 1,
  selectedAnswer,
  onSelectAnswer,
  onSubmitAnswer,
  submitted = false,
  disabled = false,
}: ActivePracticeCanvasProps) {
  const [, startTransition] = useTransition();
  // Progressive Hint Disclosure level: 0 = none, 1 = concept (theory), 2 = related formula/practice
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [showDiscussionManual, setShowDiscussionManual] = useState<boolean>(false);

  const isGraded = submitted;
  const isCorrect = isGraded && selectedAnswer === question.correctAnswer;
  const isWrong = isGraded && !!selectedAnswer && selectedAnswer !== question.correctAnswer;

  const theoryTips = (question.tips || []).filter((t) => t.type === 'THEORY');
  const practiceTips = (question.tips || []).filter((t) => t.type === 'PRACTICE');

  const maxHintLevel = (theoryTips.length > 0 ? 1 : 0) + (practiceTips.length > 0 ? 1 : 0);

  const handleSelect = (key: string) => {
    if (disabled || isGraded) return;
    startTransition(() => {
      onSelectAnswer(question.id, key);
    });
  };

  const handleRevealNextHint = () => {
    setHintLevel((prev) => Math.min(prev + 1, 2));
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswer || isGraded) return;
    const correct = selectedAnswer === question.correctAnswer;
    onSubmitAnswer?.(question.id, selectedAnswer, correct);
  };

  return (
    <div className="space-y-6">
      {/* Header Soal */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 border-border/80">
            Latihan {questionNumber} / {totalQuestions}
          </Badge>
          <span className="text-xs text-muted-foreground font-medium">
            {question.type === 'MCQ' ? 'Pilihan Ganda' : 'Pertanyaan Terbuka'}
          </span>
        </div>

        {isGraded && (
          <Badge
            variant={isCorrect ? 'default' : 'destructive'}
            className={cn(
              'text-xs font-semibold px-2.5 py-0.5 transition-all animate-in fade-in zoom-in-95',
              isCorrect ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'
            )}
          >
            {isCorrect ? 'Jawaban Tepat' : 'Belum Tepat'}
          </Badge>
        )}
      </div>

      {/* Stimulus Context if Present */}
      {question.stimulus_content && (
        <div className="p-4 rounded-xl bg-muted/40 border border-border/70 text-sm text-foreground/90 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span>Konteks Soal</span>
          </div>
          <p className="leading-relaxed whitespace-pre-wrap">{question.stimulus_content}</p>
        </div>
      )}

      {/* Question Body */}
      <div className="space-y-3">
        <div className="text-base sm:text-lg font-medium leading-relaxed text-foreground">
          <ContentBlockList blocks={question.body} />
        </div>
      </div>

      {/* MCQ Options with Tactile Keycaps */}
      {question.type === 'MCQ' && question.options && (
        <div className="space-y-3 pt-1">
          {question.options.map((opt) => {
            const isThisSelected = selectedAnswer === opt.key;
            const isThisCorrect = isGraded && opt.key === question.correctAnswer;
            const isThisWrongPick = isGraded && isThisSelected && !isThisCorrect;

            return (
              <div
                key={opt.key}
                onClick={() => handleSelect(opt.key)}
                className={cn(
                  'group relative flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border transition-all duration-150 select-none text-sm',
                  !disabled && !isGraded && 'cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-muted/30',
                  isThisSelected && !isGraded && 'border-primary bg-primary/[0.04] ring-1 ring-primary/25 shadow-2xs',
                  isThisCorrect && 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/25 shadow-2xs',
                  isThisWrongPick && 'border-rose-500 bg-rose-500/10 ring-1 ring-rose-500/25 shadow-2xs',
                  !isThisSelected && !isThisCorrect && !isThisWrongPick && 'border-border/70 bg-card',
                  (disabled || isGraded) && 'cursor-default'
                )}
              >
                {/* Tactile Keycap Badge */}
                <div
                  className={cn(
                    'w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center shrink-0 border transition-all mt-0.5 shadow-2xs',
                    isThisSelected && !isGraded && 'bg-primary text-primary-foreground border-primary scale-105',
                    isThisCorrect && 'bg-emerald-600 text-white border-emerald-600 scale-105',
                    isThisWrongPick && 'bg-rose-600 text-white border-rose-600',
                    !isThisSelected && !isThisCorrect && !isThisWrongPick && 'bg-muted/60 text-muted-foreground border-border/80 group-hover:border-zinc-400 group-hover:text-foreground'
                  )}
                >
                  {opt.key}
                </div>

                {/* Option Text */}
                <div className="flex-1 text-sm font-normal leading-relaxed text-foreground/90 pt-0.5">
                  <ContentBlockList blocks={opt.body} />
                </div>

                {/* Status Indicator */}
                <div className="shrink-0 flex items-center justify-center pt-0.5">
                  {isThisCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  {isThisWrongPick && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Bar: Check Answer & Progressive Hint Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {maxHintLevel > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRevealNextHint}
              disabled={hintLevel >= maxHintLevel}
              className="text-xs font-medium border-border/80 gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              {hintLevel === 0
                ? 'Buka Petunjuk'
                : hintLevel === 1 && maxHintLevel > 1
                ? 'Buka Petunjuk Rumus'
                : 'Petunjuk Terbuka'}
            </Button>
          )}

          {isGraded && question.discussion && question.discussion.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDiscussionManual((prev) => !prev)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              {showDiscussionManual ? 'Tutup Pembahasan' : 'Lihat Pembahasan'}
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showDiscussionManual && 'rotate-180')} />
            </Button>
          )}
        </div>

        {!isGraded && (
          <Button
            type="button"
            size="sm"
            onClick={handleCheckAnswer}
            disabled={!selectedAnswer || disabled}
            className="text-xs font-semibold px-4 gap-1.5 shadow-2xs"
          >
            <span>Cek Jawaban</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* Progressive Hint Disclosure Panels */}
      {hintLevel > 0 && (
        <div className="space-y-3 pt-1">
          {/* Level 1: Konsep Dasar / Teori */}
          {hintLevel >= 1 && theoryTips.length > 0 && (
            <Card className="border-blue-200/80 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 shadow-none">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  <Lightbulb className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Petunjuk 1: Landasan Konsep</span>
                </div>
                <div className="text-sm text-foreground/90 leading-relaxed">
                  {theoryTips.map((tip, idx) => (
                    <ContentBlockList key={idx} blocks={tip.content} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Level 2: Rumus Terkait / Praktik */}
          {hintLevel >= 2 && practiceTips.length > 0 && (
            <Card className="border-amber-200/80 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 shadow-none">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Petunjuk 2: Rumus & Strategi Solusi</span>
                </div>
                <div className="text-sm text-foreground/90 leading-relaxed">
                  {practiceTips.map((tip, idx) => (
                    <ContentBlockList key={idx} blocks={tip.content} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Instant Feedback: Pembahasan Lengkap */}
      {(isGraded || showDiscussionManual) && question.discussion && question.discussion.length > 0 && (
        <Card className="border-border/80 bg-muted/40 shadow-none animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CardContent className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Pembahasan Detail & Kunci Jawaban
                </span>
              </div>
              {question.correctAnswer && (
                <Badge variant="outline" className="text-xs font-semibold border-primary/40 text-primary">
                  Kunci: {question.correctAnswer}
                </Badge>
              )}
            </div>
            <div className="text-sm leading-relaxed text-foreground/95">
              <ContentBlockList blocks={question.discussion} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
