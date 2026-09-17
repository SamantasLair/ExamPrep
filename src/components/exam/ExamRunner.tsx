'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Question } from '@/lib/types';
import { runSafeViewTransition, focusQuestionCard } from '@/lib/viewTransitions';
import { QuestionRenderer } from './QuestionRenderer';
import { StimulusRenderer } from './StimulusRenderer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  AlertCircle, Eye, EyeOff, Flag,
  Maximize2, Minimize2, ChevronLeft, ChevronRight, ChevronDown,
  SkipForward, CheckCircle2, FileEdit, Type,
  Clock, LayoutGrid, BookOpen, Search, Command, HelpCircle, Columns, Sparkles, X, Check,
  Minus, Trash2, ArrowRight, Wifi, WifiOff, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExamRunnerVM } from '@/viewmodels/useExamRunnerVM';
import { useFocusTrackerVM } from '@/viewmodels/useFocusTrackerVM';
import { ContentBlockList } from './ContentBlockRenderer';
import { parseMarkdown } from '@/lib/parser';
import { db } from '@/lib/db';
import { batchSyncManager, type BatchSyncStatus } from '@/lib/batchSyncManager';

interface ExamRunnerProps {
  testTitle?: string;
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
  testTitle = 'Ujian',
  questions,
  durationMinutes,
  examId,
  onSubmit,
  immediateFeedback = false,
  enableTipPenalty = false,
  penaltyTheoryConfig = '',
  penaltyPracticeConfig = ''
}: ExamRunnerProps) {
  const { isFocused, violationCount, maxViolations, acknowledgeWarning } = useFocusTrackerVM(examId, () => {
    handleSubmit();
  });

  const {
    answers,
    tipsUsed,
    timeLeft,
    showConfirm,
    setShowConfirm,
    scrollRef,
    renderItems,
    handleAnswer,
    handleUseTip,
    handleSubmit,
    answeredCount,
    progressPct,
    isTimeLow
  } = useExamRunnerVM({
    questions,
    durationMinutes,
    examId,
    onSubmit,
    violationCount,
    enableTipPenalty,
    penaltyTheoryConfig,
    penaltyPracticeConfig
  });

  // ── QoL & Display States ──
  const [displayMode, setDisplayMode] = useState<'1' | '5' | 'all'>('1');
  const [currentSingleIdx, setCurrentSingleIdx] = useState<number>(0);
  const [currentBatchPage, setCurrentBatchPage] = useState<number>(1);
  const [flaggedMap, setFlaggedMap] = useState<Record<string, boolean>>({});
  const [paletteOpen, setPaletteOpen] = useState<boolean>(false);
  const [paletteFilter, setPaletteFilter] = useState<'all' | 'unanswered' | 'flagged' | 'answered'>('all');
  const [textSize, setTextSize] = useState<'normal' | 'medium' | 'large'>('normal');
  const [scratchpadOpen, setScratchpadOpen] = useState<boolean>(false);
  const [scratchpadMinimized, setScratchpadMinimized] = useState<boolean>(false);
  const [scratchpadText, setScratchpadText] = useState<string>('');
  const [showTimer, setShowTimer] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [commandSearch, setCommandSearch] = useState<string>('');
  const [helpOpen, setHelpOpen] = useState<boolean>(false);
  const [splitRatio, setSplitRatio] = useState<'50' | '60' | '40'>('50');
  const [lastSavedPulse, setLastSavedPulse] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<BatchSyncStatus>({
    isOnline: true,
    isSyncing: false,
    pendingQueueCount: 0,
    lastSyncedAt: null,
    error: null
  });

  useEffect(() => {
    setMounted(true);
    const unsubscribe = batchSyncManager.subscribe((status) => {
      setSyncStatus(status);
    });
    return () => unsubscribe();
  }, []);

  // Load scratchpad & flagged state from Dexie IndexedDB (fallback LocalStorage)
  useEffect(() => {
    let active = true;
    async function loadIndexedData() {
      try {
        const scratchDoc = await db.scratchpads.get(examId);
        if (scratchDoc && active) setScratchpadText(scratchDoc.content);
        else {
          const savedScratch = localStorage.getItem(`exaprep_scratch_${examId}`);
          if (savedScratch && active) setScratchpadText(savedScratch);
        }

        const flagDoc = await db.flagged.get(examId);
        if (flagDoc && active) setFlaggedMap(flagDoc.flags);
        else {
          const savedFlags = localStorage.getItem(`exaprep_flags_${examId}`);
          if (savedFlags && active) setFlaggedMap(JSON.parse(savedFlags));
        }
      } catch {
        try {
          const savedScratch = localStorage.getItem(`exaprep_scratch_${examId}`);
          if (savedScratch && active) setScratchpadText(savedScratch);
          const savedFlags = localStorage.getItem(`exaprep_flags_${examId}`);
          if (savedFlags && active) setFlaggedMap(JSON.parse(savedFlags));
        } catch { /* ignore */ }
      }
    }
    loadIndexedData();
    return () => { active = false; };
  }, [examId]);

  // Bidirectional active question index and batch page synchronization
  const syncActiveQuestion = useCallback((qIdOrIdx: string | number) => {
    // 1. Look up by Question ID first (supports numeric and string IDs)
    let idx = questions.findIndex(q => q.id === qIdOrIdx || String(q.id) === String(qIdOrIdx));
    // 2. Fallback: If no question ID matched, check if it is a valid 0-based array index
    if (idx === -1 && typeof qIdOrIdx === 'number' && qIdOrIdx >= 0 && qIdOrIdx < questions.length) {
      idx = qIdOrIdx;
    }
    if (idx !== -1) {
      setCurrentSingleIdx(idx);
      setCurrentBatchPage(Math.floor(idx / 5) + 1);
    }
  }, [questions]);

  const toggleFlag = (qId: string | number) => {
    syncActiveQuestion(qId);
    setFlaggedMap(prev => {
      const next = { ...prev, [String(qId)]: !prev[String(qId)] };
      // Save to Dexie & LocalStorage
      db.flagged.put({ examId, flags: next, updatedAt: Date.now() }).catch(() => {});
      try {
        localStorage.setItem(`exaprep_flags_${examId}`, JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
  };

  const handleScratchpadChange = (text: string) => {
    setScratchpadText(text);
    // Save to Dexie & LocalStorage
    db.scratchpads.put({ examId, content: text, updatedAt: Date.now() }).catch(() => {});
    try {
      localStorage.setItem(`exaprep_scratch_${examId}`, text);
    } catch { /* ignore */ }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  const virtualizer = useVirtualizer({
    count: renderItems.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 320,
    overscan: 3,
  });

  const onAnswerWrapped = (qId: number | string, val: string) => {
    syncActiveQuestion(qId);
    handleAnswer(qId, val);
    setLastSavedPulse(true);
    setTimeout(() => setLastSavedPulse(false), 2000);
  };

  // Adaptive Pacing Cadence Indicator (Time Remaining Ratio vs Questions Remaining)
  const pacingData = useMemo(() => {
    const totalQ = questions.length || 1;
    const unanswered = Math.max(0, totalQ - answeredCount);
    const totalTimeSec = durationMinutes * 60;
    const timeSpentSec = Math.max(1, totalTimeSec - timeLeft);

    // Expected vs Actual pacing
    // Ideal seconds per question:
    const idealSecPerQ = totalTimeSec / totalQ;
    const remainingSecPerQ = unanswered > 0 ? timeLeft / unanswered : idealSecPerQ;
    const paceRatio = remainingSecPerQ / idealSecPerQ; // > 1.1: Aman/Santai, 0.85-1.1: Optimal, < 0.85: Terburu-buru

    let status: 'ahead' | 'optimal' | 'behind' = 'optimal';
    let label = 'Irama Pas';
    let badgeClass = 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20';

    if (unanswered === 0) {
      status = 'ahead';
      label = 'Selesai';
      badgeClass = 'text-primary bg-primary/10 border-primary/20';
    } else if (paceRatio >= 1.15) {
      status = 'ahead';
      label = 'Irama Santai';
      badgeClass = 'text-blue-700 dark:text-blue-300 bg-blue-500/10 border-blue-500/20';
    } else if (paceRatio <= 0.8) {
      status = 'behind';
      label = 'Irama Kritis';
      badgeClass = 'text-destructive bg-destructive/10 border-destructive/20 animate-pulse';
    }

    return { status, label, badgeClass, remainingSecPerQ: Math.round(remainingSecPerQ) };
  }, [questions.length, answeredCount, durationMinutes, timeLeft]);

  const flaggedCount = useMemo(() => {
    return Object.values(flaggedMap).filter(Boolean).length;
  }, [flaggedMap]);

  // Handle Display Mode Switching with safe view transitions, index sync, and focus management
  const handleModeChange = (newMode: '1' | '5' | 'all') => {
    let targetSingle = currentSingleIdx;
    let targetBatch = currentBatchPage;

    if (newMode === '5') {
      targetBatch = Math.floor(currentSingleIdx / 5) + 1;
    } else if (newMode === '1') {
      const batchStart = (currentBatchPage - 1) * 5;
      const batchEnd = Math.min(questions.length - 1, batchStart + 4);
      if (currentSingleIdx < batchStart || currentSingleIdx > batchEnd) {
        targetSingle = Math.min(questions.length - 1, Math.max(0, batchStart));
      }
    }

    runSafeViewTransition(
      () => {
        if (newMode === '5') setCurrentBatchPage(targetBatch);
        if (newMode === '1') setCurrentSingleIdx(targetSingle);
        setDisplayMode(newMode);
      },
      () => {
        if (newMode === 'all') {
          const itemIdx = renderItems.findIndex(item => {
            if (item.type === 'question') return item.question.id === questions[targetSingle]?.id;
            if (item.type === 'stimulus_group') return item.questions.some(q => q.id === questions[targetSingle]?.id);
            return false;
          });
          if (itemIdx !== -1) {
            virtualizer.scrollToIndex(itemIdx, { align: 'start' });
          }
        }
        const activeId = questions[targetSingle]?.id;
        if (activeId !== undefined) {
          focusQuestionCard(activeId);
        }
      }
    );
  };

  // Jump to question logic across all modes
  const jumpToQuestion = (qId: string) => {
    const qIndex = questions.findIndex(q => q.id.toString() === qId);
    if (qIndex !== -1) {
      setCurrentSingleIdx(qIndex);
      setCurrentBatchPage(Math.floor(qIndex / 5) + 1);
    }

    if (displayMode === 'all') {
      const index = renderItems.findIndex(item => {
        if (item.type === 'question') return item.question.id.toString() === qId;
        if (item.type === 'stimulus_group') return item.questions.some((q: Question) => q.id.toString() === qId);
        return false;
      });
      if (index !== -1) {
        virtualizer.scrollToIndex(index, { align: 'start' });
      }
    }
  };

  const jumpToFirstUnanswered = () => {
    const firstUnanswered = questions.find(q => answers[q.id] === undefined || answers[q.id] === '');
    if (firstUnanswered) {
      jumpToQuestion(firstUnanswered.id.toString());
    }
  };

  // Group current 5 questions on currentBatchPage by stimulus for Mode 5
  const batchItems = useMemo(() => {
    const startIdx = (currentBatchPage - 1) * 5;
    const batch = questions.slice(startIdx, startIdx + 5);
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
  }, [questions, currentBatchPage]);

  // Keyboard Shortcuts (A-E/1-5 select, F flag, Arrows/N/P nav, K/cmd+k HUD, ? help, T timer, S/C scratchpad, J jump, Q/G palette, V split)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow Escape to close any open modal
      if (e.key === 'Escape') {
        if (commandPaletteOpen) { setCommandPaletteOpen(false); return; }
        if (helpOpen) { setHelpOpen(false); return; }
        if (paletteOpen) { setPaletteOpen(false); return; }
        if (scratchpadOpen) { setScratchpadOpen(false); return; }
        if (showConfirm) { setShowConfirm(false); return; }
        return;
      }

      // Check if user pressed Cmd+K or Ctrl+K anywhere (even in input)
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
        return;
      }

      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // '?' key opens Keyboard Cheatsheet Helper
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setHelpOpen(prev => !prev);
        return;
      }

      const key = e.key.toUpperCase();
      const currentQ = questions[currentSingleIdx];

      // Quick Command HUD Toggle with 'K'
      if (key === 'K') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
        return;
      }

      // Scratchpad toggle with 'S' or 'C' (Coretan)
      if (key === 'S' || key === 'C') {
        e.preventDefault();
        setScratchpadOpen(prev => !prev);
        return;
      }

      // Question Palette toggle with 'Q' or 'G' (Grid)
      if (key === 'Q' || key === 'G') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
        return;
      }

      // Toggle Timer visibility with 'T'
      if (key === 'T') {
        e.preventDefault();
        setShowTimer(prev => !prev);
        return;
      }

      // Jump to first unanswered with 'J'
      if (key === 'J') {
        e.preventDefault();
        jumpToFirstUnanswered();
        return;
      }

      // Cycle split view ratio on desktop with 'V'
      if (key === 'V') {
        e.preventDefault();
        setSplitRatio(prev => prev === '50' ? '60' : prev === '60' ? '40' : '50');
        return;
      }

      if (displayMode === '1' && currentQ && currentQ.type === 'MCQ' && currentQ.options) {
        let selectedKey: string | null = null;
        if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
          selectedKey = key;
        } else if (['1', '2', '3', '4', '5'].includes(key)) {
          const num = parseInt(key, 10);
          const optionAtNum = currentQ.options[num - 1];
          if (optionAtNum) selectedKey = optionAtNum.key;
        }

        if (selectedKey) {
          const optExists = currentQ.options.some(o => o.key === selectedKey);
          if (optExists) {
            onAnswerWrapped(currentQ.id, selectedKey);
          }
        }
      }

      if (key === 'F' && currentQ) {
        toggleFlag(currentQ.id);
      }

      if (displayMode === '1') {
        if (e.key === 'ArrowRight' || key === 'N') {
          setCurrentSingleIdx(prev => Math.min(questions.length - 1, prev + 1));
        } else if (e.key === 'ArrowLeft' || key === 'P') {
          setCurrentSingleIdx(prev => Math.max(0, prev - 1));
        }
      } else if (displayMode === '5') {
        if (e.key === 'ArrowRight' || key === 'N') {
          const newPage = Math.min(Math.ceil(questions.length / 5), currentBatchPage + 1);
          setCurrentBatchPage(newPage);
          setCurrentSingleIdx((newPage - 1) * 5);
        } else if (e.key === 'ArrowLeft' || key === 'P') {
          const newPage = Math.max(1, currentBatchPage - 1);
          setCurrentBatchPage(newPage);
          setCurrentSingleIdx((newPage - 1) * 5);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [questions, currentSingleIdx, displayMode, paletteOpen, scratchpadOpen, showConfirm, commandPaletteOpen, helpOpen, currentBatchPage]);

  // Actions list for HUD Command Palette with dynamic search filtering
  const commandActions = useMemo(() => {
    const allActions = [
      {
        id: 'unanswered',
        label: 'Lompat ke Soal Kosong Pertama',
        desc: 'Fokus menyelesaikan butir soal yang belum terisi',
        hotkey: 'J',
        icon: SkipForward,
        iconColor: 'text-primary',
        destructive: false,
        onSelect: () => {
          jumpToFirstUnanswered();
          setCommandPaletteOpen(false);
        }
      },
      {
        id: 'flag',
        label: 'Tandai / Batal Ragu-ragu',
        desc: 'Beri bendera penanda review pada soal saat ini',
        hotkey: 'F',
        icon: Flag,
        iconColor: 'text-amber-500',
        destructive: false,
        onSelect: () => {
          if (questions[currentSingleIdx]) toggleFlag(questions[currentSingleIdx].id);
          setCommandPaletteOpen(false);
        }
      },
      {
        id: 'palette',
        label: 'Buka Daftar Nomor Soal',
        desc: 'Navigasi grid 50 nomor butir soal lengkap',
        hotkey: 'Q / G',
        icon: LayoutGrid,
        iconColor: 'text-primary',
        destructive: false,
        onSelect: () => {
          setPaletteOpen(true);
          setCommandPaletteOpen(false);
        }
      },
      {
        id: 'scratchpad',
        label: 'Buka / Tutup Lembar Coretan (PiP)',
        desc: 'Catatan rumus mengapung tanpa menutupi stimulus',
        hotkey: 'S / C',
        icon: FileEdit,
        iconColor: 'text-primary',
        destructive: false,
        onSelect: () => {
          setScratchpadOpen(prev => !prev);
          if (scratchpadMinimized) setScratchpadMinimized(false);
          setCommandPaletteOpen(false);
        }
      },
      {
        id: 'timer',
        label: 'Tampilkan / Sembunyikan Timer',
        desc: 'Redam kecemasan waktu dengan menyembunyikan detik',
        hotkey: 'T',
        icon: Clock,
        iconColor: 'text-primary',
        destructive: false,
        onSelect: () => {
          setShowTimer(prev => !prev);
          setCommandPaletteOpen(false);
        }
      },
      {
        id: 'split',
        label: 'Ganti Rasio Layar Split (50:50 / 60:40 / 40:60)',
        desc: 'Sesuaikan lebar kolom stimulus & soal (Desktop)',
        hotkey: 'V',
        icon: Columns,
        iconColor: 'text-primary',
        destructive: false,
        onSelect: () => {
          setSplitRatio(prev => prev === '50' ? '60' : prev === '60' ? '40' : '50');
          setCommandPaletteOpen(false);
        }
      },
      {
        id: 'submit',
        label: 'Kumpulkan & Tinjau Ujian',
        desc: 'Konfirmasi akhir dan kalkulasi hasil ujian',
        hotkey: 'ENTER',
        icon: CheckCircle2,
        destructive: true,
        onSelect: () => {
          setShowConfirm(true);
          setCommandPaletteOpen(false);
        }
      }
    ];

    if (!commandSearch.trim()) return allActions;
    const q = commandSearch.toLowerCase().trim();
    return allActions.filter(a =>
      a.label.toLowerCase().includes(q) ||
      a.desc.toLowerCase().includes(q) ||
      a.hotkey.toLowerCase().includes(q)
    );
  }, [commandSearch, questions, currentSingleIdx, scratchpadMinimized]);

  // Filtered Questions for Question Palette Modal
  const filteredPaletteQuestions = useMemo(() => {
    return questions.filter(q => {
      const isAns = answers[q.id] !== undefined && answers[q.id] !== '';
      const isFlag = !!flaggedMap[q.id];
      if (paletteFilter === 'unanswered') return !isAns;
      if (paletteFilter === 'flagged') return isFlag;
      if (paletteFilter === 'answered') return isAns;
      return true;
    });
  }, [questions, answers, flaggedMap, paletteFilter]);

  // Memoize single question stimulus parsing in Mode 1 to avoid re-parsing on countdown timer ticks
  const singleStimulusBlocks = useMemo(() => {
    const q = questions[currentSingleIdx];
    if (!q?.stimulus_content) return [];
    return parseMarkdown(`# Q1 (ESSAY)\n${q.stimulus_content}`)[0]?.body || [];
  }, [questions, currentSingleIdx]);

  // Render question card helper with bidirectional active index sync
  const renderQuestionCard = (q: Question, borderless: boolean = false) => (
    <div
      key={q.id}
      onClick={() => syncActiveQuestion(q.id)}
      onFocusCapture={() => syncActiveQuestion(q.id)}
    >
      <QuestionRenderer
        question={q}
        answer={answers[q.id]}
        onAnswer={(id, val) => onAnswerWrapped(id, val)}
        showCorrectAnswer={immediateFeedback && answers[q.id] !== undefined}
        feedbackMode={immediateFeedback ? 'graded' : 'neutral'}
        onUseTip={handleUseTip}
        usedTips={tipsUsed[q.id] || []}
        enableTipPenalty={enableTipPenalty}
        tipPenaltyTheory={penaltyTheoryConfig}
        tipPenaltyPractice={penaltyPracticeConfig}
        flagged={!!flaggedMap[q.id]}
        onToggleFlag={toggleFlag}
        textSize={textSize}
        borderless={borderless}
      />
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden w-full bg-background select-none">
      {/* Integrity Violation Banner */}
      {violationCount > 0 && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 border-b border-destructive/20 z-30 shrink-0">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Peringatan Integritas: Anda terdeteksi keluar dari ujian ({violationCount}/{maxViolations} kali). Jika melampaui batas, ujian akan dikumpulkan otomatis.
        </div>
      )}

      {/* UNIFIED STUDIO COMMAND BAR (Standard 56px / h-14) */}
      <header className="h-14 border-b border-border/60 bg-card/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-20 shadow-2xs">
        {/* Left Section: Exam Title & Question Index */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPaletteOpen(true)}
            className="h-8 px-2.5 rounded-xl text-xs font-semibold border-border/70 text-foreground hover:bg-muted gap-1.5 shrink-0"
            title="Buka daftar 50 nomor soal"
          >
            <LayoutGrid className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Daftar Soal</span>
          </Button>

          <div className="h-4 w-px bg-border/60 hidden sm:block" />

          {/* Quick HUD Command Palette Trigger */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCommandPaletteOpen(true)}
            className="h-8 px-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted gap-1.5 shrink-0 hidden sm:flex border border-transparent hover:border-border/60"
            title="Aksi Cepat & Navigasi HUD (Tekan 'K' atau Ctrl+K)"
          >
            <Command className="w-3.5 h-3.5 text-primary" />
            <span className="hidden md:inline text-[11px]">Aksi</span>
            <kbd className="text-[10px] font-mono bg-muted/80 px-1 py-0.2 rounded border border-border/60 text-muted-foreground">K</kbd>
          </Button>

          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-xs sm:text-sm font-semibold tracking-tight truncate max-w-[150px] sm:max-w-xs md:max-w-sm text-foreground">
              {testTitle}
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold shrink-0 hidden md:inline">
              {questions.length} Soal
            </span>
            {displayMode === '1' ? (
              <span className="text-[11px] font-medium text-muted-foreground hidden lg:inline shrink-0 tabular-nums">
                • Soal #{currentSingleIdx + 1} dari {questions.length}
              </span>
            ) : displayMode === '5' ? (
              <span className="text-[11px] font-medium text-muted-foreground hidden lg:inline shrink-0 tabular-nums">
                • Halaman {currentBatchPage} (Soal {(currentBatchPage - 1) * 5 + 1}–{Math.min(currentBatchPage * 5, questions.length)})
              </span>
            ) : (
              <span className="text-[11px] font-medium text-muted-foreground hidden lg:inline shrink-0 tabular-nums">
                • Semua 50 Soal
              </span>
            )}
          </div>
        </div>

        {/* Center Section: Calm Timer with Anti-Anxiety Toggle + Pre-attentive Pacing Indicator */}
        <div className="flex items-center gap-2 bg-muted/40 border border-border/60 rounded-xl px-3 py-1 shrink-0">
          <Clock className={cn("w-4 h-4 shrink-0", isTimeLow ? "text-destructive animate-pulse" : "text-muted-foreground")} />
          {showTimer ? (
            <span className={cn("text-xs sm:text-sm font-semibold tabular-nums tracking-tight", isTimeLow ? "text-destructive animate-pulse" : "text-foreground")}>
              {formatTime(timeLeft)}
            </span>
          ) : (
            <span className="text-xs font-medium text-muted-foreground tracking-tight">
              Waktu Berjalan
            </span>
          )}
          <button
            onClick={() => setShowTimer(prev => !prev)}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 ml-0.5 rounded"
            title={showTimer ? "Sembunyikan sisa waktu" : "Tampilkan sisa waktu"}
          >
            {showTimer ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>

          {/* Pre-Attentive Visual Progress Bar */}
          <div className="w-12 sm:w-16 hidden md:block ml-1">
            <Progress value={progressPct} className="h-1.5" />
          </div>

          <span className="text-xs font-medium text-muted-foreground hidden sm:inline tabular-nums">
            {answeredCount}/{questions.length}
          </span>

          {/* Adaptive Pacing Cadence Indicator */}
          <div
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-md font-semibold border hidden sm:flex items-center gap-1 tabular-nums transition-colors",
              pacingData.badgeClass
            )}
            title={`Irama Pengerjaan: Sisa ~${pacingData.remainingSecPerQ} detik per sisa butir soal`}
          >
            <Sparkles className="w-2.5 h-2.5 shrink-0" />
            <span>{pacingData.label}</span>
          </div>

          {/* Autosave Status Pulse Indicator */}
          {lastSavedPulse && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 animate-autosave-pulse shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
              <span className="hidden lg:inline">Tersimpan Otomatis</span>
            </span>
          )}

          {/* Dexie IndexedDB Batch Sync & Network Status Badge */}
          <div
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-md font-semibold border hidden sm:flex items-center gap-1 tabular-nums transition-all",
              !syncStatus.isOnline
                ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
                : syncStatus.isSyncing
                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30"
                  : syncStatus.pendingQueueCount > 0
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                    : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
            )}
            title={
              !syncStatus.isOnline
                ? `Mode Offline: Tersimpan di IndexedDB (${syncStatus.pendingQueueCount} antrean)`
                : syncStatus.isSyncing
                  ? 'Sedang menyinkronkan antrean ke server...'
                  : syncStatus.pendingQueueCount > 0
                    ? `Menunggu batch sync (${syncStatus.pendingQueueCount} antrean)`
                    : 'Tersinkronisasi Penuh'
            }
          >
            {!syncStatus.isOnline ? (
              <>
                <WifiOff className="w-2.5 h-2.5 shrink-0" />
                <span>Offline ({syncStatus.pendingQueueCount})</span>
              </>
            ) : syncStatus.isSyncing ? (
              <>
                <RefreshCw className="w-2.5 h-2.5 shrink-0 animate-spin" />
                <span>Sync...</span>
              </>
            ) : syncStatus.pendingQueueCount > 0 ? (
              <>
                <RefreshCw className="w-2.5 h-2.5 shrink-0" />
                <span>Antre ({syncStatus.pendingQueueCount})</span>
              </>
            ) : (
              <>
                <Wifi className="w-2.5 h-2.5 shrink-0" />
                <span className="hidden md:inline">Online</span>
              </>
            )}
          </div>

          {flaggedCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1 border border-amber-500/20 tabular-nums">
              <Flag className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
              {flaggedCount}
            </span>
          )}
        </div>

        {/* Right Section: Mode Pill, Text Scaler, Scratchpad, Fullscreen, Submit */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Display Mode Selector */}
          <div className="hidden md:flex items-center bg-muted/40 border border-border/60 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => handleModeChange('1')}
              className={cn("px-2.5 py-1 rounded-md text-xs font-medium transition-all", displayMode === '1' ? "bg-card text-foreground shadow-2xs font-semibold" : "text-muted-foreground hover:text-foreground")}
              title="1 Soal per layar (Fokus Penuh)"
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

          {/* Floating Scratchpad Trigger */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setScratchpadOpen(prev => !prev);
              if (scratchpadMinimized) setScratchpadMinimized(false);
            }}
            className={cn(
              "h-8 px-2 rounded-lg text-xs font-semibold gap-1.5 transition-colors",
              scratchpadOpen ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground"
            )}
            title="Buka Lembar Coretan & Hitungan PiP (Tekan 'S' atau 'C')"
          >
            <FileEdit className="w-4 h-4" />
            <span className="hidden xl:inline text-[11px]">Coretan</span>
          </Button>

          {/* Keyboard Shortcuts Helper Trigger */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setHelpOpen(true)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-lg hidden sm:flex"
            title="Pintasan Keyboard & Panduan Cepat (Tekan '?')"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>

          {/* Fullscreen Toggle */}
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-lg hidden sm:flex"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>

          {/* Confident Submit Button */}
          <Button
            size="sm"
            onClick={() => setShowConfirm(true)}
            className="h-8 px-3.5 text-xs font-semibold rounded-lg bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs transition-all"
          >
            Kumpulkan
          </Button>
        </div>
      </header>

      {/* PRIMARY ZERO-DISTRACTION QUESTION CANVAS */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        <div className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
          {/* Scrollable Question Content Area */}
          <div
            ref={scrollRef}
            className={cn(
              "flex-1 overflow-y-auto custom-scrollbar exam-viewport-transition",
              displayMode === '1' && questions[currentSingleIdx]?.stimulus_content ? "p-0" : "px-4 md:px-8 py-6"
            )}
          >
            {/* MODE 1: SINGLE QUESTION (100% FOCUS) */}
            {displayMode === '1' && (
              questions[currentSingleIdx] && (() => {
                const q = questions[currentSingleIdx];
                if (q.stimulus_content) {
                  const stimulusBlocks = singleStimulusBlocks;
                  return (
                    <div className="min-h-full flex flex-col lg:flex-row overflow-hidden w-full">
                      {/* Left Stimulus Pane (Synchronized / Dual-Mode Ergonomic Split View) */}
                      <div className={cn(
                        "border-b lg:border-b-0 lg:border-r border-border/60 bg-muted/10 p-6 md:p-8 lg:overflow-y-auto custom-scrollbar transition-all duration-200",
                        splitRatio === '60' ? "w-full lg:w-[60%]" : splitRatio === '40' ? "w-full lg:w-[40%]" : "w-full lg:w-1/2"
                      )}>
                        <div className="max-w-xl mx-auto space-y-4">
                          <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/60">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-primary" />
                              <span className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                                Teks Stimulus / Kasus
                              </span>
                            </div>

                            {/* Dual-Mode Ratio Switcher (50:50, 60:40, 40:60) */}
                            <div className="hidden lg:flex items-center bg-card border border-border/70 rounded-lg p-0.5 text-[10px]">
                              <button
                                onClick={() => setSplitRatio('50')}
                                className={cn("px-2 py-0.5 rounded-md font-medium transition-all", splitRatio === '50' ? "bg-primary text-primary-foreground font-semibold shadow-2xs" : "text-muted-foreground hover:text-foreground")}
                                title="Bagi seimbang 50:50"
                              >
                                50:50
                              </button>
                              <button
                                onClick={() => setSplitRatio('60')}
                                className={cn("px-2 py-0.5 rounded-md font-medium transition-all", splitRatio === '60' ? "bg-primary text-primary-foreground font-semibold shadow-2xs" : "text-muted-foreground hover:text-foreground")}
                                title="Fokus baca teks 60:40"
                              >
                                60:40
                              </button>
                              <button
                                onClick={() => setSplitRatio('40')}
                                className={cn("px-2 py-0.5 rounded-md font-medium transition-all", splitRatio === '40' ? "bg-primary text-primary-foreground font-semibold shadow-2xs" : "text-muted-foreground hover:text-foreground")}
                                title="Fokus soal & opsi 40:60"
                              >
                                40:60
                              </button>
                            </div>
                          </div>
                          <div className={cn("leading-relaxed text-foreground/90 font-normal", textSize === 'large' ? 'text-base' : textSize === 'medium' ? 'text-[15px]' : 'text-sm')}>
                            <ContentBlockList blocks={stimulusBlocks} />
                          </div>
                        </div>
                      </div>

                      {/* Right Question Pane */}
                      <div className={cn(
                        "p-6 md:p-8 lg:overflow-y-auto custom-scrollbar bg-background transition-all duration-200",
                        splitRatio === '60' ? "w-full lg:w-[40%]" : splitRatio === '40' ? "w-full lg:w-[60%]" : "w-full lg:w-1/2"
                      )}>
                        <div className="max-w-xl mx-auto">
                          {renderQuestionCard(q, true)}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="max-w-3xl xl:max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
                    <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-xs">
                      {renderQuestionCard(q, true)}
                    </div>
                    {/* Subtle Keyboard Shortcuts Guide */}
                    <div className="mt-5 text-center text-[11px] text-muted-foreground/70 font-medium">
                      Pintasan Keyboard: [A-E] atau [1-5] Pilih Jawaban • [F] Ragu-ragu • [←] [→] Navigasi Soal
                    </div>
                  </div>
                );
              })()
            )}

            {/* MODE 2: 5 QUESTIONS PER PAGE (WITH FULL STIMULUS PRESERVATION) */}
            {displayMode === '5' && (
              <div className="max-w-4xl xl:max-w-5xl mx-auto space-y-8 py-6 px-4 sm:px-6">
                {batchItems.map((item, idx) => {
                  if (item.type === 'stimulus_group') {
                    return (
                      <StimulusRenderer key={item.stimulus_id || idx} content={item.content}>
                        <div className="space-y-4">
                          {item.questions.map(q => renderQuestionCard(q, false))}
                        </div>
                      </StimulusRenderer>
                    );
                  }
                  return (
                    <div key={item.question.id} className="animate-in fade-in duration-200">
                      {renderQuestionCard(item.question, false)}
                    </div>
                  );
                })}
              </div>
            )}

            {/* MODE 3: ALL QUESTIONS (VIRTUALIZED) */}
            {displayMode === 'all' && (
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
                className="max-w-4xl 2xl:max-w-5xl mx-auto"
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
                      className="[content-visibility:auto] [contain-intrinsic-size:auto_320px]"
                    >
                      {item.type === 'question' ? (
                        renderQuestionCard(item.question)
                      ) : (
                        <StimulusRenderer content={item.content}>
                          <div className="space-y-4">
                            {item.questions.map(q => renderQuestionCard(q))}
                          </div>
                        </StimulusRenderer>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* DOCKED BOTTOM ACTION TOOLBAR - PERSISTENT IN ALL MODES */}
          <div className="h-14 border-t border-border/60 bg-card/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shadow-2xs shrink-0 z-10">
            {/* Left: Always the Question Palette Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaletteOpen(true)}
              className="h-9 px-3 sm:px-4 rounded-xl text-xs font-semibold border-border/80 hover:bg-muted gap-2 shrink-0"
            >
              <LayoutGrid className="w-4 h-4 text-primary" />
              <span>Daftar Soal</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted font-bold tabular-nums text-foreground">
                {answeredCount}/{questions.length}
              </span>
            </Button>

            {/* Center: Mode-specific info/actions */}
            <div className="flex items-center gap-3">
              {displayMode === '1' && questions[currentSingleIdx] && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFlag(questions[currentSingleIdx].id)}
                    className={cn(
                      "h-9 px-3.5 rounded-xl text-xs font-semibold border transition-all gap-1.5",
                      flaggedMap[questions[currentSingleIdx].id]
                        ? "bg-amber-500/15 border-amber-500/50 text-amber-800 dark:text-amber-200 hover:bg-amber-500/25"
                        : "border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                    title="Beri tanda ragu-ragu pada butir soal ini (Tekan 'F')"
                  >
                    <Flag className={cn("w-3.5 h-3.5", flaggedMap[questions[currentSingleIdx].id] ? "fill-amber-500 text-amber-500" : "text-muted-foreground")} />
                    <span className="hidden sm:inline">
                      {flaggedMap[questions[currentSingleIdx].id] ? 'Batal Ragu-ragu' : 'Tandai Ragu-ragu'}
                    </span>
                    <span className="text-[10px] opacity-60 font-mono hidden md:inline">[F]</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setScratchpadOpen(prev => !prev);
                      if (scratchpadMinimized) setScratchpadMinimized(false);
                    }}
                    className={cn(
                      "h-9 px-3 rounded-xl text-xs font-semibold border border-dashed transition-all gap-1.5 hidden md:flex",
                      scratchpadOpen ? "bg-primary/10 border-primary text-primary" : "border-border/80 text-muted-foreground hover:text-foreground"
                    )}
                    title="Buka / Tutup Lembar Coretan Mengapung (Tekan 'S' / 'C')"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Coretan</span>
                    <span className="text-[10px] opacity-60 font-mono">[S]</span>
                  </Button>
                </div>
              )}

              {displayMode === '5' && (
                <div className="text-xs font-semibold text-muted-foreground hidden sm:block">
                  Halaman <span className="text-foreground font-bold tabular-nums">{currentBatchPage}</span> dari {Math.ceil(questions.length / 5)} (Soal {(currentBatchPage - 1) * 5 + 1}–{Math.min(currentBatchPage * 5, questions.length)})
                </div>
              )}

              {displayMode === 'all' && (
                <div className="text-xs font-semibold text-muted-foreground hidden sm:block">
                  Menampilkan Semua <span className="text-foreground font-bold tabular-nums">{questions.length}</span> Soal
                </div>
              )}
            </div>

            {/* Right: Navigation / Submit Action */}
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

                  {currentSingleIdx >= questions.length - 1 ? (
                    <Button
                      size="sm"
                      onClick={() => setShowConfirm(true)}
                      className="font-semibold gap-1.5 rounded-xl h-9 px-4 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs text-xs"
                    >
                      <span>Tinjau & Kumpulkan</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentSingleIdx(prev => Math.min(questions.length - 1, prev + 1))}
                      className="font-semibold gap-1.5 rounded-xl h-9 px-3.5 border-border/80 hover:bg-muted text-xs"
                    >
                      <span className="hidden sm:inline">Selanjutnya</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </>
              )}

              {displayMode === '5' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentBatchPage === 1}
                    onClick={() => {
                      const newPage = Math.max(1, currentBatchPage - 1);
                      setCurrentBatchPage(newPage);
                      setCurrentSingleIdx((newPage - 1) * 5);
                    }}
                    className="font-semibold gap-1.5 rounded-xl h-9 px-3.5 border-border/80 hover:bg-muted text-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Hal Sebelumnya</span>
                  </Button>

                  {currentBatchPage >= Math.ceil(questions.length / 5) ? (
                    <Button
                      size="sm"
                      onClick={() => setShowConfirm(true)}
                      className="font-semibold gap-1.5 rounded-xl h-9 px-4 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs text-xs"
                    >
                      <span>Tinjau & Kumpulkan</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPage = Math.min(Math.ceil(questions.length / 5), currentBatchPage + 1);
                        setCurrentBatchPage(newPage);
                        setCurrentSingleIdx((newPage - 1) * 5);
                      }}
                      className="font-semibold gap-1.5 rounded-xl h-9 px-3.5 border-border/80 hover:bg-muted text-xs"
                    >
                      <span className="hidden sm:inline">Hal Selanjutnya</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </>
              )}

              {displayMode === 'all' && (
                <Button
                  size="sm"
                  onClick={() => setShowConfirm(true)}
                  className="font-semibold gap-1.5 rounded-xl h-9 px-4 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs text-xs"
                >
                  <span>Tinjau & Kumpulkan Ujian</span>
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ON-DEMAND QUESTION PALETTE DIALOG (NO SCARY 'X' BUTTON) */}
      <Dialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <DialogContent showCloseButton={false} className="max-w-3xl max-h-[90vh] flex flex-col p-0 rounded-2xl overflow-hidden border-border/80 shadow-2xl">
          {/* Palette Header */}
          <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between bg-muted/20 shrink-0">
            <div className="space-y-0.5">
              <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-primary" />
                Daftar Nomor Soal ({questions.length} Butir)
              </h2>
              <p className="text-xs text-muted-foreground">
                Pilih nomor soal untuk melompat langsung ke soal tersebut.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaletteOpen(false)}
              className="h-8 px-3 rounded-xl text-xs font-semibold border-border/80 hover:bg-muted gap-1.5"
            >
              <ChevronDown className="w-4 h-4" />
              <span>Tutup Navigasi</span>
            </Button>
          </div>

          {/* Palette Status Bar & Filter Tabs */}
          <div className="px-6 py-3 border-b border-border/50 bg-card/60 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
            {/* Clear Legend */}
            <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-muted-foreground font-medium flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-zinc-900 dark:bg-zinc-100" />
                <span>Terjawab ({answeredCount})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                </span>
                <span>Ragu-ragu ({flaggedCount})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm border border-border/80 bg-muted/40" />
                <span>Belum Dijawab ({questions.length - answeredCount})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm border-2 border-primary bg-primary/10" />
                <span>Sedang Dibuka</span>
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-muted/50 p-0.5 rounded-lg border border-border/60 text-xs">
              <button
                onClick={() => setPaletteFilter('all')}
                className={cn("px-2.5 py-1 rounded-md text-[11px] font-medium transition-all", paletteFilter === 'all' ? "bg-card text-foreground shadow-2xs font-semibold" : "text-muted-foreground hover:text-foreground")}
              >
                Semua
              </button>
              <button
                onClick={() => setPaletteFilter('unanswered')}
                className={cn("px-2.5 py-1 rounded-md text-[11px] font-medium transition-all", paletteFilter === 'unanswered' ? "bg-card text-foreground shadow-2xs font-semibold" : "text-muted-foreground hover:text-foreground")}
              >
                Belum ({questions.length - answeredCount})
              </button>
              <button
                onClick={() => setPaletteFilter('flagged')}
                className={cn("px-2.5 py-1 rounded-md text-[11px] font-medium transition-all", paletteFilter === 'flagged' ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 shadow-2xs font-semibold" : "text-muted-foreground hover:text-foreground")}
              >
                Ragu ({flaggedCount})
              </button>
            </div>
          </div>

          {/* 50-Number Grid */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
              {filteredPaletteQuestions.map((q) => {
                const originalIndex = questions.findIndex(item => item.id === q.id);
                const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
                const isFlag = !!flaggedMap[q.id];
                const isCurrent = displayMode === '1' && currentSingleIdx === originalIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      jumpToQuestion(q.id.toString());
                      setPaletteOpen(false);
                    }}
                    className={cn(
                      "h-10 w-full text-xs font-semibold tabular-nums rounded-xl flex items-center justify-center relative transition-all border cursor-pointer select-none",
                      isCurrent && "ring-2 ring-primary ring-offset-2 dark:ring-offset-card scale-[1.03] z-10",
                      isFlag
                        ? "border-amber-500 bg-amber-500/15 text-amber-800 dark:text-amber-200"
                        : isAnswered
                          ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-2xs"
                          : "bg-card border-border/70 text-muted-foreground hover:border-zinc-400 hover:text-foreground"
                    )}
                    title={`Soal #${originalIndex + 1}`}
                  >
                    <span>{originalIndex + 1}</span>
                    {isFlag && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1.5 right-1.5 shadow-2xs" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Palette Footer */}
          <div className="px-6 py-3.5 border-t border-border/60 bg-muted/20 flex items-center justify-between gap-3 shrink-0">
            <div>
              {questions.some(q => answers[q.id] === undefined || answers[q.id] === '') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    jumpToFirstUnanswered();
                    setPaletteOpen(false);
                  }}
                  className="h-8 text-xs font-medium border-border/80 rounded-xl gap-1.5"
                >
                  <SkipForward className="w-3.5 h-3.5 text-primary" />
                  <span>Lompat ke Soal Kosong Pertama</span>
                </Button>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => setPaletteOpen(false)}
              className="h-8 px-5 rounded-xl text-xs font-semibold bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Kembali ke Soal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CONFIRM SUBMISSION DIALOG (NO SCARY 'X' BUTTON) */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent showCloseButton={false} className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground">
              Konfirmasi Pengumpulan Ujian
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1 space-y-2">
              <span>Anda telah menjawab {answeredCount} dari {questions.length} butir soal yang tersedia.</span>
              {flaggedCount > 0 && (
                <span className="block font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                  Perhatian: Masih ada {flaggedCount} butir soal yang ditandai ragu-ragu.
                </span>
              )}
              {answeredCount < questions.length && (
                <strong className="block text-destructive bg-destructive/10 p-2.5 rounded-xl border border-destructive/20 font-medium">
                  Peringatan: Masih ada {questions.length - answeredCount} butir soal yang belum dijawab!
                </strong>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              className="rounded-xl text-xs font-medium"
            >
              Batal & Lanjutkan Ujian
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmit}
              className="rounded-xl text-xs font-semibold"
            >
              Ya, Kumpulkan Ujian
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BIG JUMP 1: NON-OBTRUSIVE PICTURE-IN-PICTURE / FLOATING BOTTOM-RIGHT SHEET SCRATCHPAD */}
      {scratchpadOpen && (
        <div
          className={cn(
            "fixed bottom-16 sm:bottom-4 right-2 sm:right-4 z-40 bg-card/95 backdrop-blur-md border border-border/80 shadow-2xl rounded-2xl flex flex-col transition-all duration-200 overflow-hidden",
            scratchpadMinimized
              ? "w-72 h-12"
              : "w-[94vw] sm:w-96 md:w-[420px] h-[340px] sm:h-[380px]"
          )}
        >
          {/* Scratchpad Drag/Control Bar */}
          <div className="h-11 px-4 border-b border-border/60 bg-muted/30 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-2 min-w-0">
              <FileEdit className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-semibold text-foreground truncate">
                Lembar Coretan & Rumus
              </span>
              <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">[S]</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Clear button when expanded */}
              {!scratchpadMinimized && scratchpadText && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleScratchpadChange('')}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive rounded-lg"
                  title="Bersihkan coretan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}

              {/* Minimize / Expand Toggle */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setScratchpadMinimized(prev => !prev)}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                title={scratchpadMinimized ? "Perbesar Lembar Coretan" : "Perkecil Lembar Coretan"}
              >
                {scratchpadMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              </Button>

              {/* Close Button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setScratchpadOpen(false)}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                title="Tutup Lembar Coretan"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Scratchpad Body (Visible when not minimized) */}
          {!scratchpadMinimized && (
            <div className="flex-1 flex flex-col p-3 overflow-hidden">
              <Textarea
                value={scratchpadText}
                onChange={(e) => handleScratchpadChange(e.target.value)}
                placeholder="Tulis hitungan rumus, coret eliminasi opsi, atau catatan di sini. Tersimpan otomatis..."
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                className="flex-1 text-xs leading-relaxed resize-none p-3 rounded-xl border-border/80 focus:border-primary bg-background/80 custom-scrollbar font-mono"
                autoFocus
              />
              <div className="flex items-center justify-between pt-2 px-1 text-[11px] text-muted-foreground shrink-0">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                  Tersimpan Otomatis
                </span>
                <span>{scratchpadText.length} karakter</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BIG JUMP 4: UNIVERSAL QUICK-ACTION COMMAND PALETTE (HUD MODE) */}
      <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
        <DialogContent showCloseButton={false} className="max-w-lg p-0 rounded-2xl overflow-hidden border-border/80 shadow-2xl">
          {/* Search Header */}
          <div className="px-4 py-3 border-b border-border/60 flex items-center gap-3 bg-muted/20">
            <Search className="w-4 h-4 text-primary shrink-0" />
            <input
              type="text"
              value={commandSearch}
              onChange={(e) => setCommandSearch(e.target.value)}
              placeholder="Ketik perintah atau lompat... (contoh: ragu, kosong, waktu, rasio)"
              className="flex-1 bg-transparent border-none outline-hidden text-xs text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
            <kbd className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border/60 text-muted-foreground shrink-0">ESC</kbd>
          </div>

          {/* Actions List */}
          <div className="p-2 max-h-72 overflow-y-auto custom-scrollbar space-y-1 text-xs">
            {commandActions.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                Tidak ada aksi yang sesuai dengan &quot;{commandSearch}&quot;
              </div>
            ) : (
              commandActions.map(action => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={action.onSelect}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors group cursor-pointer",
                      action.destructive ? "hover:bg-destructive/10" : "hover:bg-muted/80"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComponent className={cn("w-4 h-4", action.destructive ? "text-destructive" : action.iconColor || "text-primary")} />
                      <div>
                        <div className={cn("font-semibold", action.destructive ? "text-destructive" : "text-foreground")}>
                          {action.label}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{action.desc}</div>
                      </div>
                    </div>
                    {action.destructive ? (
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-destructive" />
                    ) : (
                      <kbd className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border/60 text-muted-foreground">
                        {action.hotkey}
                      </kbd>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="px-4 py-2 border-t border-border/60 bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Tekan <kbd className="font-mono bg-muted px-1 rounded border border-border/60 text-[10px]">?</kbd> untuk melihat semua pintasan</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCommandPaletteOpen(false)}
              className="h-6 text-[11px] rounded-lg"
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* KEYBOARD SHORTCUTS CHEATSHEET MODAL (?) */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent showCloseButton={false} className="max-w-lg p-0 rounded-2xl overflow-hidden border-border/80 shadow-2xl">
          <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" />
              <DialogTitle className="text-base font-semibold text-foreground">
                Pintasan Keyboard (Ergonomi Alami)
              </DialogTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHelpOpen(false)}
              className="h-8 px-3 rounded-xl text-xs font-semibold"
            >
              Tutup
            </Button>
          </div>

          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar text-xs">
            <div className="space-y-2">
              <div className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">Pengerjaan & Jawaban</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground">Pilih Jawaban A - E</span>
                  <div className="flex gap-1 font-mono text-[11px]">
                    <kbd className="px-1.5 py-0.5 rounded bg-card border border-border/80 font-bold">A</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-card border border-border/80 font-bold">E</kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground">Pilih Opsi 1 - 5</span>
                  <div className="flex gap-1 font-mono text-[11px]">
                    <kbd className="px-1.5 py-0.5 rounded bg-card border border-border/80 font-bold">1</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-card border border-border/80 font-bold">5</kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground">Tandai / Batal Ragu</span>
                  <kbd className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold font-mono text-[11px]">F</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground">Lompat Soal Kosong</span>
                  <kbd className="px-2 py-0.5 rounded bg-card border border-border/80 font-bold font-mono text-[11px]">J</kbd>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">Navigasi Soal</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground">Soal Sebelumnya</span>
                  <div className="flex gap-1 font-mono text-[11px]">
                    <kbd className="px-1.5 py-0.5 rounded bg-card border border-border/80 font-bold">&larr;</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-card border border-border/80 font-bold">P</kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground">Soal Selanjutnya</span>
                  <div className="flex gap-1 font-mono text-[11px]">
                    <kbd className="px-1.5 py-0.5 rounded bg-card border border-border/80 font-bold">&rarr;</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-card border border-border/80 font-bold">N</kbd>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">Alat Kognitif & Utilitas</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground">Aksi HUD Cepat</span>
                  <kbd className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 font-bold font-mono text-[11px]">K / Ctrl+K</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground">Lembar Coretan PiP</span>
                  <kbd className="px-2 py-0.5 rounded bg-card border border-border/80 font-bold font-mono text-[11px]">S / C</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground">Daftar Nomor Soal</span>
                  <kbd className="px-2 py-0.5 rounded bg-card border border-border/80 font-bold font-mono text-[11px]">Q / G</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground">Sembunyikan Timer</span>
                  <kbd className="px-2 py-0.5 rounded bg-card border border-border/80 font-bold font-mono text-[11px]">T</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground">Siklus Rasio Split</span>
                  <kbd className="px-2 py-0.5 rounded bg-card border border-border/80 font-bold font-mono text-[11px]">V</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground">Tutup Semua Modal</span>
                  <kbd className="px-2 py-0.5 rounded bg-card border border-border/80 font-bold font-mono text-[11px]">ESC</kbd>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* FOCUS TRACKER / TAB SWITCH OVERLAY (Mounted to document.body via Portal to prevent CSS transform hijacking) */}
      {!isFocused && mounted && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 text-center">
          <EyeOff className="w-12 h-12 text-destructive mb-3 animate-pulse" />
          <h2 className="text-xl font-semibold text-destructive mb-2">Peringatan Integritas Ujian</h2>
          <p className="max-w-md text-muted-foreground text-xs sm:text-sm mb-6 leading-relaxed">
            Anda terdeteksi berpindah tab atau meminimalkan layar browser. Tindakan ini dicatat sebagai pelanggaran etika pengerjaan.
          </p>
          <Button size="default" onClick={acknowledgeWarning} className="font-semibold rounded-xl px-5 text-xs">
            Kembali ke Ujian
          </Button>
        </div>,
        document.body
      )}
    </div>
  );
}
