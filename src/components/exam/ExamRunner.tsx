'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Question } from '@/lib/types';
import { getPenaltyForTip } from '@/lib/parser';
import { QuestionRenderer } from './QuestionRenderer';
import { StimulusRenderer } from './StimulusRenderer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useVirtualizer } from '@tanstack/react-virtual';

interface ExamRunnerProps {
  questions: Question[];
  durationMinutes: number;
  examId: string;
  onSubmit: (answers: Record<string, string>, score: number, tipsUsedData: Record<string, { theory: number; practice: number }>) => void;
  immediateFeedback?: boolean;
  enableTipPenalty?: boolean;
  penaltyTheoryConfig?: string;
  penaltyPracticeConfig?: string;
}

const STORAGE_KEY_PREFIX = 'exaprep_exam_';

function getStorageKey(examId: string) {
  return `${STORAGE_KEY_PREFIX}${examId}`;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

type RenderItem = 
  | { type: 'question'; question: Question }
  | { type: 'stimulus_group'; stimulus_id: string; content: string; questions: Question[] };

export function ExamRunner({ 
  questions, durationMinutes, examId, onSubmit, immediateFeedback = false,
  enableTipPenalty = false, penaltyTheoryConfig = '', penaltyPracticeConfig = ''
}: ExamRunnerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [tipsUsed, setTipsUsed] = useState<Record<string, number[]>>({});
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submitRef = useRef<() => void>(() => {});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group consecutive questions with the same stimulus_id
  const renderItems = useMemo(() => {
    const items: RenderItem[] = [];
    let currentGroup: { type: 'stimulus_group'; stimulus_id: string; content: string; questions: Question[] } | null = null;

    for (const q of questions) {
      if (q.stimulus_id && q.stimulus_content) {
        if (currentGroup && currentGroup.stimulus_id === q.stimulus_id) {
          currentGroup.questions.push(q);
        } else {
          currentGroup = { type: 'stimulus_group', stimulus_id: q.stimulus_id, content: q.stimulus_content, questions: [q] };
          items.push(currentGroup);
        }
      } else {
        currentGroup = null;
        items.push({ type: 'question', question: q });
      }
    }
    return items;
  }, [questions]);

  const virtualizer = useVirtualizer({
    count: renderItems.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 300, // Estimated pixel height per item
    overscan: 3, // Render a few items outside viewport to prevent flickering
  });

  const calculateScore = useCallback(() => {
    const mcqs = questions.filter((q) => q.type === 'MCQ');
    if (mcqs.length === 0) return 0;
    
    let totalCorrect = 0;

    for (const q of mcqs) {
      if (answers[q.id] === q.correctAnswer) {
        totalCorrect += 1;
        if (enableTipPenalty && tipsUsed[q.id]) {
           let qPenalty = 0;
           tipsUsed[q.id].forEach(idx => {
             const tip = q.tips?.[idx];
             if (tip) {
                const sameTypeTips = q.tips!.filter(t => t.type === tip.type);
                const myTypeIndex = sameTypeTips.indexOf(tip) + 1;
                qPenalty += getPenaltyForTip(
                  tip.type === 'THEORY' ? penaltyTheoryConfig : penaltyPracticeConfig,
                  myTypeIndex
                );
             }
           });
           const questionValue = 1 * Math.max(0, (100 - qPenalty) / 100);
           totalCorrect = totalCorrect - 1 + questionValue; 
        }
      }
    }
    
    return Math.round((totalCorrect / mcqs.length) * 100);
  }, [questions, answers, enableTipPenalty, tipsUsed, penaltyTheoryConfig, penaltyPracticeConfig]);

  const handleSubmit = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const score = calculateScore();
    
    const tipsUsedObj: Record<string, { theory: number; practice: number }> = {};
    for (const qId of Object.keys(tipsUsed)) {
      const q = questions.find(x => x.id.toString() === qId);
      if (q && q.tips) {
         let t = 0, p = 0;
         tipsUsed[qId].forEach(idx => {
            if (q.tips![idx].type === 'THEORY') t++;
            else p++;
         });
         tipsUsedObj[qId] = { theory: t, practice: p };
      }
    }

    localStorage.removeItem(getStorageKey(examId));
    onSubmit(answers, score, tipsUsedObj);
  }, [answers, calculateScore, examId, onSubmit, tipsUsed, questions]);

  useEffect(() => { submitRef.current = handleSubmit; }, [handleSubmit]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(getStorageKey(examId));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.tipsUsed) setTipsUsed(parsed.tipsUsed);
        if (parsed.timeLeft !== undefined) setTimeLeft(parsed.timeLeft);
      }
    } catch { /* ignore */ }
  }, [examId]);

  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey(examId), JSON.stringify({ answers, timeLeft, tipsUsed }));
    } catch { /* storage full, ignore */ }
  }, [answers, timeLeft, tipsUsed, examId]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          submitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleAnswer = useCallback((qId: number | string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  }, []);

  const handleUseTip = useCallback((qId: string | number, tipIndex: number) => {
    setTipsUsed((prev) => {
       const qIdStr = qId.toString();
       const existing = prev[qIdStr] || [];
       if (existing.includes(tipIndex)) return prev;
       return { ...prev, [qIdStr]: [...existing, tipIndex] };
    });
  }, []);

  const answeredCount = Object.keys(answers).length;
  const progressPct = (answeredCount / questions.length) * 100;
  const isTimeLow = timeLeft < 60;

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Top Bar (Sticky) */}
      <div className="flex-none z-10 sticky top-0 bg-background pt-2 pb-2">
        <Card className="shadow-sm border-primary/20">
          <CardContent className="py-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Badge variant={isTimeLow ? 'destructive' : 'secondary'} className="font-mono text-sm px-3 py-1">
                Waktu: {formatTime(timeLeft)}
              </Badge>
              <span className="text-sm font-semibold">
                {answeredCount}/{questions.length} Terjawab
              </span>
            </div>
            <div className="flex-1 max-w-md hidden md:block">
              <Progress value={progressPct} className="h-2.5" />
            </div>
            <Button variant="destructive" size="sm" onClick={() => setShowConfirm(true)}>
              Kumpulkan Ujian
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Virtualized List Container */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto pr-2 custom-scrollbar"
        style={{ minHeight: '500px', maxHeight: '80vh' }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = renderItems[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                  paddingBottom: '24px',
                }}
              >
                {item.type === 'question' ? (
                  <div className="bg-card border rounded-xl shadow-sm p-1">
                    <QuestionRenderer
                      question={item.question}
                      answer={answers[item.question.id]}
                      onAnswer={(id, val) => handleAnswer(id, val)}
                      showCorrectAnswer={immediateFeedback && answers[item.question.id] !== undefined}
                      feedbackMode={immediateFeedback ? 'graded' : 'neutral'}
                      onUseTip={handleUseTip}
                      usedTips={tipsUsed[item.question.id] || []}
                      enableTipPenalty={enableTipPenalty}
                      tipPenaltyTheory={penaltyTheoryConfig}
                      tipPenaltyPractice={penaltyPracticeConfig}
                    />
                  </div>
                ) : (
                  <StimulusRenderer content={item.content}>
                    <div className="space-y-4">
                      {item.questions.map(q => (
                        <div key={q.id} className="bg-card border rounded-xl shadow-sm p-1">
                          <QuestionRenderer
                            question={q}
                            answer={answers[q.id]}
                            onAnswer={(id, val) => handleAnswer(id, val)}
                            showCorrectAnswer={immediateFeedback && answers[q.id] !== undefined}
                            feedbackMode={immediateFeedback ? 'graded' : 'neutral'}
                            onUseTip={handleUseTip}
                            usedTips={tipsUsed[q.id] || []}
                            enableTipPenalty={enableTipPenalty}
                            tipPenaltyTheory={penaltyTheoryConfig}
                            tipPenaltyPractice={penaltyPracticeConfig}
                          />
                        </div>
                      ))}
                    </div>
                  </StimulusRenderer>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Pengumpulan</DialogTitle>
            <DialogDescription>
              Anda telah menjawab {answeredCount} dari {questions.length} soal.
              {answeredCount < questions.length && <strong className="block mt-2 text-destructive">Peringatan: Masih ada {questions.length - answeredCount} soal kosong!</strong>}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Batal, Lanjut Mengerjakan</Button>
            <Button variant="destructive" onClick={handleSubmit}>Ya, Kumpulkan Sekarang</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
