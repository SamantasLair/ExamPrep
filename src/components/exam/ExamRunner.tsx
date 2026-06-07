'use client';

import type { Question } from '@/lib/types';
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
import { Menu, X, CheckSquare, Square, AlertCircle, EyeOff, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExamRunnerVM } from '@/viewmodels/useExamRunnerVM';
import { useFocusTrackerVM } from '@/viewmodels/useFocusTrackerVM';

interface ExamRunnerProps {
  questions: Question[];
  durationMinutes: number;
  examId: string;
  onSubmit: (answers: Record<string, string>, score: number, tipsUsedData: Record<string, { theory: number; practice: number }>, violations: number) => void;
  immediateFeedback?: boolean;
  enableTipPenalty?: boolean;
  penaltyTheoryConfig?: string;
  penaltyPracticeConfig?: string;
}

export function ExamRunner({ 
  questions, durationMinutes, examId, onSubmit, immediateFeedback = false,
  enableTipPenalty = false, penaltyTheoryConfig = '', penaltyPracticeConfig = ''
}: ExamRunnerProps) {
  const { isFocused, violationCount, maxViolations, acknowledgeWarning } = useFocusTrackerVM(examId, () => {
    // If it reaches max violations, we auto submit
    handleSubmit();
  });

  const {
    answers,
    tipsUsed,
    timeLeft,
    showConfirm, setShowConfirm,
    isDrawerOpen, setIsDrawerOpen,
    scrollRef,
    renderItems,
    handleAnswer,
    handleUseTip,
    handleSubmit,
    answeredCount,
    progressPct,
    isTimeLow
  } = useExamRunnerVM({
    questions, durationMinutes, examId, onSubmit, violationCount, enableTipPenalty, penaltyTheoryConfig, penaltyPracticeConfig
  });

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  const virtualizer = useVirtualizer({
    count: renderItems.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 300, // Estimated pixel height per item
    overscan: 3, // Render a few items outside viewport to prevent flickering
  });

  // Jump to question logic
  const jumpToQuestion = (qId: string) => {
    // Find index in renderItems
    const index = renderItems.findIndex(item => {
      if (item.type === 'question') return item.question.id.toString() === qId;
      if (item.type === 'stimulus_group') return item.questions.some((q: Question) => q.id.toString() === qId);
      return false;
    });
    if (index !== -1) {
      virtualizer.scrollToIndex(index, { align: 'start' });
      if (window.innerWidth < 768) setIsDrawerOpen(false); // auto close on mobile
    }
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-muted/10 relative transition-all duration-300">
        
        {/* Offline & Violation Banners */}
        {violationCount > 0 && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 border-b border-destructive/20 z-20">
            <AlertCircle className="w-4 h-4" />
            Peringatan Integritas: Anda terdeteksi keluar dari ujian ({violationCount}/{maxViolations} kali). Jika melampaui batas, ujian akan dikumpulkan otomatis.
          </div>
        )}

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

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 z-[15] bg-black/40 backdrop-blur-sm md:hidden animate-in fade-in" 
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

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

      {/* Focus Tracker Overlay */}
      {!isFocused && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex flex-col items-center justify-center p-4 text-center">
          <EyeOff className="w-16 h-16 text-destructive mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-destructive mb-2">Peringatan Integritas Ujian!</h2>
          <p className="max-w-md text-muted-foreground mb-6">
            Anda terdeteksi berpindah tab atau meminimalkan browser. Tindakan ini dicatat sebagai pelanggaran.
          </p>
          <Button size="lg" onClick={acknowledgeWarning} className="font-bold">
            Kembali ke Ujian
          </Button>
        </div>
      )}
    </div>
  );
}
