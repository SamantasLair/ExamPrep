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
import { Menu, X, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Retractable Nav Drawer
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

  // Jump to question logic
  const jumpToQuestion = useCallback((qId: string) => {
    // Find index in renderItems
    const index = renderItems.findIndex(item => {
      if (item.type === 'question') return item.question.id.toString() === qId;
      if (item.type === 'stimulus_group') return item.questions.some(q => q.id.toString() === qId);
      return false;
    });
    if (index !== -1) {
      virtualizer.scrollToIndex(index, { align: 'start' });
      if (window.innerWidth < 768) setIsDrawerOpen(false); // auto close on mobile
    }
  }, [renderItems, virtualizer]);

  return (
    <div className="h-full flex overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-muted/10 relative transition-all duration-300">
        {/* Top Bar (Sticky, Denser) */}
        <div className="flex-none z-10 sticky top-0 bg-background/90 backdrop-blur border-b shadow-sm">
          <div className="py-2 px-3 md:px-6 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setIsDrawerOpen(!isDrawerOpen)} className="shrink-0 rounded-full h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors">
                <Menu className="w-4 h-4" />
              </Button>
              <Badge variant={isTimeLow ? 'destructive' : 'secondary'} className="font-mono text-xs px-2.5 py-0.5 rounded-full shadow-sm">
                Waktu: {formatTime(timeLeft)}
              </Badge>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground hidden sm:inline-block">
                {answeredCount}/{questions.length} Terjawab
              </span>
            </div>
            <div className="flex-1 max-w-sm hidden lg:block px-4">
              <Progress value={progressPct} className="h-1.5" />
            </div>
            <Button variant="destructive" size="sm" onClick={() => setShowConfirm(true)} className="h-8 text-[11px] font-bold shadow-sm hover:scale-[1.02] transition-transform">
              Kumpulkan
            </Button>
          </div>
        </div>

        {/* Virtualized List Container */}
        <div 
          ref={scrollRef} 
          className="flex-1 overflow-y-auto px-2 md:px-6 py-4 custom-scrollbar"
          style={{ minHeight: '500px' }}
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
                    paddingBottom: '20px',
                  }}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  {item.type === 'question' ? (
                  <div className="group">
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
                        <div key={q.id} className="group">
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
      </div>

      {/* Retractable Right Drawer for Navigation */}
      <aside 
        className={cn(
          "w-64 border-l bg-card flex flex-col shrink-0 transition-all duration-300 z-20 absolute md:relative right-0 top-0 bottom-0 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]",
          isDrawerOpen ? "translate-x-0" : "translate-x-full md:translate-x-0 md:w-0 md:border-l-0 overflow-hidden"
        )}
      >
        <div className="p-3 border-b flex items-center justify-between bg-muted/20">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Navigasi Soal</h3>
          <Button variant="ghost" size="icon" onClick={() => setIsDrawerOpen(false)} className="h-6 w-6 rounded-full md:hidden">
            <X className="w-3 h-3" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-background/50">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              return (
                <button
                  key={q.id}
                  onClick={() => jumpToQuestion(q.id.toString())}
                  className={cn(
                    "h-8 w-8 text-[11px] font-mono font-bold rounded-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm",
                    isAnswered 
                      ? "bg-primary text-primary-foreground border-transparent" 
                      : "bg-background border border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary"
                  )}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
        <div className="p-4 border-t bg-muted/10 text-[10px] text-muted-foreground space-y-2">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-primary border"></div> Sudah Dijawab</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-background border"></div> Belum Dijawab</div>
        </div>
      </aside>

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
