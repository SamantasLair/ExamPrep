import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Question } from '@/lib/types';
import { getPenaltyForTip } from '@/lib/parser';

const STORAGE_KEY_PREFIX = 'exaprep_exam_';

function getStorageKey(examId: string) {
  return `${STORAGE_KEY_PREFIX}${examId}`;
}

export function useExamRunnerVM({
  questions,
  durationMinutes,
  examId,
  onSubmit,
  enableTipPenalty,
  penaltyTheoryConfig,
  penaltyPracticeConfig
}: {
  questions: Question[];
  durationMinutes: number;
  examId: string;
  onSubmit: (answers: Record<string, string>, score: number, tipsUsedData: Record<string, { theory: number; practice: number }>) => void;
  enableTipPenalty?: boolean;
  penaltyTheoryConfig?: string;
  penaltyPracticeConfig?: string;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [tipsUsed, setTipsUsed] = useState<Record<string, number[]>>({});
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submitRef = useRef<() => void>(() => {});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group consecutive questions with the same stimulus_id
  const renderItems = useMemo(() => {
    const items: ({ type: 'question'; question: Question } | { type: 'stimulus_group'; stimulus_id: string; content: string; questions: Question[] })[] = [];
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
                  tip.type === 'THEORY' ? penaltyTheoryConfig || '' : penaltyPracticeConfig || '',
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

  return {
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
  };
}
