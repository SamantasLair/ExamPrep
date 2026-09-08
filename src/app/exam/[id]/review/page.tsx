'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { QuestionRenderer } from '@/components/exam/QuestionRenderer';
import { StimulusRenderer } from '@/components/exam/StimulusRenderer';
import { ContentBlockList } from '@/components/exam/ContentBlockRenderer';
import { parseMarkdown } from '@/lib/parser';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AnimeBox } from '@/components/ui/AnimeBox';
import {
  Dialog, DialogContent
} from '@/components/ui/dialog';
import { useExamReviewVM } from '@/viewmodels/useExamReviewVM';
import { 
  ArrowLeft, CheckCircle2, XCircle, LayoutGrid, 
  ChevronDown, SkipForward, BookOpen, ChevronLeft, ChevronRight, Type
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Question } from '@/lib/types';

export default function ReviewPage() {
  const params = useParams();
  const examId = params.id as string;
  const {
    test,
    attempt,
    questions,
    loading,
    isExamActive,
    accessDenied,
    responses,
    feedbackMode,
    router
  } = useExamReviewVM(examId);

  const [activeFilter, setActiveFilter] = useState<'all' | 'correct' | 'wrong' | 'unanswered'>('all');
  const [displayMode, setDisplayMode] = useState<'1' | '5' | 'all'>('1');
  const [currentSingleIdx, setCurrentSingleIdx] = useState<number>(0);
  const [currentBatchPage, setCurrentBatchPage] = useState<number>(1);
  const [textSize, setTextSize] = useState<'normal' | 'medium' | 'large'>('normal');
  const [matrixModalOpen, setMatrixModalOpen] = useState<boolean>(false);

  // Computed stats for questions
  const { correctCount, wrongCount, unansweredCount, questionStatusMap } = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    const statusMap: Record<string, 'correct' | 'wrong' | 'unanswered'> = {};

    questions.forEach((q) => {
      const userAns = responses[q.id];
      if (userAns === undefined || userAns === '') {
        unanswered++;
        statusMap[q.id] = 'unanswered';
      } else if (q.correctAnswer && userAns === q.correctAnswer) {
        correct++;
        statusMap[q.id] = 'correct';
      } else {
        wrong++;
        statusMap[q.id] = 'wrong';
      }
    });

    return { correctCount: correct, wrongCount: wrong, unansweredCount: unanswered, questionStatusMap: statusMap };
  }, [questions, responses]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const status = questionStatusMap[q.id];
      if (activeFilter === 'correct') return status === 'correct';
      if (activeFilter === 'wrong') return status === 'wrong';
      if (activeFilter === 'unanswered') return status === 'unanswered';
      return true;
    });
  }, [questions, questionStatusMap, activeFilter]);

  // Reset pagination indexes when filter changes
  const handleFilterChange = (filter: 'all' | 'correct' | 'wrong' | 'unanswered') => {
    setActiveFilter(filter);
    setCurrentSingleIdx(0);
    setCurrentBatchPage(1);
  };

  const totalBatchPages = Math.ceil(filteredQuestions.length / 5) || 1;

  // Handle Mode Change with index synchronization
  const handleModeChange = (newMode: '1' | '5' | 'all') => {
    if (newMode === '5') {
      setCurrentBatchPage(Math.floor(currentSingleIdx / 5) + 1);
    } else if (newMode === '1') {
      setCurrentSingleIdx(Math.min(filteredQuestions.length - 1, (currentBatchPage - 1) * 5));
    }
    setDisplayMode(newMode);
  };

  // Jump to specific question
  const navigateToQuestion = (qId: string | number) => {
    let targetList = filteredQuestions;
    const foundInFiltered = filteredQuestions.findIndex(q => q.id === qId);
    if (foundInFiltered === -1) {
      setActiveFilter('all');
      targetList = questions;
    }

    const idx = targetList.findIndex(q => q.id === qId);
    if (idx !== -1) {
      if (displayMode === '1') {
        setCurrentSingleIdx(idx);
      } else if (displayMode === '5') {
        setCurrentBatchPage(Math.floor(idx / 5) + 1);
      } else {
        setTimeout(() => {
          const el = document.getElementById(`review-q-${qId}`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
    }
  };

  // Jump to first wrong answer
  const jumpToFirstWrong = () => {
    const firstWrong = questions.find((q) => questionStatusMap[q.id] === 'wrong');
    if (firstWrong) {
      navigateToQuestion(firstWrong.id);
    }
  };

  // Jump to next wrong answer
  const jumpToNextWrong = () => {
    const currentQ = filteredQuestions[currentSingleIdx];
    const currentFullIdx = questions.findIndex(q => q.id === currentQ?.id);
    const nextWrong = questions.slice(currentFullIdx + 1).find(q => questionStatusMap[q.id] === 'wrong')
      || questions.find(q => questionStatusMap[q.id] === 'wrong');
    if (nextWrong) {
      navigateToQuestion(nextWrong.id);
    }
  };

  // Group batch questions by stimulus for Mode 5
  const batchReviewItems = useMemo(() => {
    const startIdx = (currentBatchPage - 1) * 5;
    const batch = filteredQuestions.slice(startIdx, startIdx + 5);
    const items: ({ type: 'question'; question: Question } | { type: 'stimulus_group'; stimulus_id: string; content: string; questions: Question[] })[] = [];
    let currentGroup: { type: 'stimulus_group'; stimulus_id: string; content: string; questions: Question[] } | null = null;

    for (const q of batch) {
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
  }, [filteredQuestions, currentBatchPage]);

  // Keyboard navigation for review mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (matrixModalOpen) setMatrixModalOpen(false);
        return;
      }

      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (displayMode === '1') {
        if (e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') {
          setCurrentSingleIdx(prev => Math.min(filteredQuestions.length - 1, prev + 1));
        } else if (e.key === 'ArrowLeft' || e.key === 'p' || e.key === 'P') {
          setCurrentSingleIdx(prev => Math.max(0, prev - 1));
        }
      } else if (displayMode === '5') {
        if (e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') {
          setCurrentBatchPage(prev => Math.min(totalBatchPages, prev + 1));
        } else if (e.key === 'ArrowLeft' || e.key === 'p' || e.key === 'P') {
          setCurrentBatchPage(prev => Math.max(1, prev - 1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredQuestions.length, displayMode, matrixModalOpen, totalBatchPages]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">Memuat pembahasan ujian...</p>
        </div>
      </div>
    );
  }

  if (accessDenied || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-4 p-8 border border-border/70 rounded-2xl bg-card shadow-xs">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Akses Pembahasan Ditutup</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Pembahasan untuk ujian ini belum dibuka atau telah dibatasi oleh pengajar. Silakan hubungi admin ujian jika ada pertanyaan.
          </p>
          <Button onClick={() => router.push('/')} className="rounded-xl text-xs font-semibold px-5">
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AnimeBox className="h-full flex flex-col overflow-hidden w-full bg-background select-none">
      {/* UNIFIED REVIEW STUDIO COMMAND BAR */}
      <header className="h-14 border-b border-border/60 bg-card/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-20 shadow-2xs">
        {/* Left Section: Back, Title, Score */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/')}
            className="h-8 px-2.5 rounded-xl text-xs font-semibold border-border/70 text-foreground hover:bg-muted gap-1.5 shrink-0"
            title="Kembali ke Beranda Siswa"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Beranda</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setMatrixModalOpen(true)}
            className="h-8 px-2.5 rounded-xl text-xs font-semibold border-border/70 text-foreground hover:bg-muted gap-1.5 shrink-0"
            title="Buka matriks 50 soal"
          >
            <LayoutGrid className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Matriks Soal</span>
          </Button>

          <div className="h-4 w-px bg-border/60 hidden sm:block" />

          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-xs sm:text-sm font-semibold tracking-tight truncate max-w-[150px] sm:max-w-xs md:max-w-sm text-foreground">
              {test.title}
            </h1>
            {attempt && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold shrink-0 hidden md:inline tabular-nums">
                Skor: {attempt.score}
              </span>
            )}
            {displayMode === '1' ? (
              <span className="text-[11px] font-medium text-muted-foreground hidden lg:inline shrink-0 tabular-nums">
                • Soal #{currentSingleIdx + 1} dari {filteredQuestions.length}
              </span>
            ) : displayMode === '5' ? (
              <span className="text-[11px] font-medium text-muted-foreground hidden lg:inline shrink-0 tabular-nums">
                • Halaman {currentBatchPage} dari {totalBatchPages}
              </span>
            ) : (
              <span className="text-[11px] font-medium text-muted-foreground hidden lg:inline shrink-0 tabular-nums">
                • Semua Soal
              </span>
            )}
          </div>
        </div>

        {/* Center Section: Quick KPI Pills */}
        <div className="flex items-center gap-2 bg-muted/40 border border-border/60 rounded-xl px-3 py-1 shrink-0 text-xs">
          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold tabular-nums">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{correctCount}</span>
            <span className="hidden sm:inline text-[11px] font-normal text-muted-foreground">Benar</span>
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="flex items-center gap-1 text-destructive font-semibold tabular-nums">
            <XCircle className="w-3.5 h-3.5" />
            <span>{wrongCount}</span>
            <span className="hidden sm:inline text-[11px] font-normal text-muted-foreground">Salah</span>
          </span>
          <span className="text-muted-foreground/40 hidden sm:inline">•</span>
          <span className="hidden sm:flex items-center gap-1 text-muted-foreground font-semibold tabular-nums">
            <span>{unansweredCount}</span>
            <span className="text-[11px] font-normal">Kosong</span>
          </span>
        </div>

        {/* Right Section: Mode Selector, Text Scaler, Done */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Display Mode Selector */}
          <div className="hidden md:flex items-center bg-muted/40 border border-border/60 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => handleModeChange('1')}
              className={cn("px-2.5 py-1 rounded-md text-xs font-medium transition-all", displayMode === '1' ? "bg-card text-foreground shadow-2xs font-semibold" : "text-muted-foreground hover:text-foreground")}
              title="1 Soal per layar"
            >
              1 Soal
            </button>
            <button
              onClick={() => handleModeChange('5')}
              className={cn("px-2.5 py-1 rounded-md text-xs font-medium transition-all", displayMode === '5' ? "bg-card text-foreground shadow-2xs font-semibold" : "text-muted-foreground hover:text-foreground")}
              title="5 Soal per halaman"
            >
              5 Soal
            </button>
            <button
              onClick={() => handleModeChange('all')}
              className={cn("px-2.5 py-1 rounded-md text-xs font-medium transition-all", displayMode === 'all' ? "bg-card text-foreground shadow-2xs font-semibold" : "text-muted-foreground hover:text-foreground")}
              title="Semua Soal"
            >
              Semua
            </button>
          </div>

          {/* Text Font Scaler */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setTextSize(prev => prev === 'normal' ? 'medium' : prev === 'medium' ? 'large' : 'normal')}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-lg"
            title="Ubah ukuran teks (Normal / Sedang / Besar)"
          >
            <Type className="w-4 h-4" />
          </Button>

          {/* Exit Review Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/')}
            className="h-8 px-3 text-xs font-semibold rounded-lg border-border/80 hover:bg-muted"
          >
            Selesai
          </Button>
        </div>
      </header>

      {/* PRIMARY ZERO-DISTRACTION REVIEW WORKSPACE */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        <div className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
          {/* Active Filter Notification Banner */}
          {activeFilter !== 'all' && (
            <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 flex items-center justify-between text-xs text-primary font-medium shrink-0">
              <span>Menampilkan {filteredQuestions.length} butir soal ({activeFilter === 'correct' ? 'Hanya Jawaban Benar' : activeFilter === 'wrong' ? 'Hanya Jawaban Salah' : 'Hanya Soal Kosong'})</span>
              <Button variant="ghost" size="sm" onClick={() => handleFilterChange('all')} className="h-6 text-xs text-primary hover:bg-primary/20 rounded-md">
                Reset Filter
              </Button>
            </div>
          )}

          {/* Canvas Scroll Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredQuestions.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground border border-dashed rounded-2xl max-w-lg mx-auto my-12 text-xs">
                Tidak ada butir soal yang cocok dengan filter yang dipilih.
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={() => handleFilterChange('all')} className="rounded-xl">
                    Tampilkan Semua Soal
                  </Button>
                </div>
              </div>
            ) : displayMode === '1' ? (
              /* MODE 1: SINGLE QUESTION WITH SPLIT STIMULUS SUPPORT */
              (() => {
                const q = filteredQuestions[currentSingleIdx];
                if (!q) return null;

                if (q.stimulus_content) {
                  const stimulusBlocks = parseMarkdown(`# Q1 (ESSAY)\n${q.stimulus_content}`)[0]?.body || [];
                  return (
                    <div className="min-h-full flex flex-col lg:flex-row overflow-hidden w-full">
                      {/* Left Stimulus Pane */}
                      <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-border/60 bg-muted/10 p-6 md:p-8 lg:overflow-y-auto custom-scrollbar">
                        <div className="max-w-xl mx-auto space-y-4">
                          <div className="flex items-center gap-2 pb-3 border-b border-border/60">
                            <BookOpen className="w-4 h-4 text-primary" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                              Teks Stimulus / Kasus
                            </span>
                          </div>
                          <div className={cn("leading-relaxed text-foreground/90 font-normal", textSize === 'large' ? 'text-base' : textSize === 'medium' ? 'text-[15px]' : 'text-sm')}>
                            <ContentBlockList blocks={stimulusBlocks} />
                          </div>
                        </div>
                      </div>

                      {/* Right Question & Discussion Pane */}
                      <div className="w-full lg:w-1/2 p-6 md:p-8 lg:overflow-y-auto custom-scrollbar bg-background">
                        <div className="max-w-xl mx-auto">
                          <QuestionRenderer
                            question={q}
                            answer={responses[q.id]}
                            showDiscussion
                            showCorrectAnswer
                            feedbackMode={feedbackMode}
                            disabled
                            textSize={textSize}
                            borderless
                          />
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="max-w-3xl xl:max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
                    <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-xs">
                      <QuestionRenderer
                        question={q}
                        answer={responses[q.id]}
                        showDiscussion
                        showCorrectAnswer
                        feedbackMode={feedbackMode}
                        disabled
                        textSize={textSize}
                        borderless
                      />
                    </div>
                  </div>
                );
              })()
            ) : displayMode === '5' ? (
              /* MODE 2: 5 QUESTIONS PER PAGE BATCH WITH STIMULUS SUPPORT */
              <div className="max-w-4xl xl:max-w-5xl mx-auto space-y-8 py-6 px-4 sm:px-6">
                {batchReviewItems.map((item, idx) => {
                  if (item.type === 'stimulus_group') {
                    return (
                      <StimulusRenderer key={item.stimulus_id || idx} content={item.content}>
                        <div className="space-y-4">
                          {item.questions.map(q => (
                            <QuestionRenderer
                              key={q.id}
                              question={q}
                              answer={responses[q.id]}
                              showDiscussion
                              showCorrectAnswer
                              feedbackMode={feedbackMode}
                              disabled
                              textSize={textSize}
                            />
                          ))}
                        </div>
                      </StimulusRenderer>
                    );
                  }
                  return (
                    <div key={item.question.id} className="animate-in fade-in duration-200">
                      <QuestionRenderer
                        question={item.question}
                        answer={responses[item.question.id]}
                        showDiscussion
                        showCorrectAnswer
                        feedbackMode={feedbackMode}
                        disabled
                        textSize={textSize}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              /* MODE 3: ALL QUESTIONS CONTINUOUS LIST */
              <div className="max-w-3xl xl:max-w-4xl mx-auto space-y-6 py-6 px-4 sm:px-6">
                {filteredQuestions.map((q) => (
                  <div key={q.id} id={`review-q-${q.id}`} className="scroll-mt-6">
                    <QuestionRenderer
                      question={q}
                      answer={responses[q.id]}
                      showDiscussion
                      showCorrectAnswer
                      feedbackMode={feedbackMode}
                      disabled
                      textSize={textSize}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DOCKED BOTTOM REVIEW NAVIGATION TOOLBAR - PERSISTENT IN ALL MODES */}
          <div className="h-14 border-t border-border/60 bg-card/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shadow-2xs shrink-0 z-10">
            {/* Left: Open Matrix Modal Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMatrixModalOpen(true)}
              className="h-9 px-3 sm:px-4 rounded-xl text-xs font-semibold border-border/80 hover:bg-muted gap-2 shrink-0"
            >
              <LayoutGrid className="w-4 h-4 text-primary" />
              <span>Matriks Evaluasi</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold tabular-nums">
                {correctCount}/{questions.length}
              </span>
            </Button>

            {/* Center: Jump to Next Wrong Answer & Page Indicator */}
            <div className="flex items-center gap-3">
              {wrongCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={jumpToNextWrong}
                  className="h-8 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-xl gap-1.5"
                  title="Lompat ke butir soal salah berikutnya"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Soal Salah Berikutnya</span>
                </Button>
              )}

              {displayMode === '5' && (
                <div className="text-xs font-semibold text-muted-foreground hidden sm:block">
                  Halaman <span className="text-foreground font-bold tabular-nums">{currentBatchPage}</span> dari {totalBatchPages}
                </div>
              )}
            </div>

            {/* Right: Prev & Next Navigation */}
            <div className="flex items-center gap-2 shrink-0">
              {displayMode === '1' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentSingleIdx === 0}
                    onClick={() => setCurrentSingleIdx(prev => Math.max(0, prev - 1))}
                    className="font-semibold gap-1.5 rounded-xl h-9 px-3.5 border-border/80 hover:bg-muted text-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentSingleIdx >= filteredQuestions.length - 1}
                    onClick={() => setCurrentSingleIdx(prev => Math.min(filteredQuestions.length - 1, prev + 1))}
                    className="font-semibold gap-1.5 rounded-xl h-9 px-3.5 border-border/80 hover:bg-muted text-xs"
                  >
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {displayMode === '5' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentBatchPage === 1}
                    onClick={() => setCurrentBatchPage(prev => Math.max(1, prev - 1))}
                    className="font-semibold gap-1.5 rounded-xl h-9 px-3.5 border-border/80 hover:bg-muted text-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Hal Sebelumnya</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentBatchPage >= totalBatchPages}
                    onClick={() => setCurrentBatchPage(prev => Math.min(totalBatchPages, prev + 1))}
                    className="font-semibold gap-1.5 rounded-xl h-9 px-3.5 border-border/80 hover:bg-muted text-xs"
                  >
                    <span>Hal Selanjutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {displayMode === 'all' && (
                <Button
                  size="sm"
                  onClick={() => router.push('/')}
                  className="font-semibold gap-1.5 rounded-xl h-9 px-4 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs text-xs"
                >
                  <span>Selesai Tinjau</span>
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ON-DEMAND EVALUATION MATRIX DIALOG (NO SCARY 'X' BUTTON) */}
      <Dialog open={matrixModalOpen} onOpenChange={setMatrixModalOpen}>
        <DialogContent showCloseButton={false} className="max-w-3xl max-h-[90vh] flex flex-col p-0 rounded-2xl overflow-hidden border-border/80 shadow-2xl">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between bg-muted/20 shrink-0">
            <div className="space-y-0.5">
              <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-primary" />
                Matriks Evaluasi Jawaban ({questions.length} Butir)
              </h2>
              <p className="text-xs text-muted-foreground">
                Pilih nomor soal untuk meninjau detail pembahasan dan kunci jawaban.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMatrixModalOpen(false)}
              className="h-8 px-3 rounded-xl text-xs font-semibold border-border/80 hover:bg-muted gap-1.5"
            >
              <ChevronDown className="w-4 h-4" />
              <span>Tutup Matriks</span>
            </Button>
          </div>

          {/* Modal Status Bar & Filter Tabs */}
          <div className="px-6 py-3 border-b border-border/50 bg-card/60 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
            {/* Legend */}
            <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-muted-foreground font-medium flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </span>
                <span>Benar ({correctCount})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-destructive/20 border border-destructive/50 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                </span>
                <span>Salah ({wrongCount})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm border border-border/80 bg-muted/40" />
                <span>Kosong ({unansweredCount})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm border-2 border-primary bg-primary/10" />
                <span>Sedang Ditinjau</span>
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center bg-muted/50 p-0.5 rounded-lg border border-border/60 text-xs">
              <button
                onClick={() => handleFilterChange('all')}
                className={cn("px-2.5 py-1 rounded-md text-[11px] font-medium transition-all", activeFilter === 'all' ? "bg-card text-foreground shadow-2xs font-semibold" : "text-muted-foreground hover:text-foreground")}
              >
                Semua
              </button>
              <button
                onClick={() => handleFilterChange('wrong')}
                className={cn("px-2.5 py-1 rounded-md text-[11px] font-medium transition-all", activeFilter === 'wrong' ? "bg-destructive/15 text-destructive font-semibold shadow-2xs" : "text-muted-foreground hover:text-foreground")}
              >
                Salah ({wrongCount})
              </button>
              <button
                onClick={() => handleFilterChange('correct')}
                className={cn("px-2.5 py-1 rounded-md text-[11px] font-medium transition-all", activeFilter === 'correct' ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold shadow-2xs" : "text-muted-foreground hover:text-foreground")}
              >
                Benar ({correctCount})
              </button>
              <button
                onClick={() => handleFilterChange('unanswered')}
                className={cn("px-2.5 py-1 rounded-md text-[11px] font-medium transition-all", activeFilter === 'unanswered' ? "bg-card text-foreground shadow-2xs font-semibold" : "text-muted-foreground hover:text-foreground")}
              >
                Kosong ({unansweredCount})
              </button>
            </div>
          </div>

          {/* 50-Number Grid */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
              {questions.map((q, idx) => {
                const status = questionStatusMap[q.id];
                const isCurrentInSingle = displayMode === '1' && filteredQuestions[currentSingleIdx]?.id === q.id;

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      navigateToQuestion(q.id);
                      setMatrixModalOpen(false);
                    }}
                    className={cn(
                      "h-10 w-full text-xs font-semibold tabular-nums rounded-xl flex items-center justify-center relative transition-all border cursor-pointer select-none",
                      isCurrentInSingle && "ring-2 ring-primary ring-offset-2 dark:ring-offset-card scale-[1.03] z-10",
                      status === 'correct'
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-500/25"
                        : status === 'wrong'
                          ? "bg-destructive/15 border-destructive/40 text-destructive hover:bg-destructive/25"
                          : "bg-card border-border/70 text-muted-foreground hover:border-zinc-400 hover:text-foreground"
                    )}
                    title={`Soal #${idx + 1}: ${status === 'correct' ? 'Benar' : status === 'wrong' ? 'Salah' : 'Tidak Dijawab'}`}
                  >
                    <span>{idx + 1}</span>
                    {status === 'correct' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-1.5 right-1.5" />
                    )}
                    {status === 'wrong' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive absolute top-1.5 right-1.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 border-t border-border/60 bg-muted/20 flex items-center justify-between gap-3 shrink-0">
            <div>
              {wrongCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    jumpToFirstWrong();
                    setMatrixModalOpen(false);
                  }}
                  className="h-8 text-xs font-medium border-border/80 rounded-xl gap-1.5 text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Lompat ke Soal Salah Pertama</span>
                </Button>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => setMatrixModalOpen(false)}
              className="h-8 px-5 rounded-xl text-xs font-semibold bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Kembali ke Pembahasan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AnimeBox>
  );
}
