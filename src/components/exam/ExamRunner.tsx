'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Question } from '@/lib/types';
import { QuestionRenderer } from './QuestionRenderer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface ExamRunnerProps {
  questions: Question[];
  durationMinutes: number;
  examId: string;
  onSubmit: (answers: Record<string, string>, score: number) => void;
}

const STORAGE_KEY_PREFIX = 'lexe_exam_';

function getStorageKey(examId: string) {
  return `${STORAGE_KEY_PREFIX}${examId}`;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function ExamRunner({ questions, durationMinutes, examId, onSubmit }: ExamRunnerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(getStorageKey(examId));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.currentIdx !== undefined) setCurrentIdx(parsed.currentIdx);
        if (parsed.timeLeft !== undefined) setTimeLeft(parsed.timeLeft);
      }
    } catch { /* ignore corrupted data */ }
  }, [examId]);

  // Persist to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey(examId), JSON.stringify({
        answers, currentIdx, timeLeft,
      }));
    } catch { /* storage full, ignore */ }
  }, [answers, currentIdx, timeLeft, examId]);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = useCallback((qId: number, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  }, []);

  const calculateScore = useCallback(() => {
    const mcqs = questions.filter((q) => q.type === 'MCQ');
    if (mcqs.length === 0) return 0;
    const correct = mcqs.filter((q) => answers[q.id] === q.correctAnswer).length;
    return Math.round((correct / mcqs.length) * 100);
  }, [questions, answers]);

  const handleSubmit = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const score = calculateScore();
    localStorage.removeItem(getStorageKey(examId));
    onSubmit(answers, score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, calculateScore, examId, onSubmit]);

  const answeredCount = Object.keys(answers).length;
  const progressPct = (answeredCount / questions.length) * 100;
  const isTimeLow = timeLeft < 60;

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <Card>
        <CardContent className="py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Badge variant={isTimeLow ? 'destructive' : 'secondary'} className="font-mono text-sm px-3 py-1">
              Waktu: {formatTime(timeLeft)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {answeredCount}/{questions.length} terjawab
            </span>
          </div>
          <div className="flex-1 max-w-xs">
            <Progress value={progressPct} className="h-2" />
          </div>
          <Button variant="destructive" size="sm" onClick={() => setShowConfirm(true)}>
            Kumpulkan
          </Button>
        </CardContent>
      </Card>

      {/* Question Navigation */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Navigasi Soal</CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex flex-wrap gap-1.5">
            {questions.map((q, idx) => (
              <Button
                key={q.id}
                variant={idx === currentIdx ? 'default' : answers[q.id] ? 'secondary' : 'outline'}
                size="sm"
                className="w-9 h-9 p-0 text-xs font-mono"
                onClick={() => setCurrentIdx(idx)}
              >
                {q.id}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      {questions[currentIdx] && (
        <QuestionRenderer
          question={questions[currentIdx]}
          answer={answers[questions[currentIdx].id]}
          onAnswer={handleAnswer}
        />
      )}

      {/* Prev / Next Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
          disabled={currentIdx === 0}
        >
          ← Sebelumnya
        </Button>
        <Button
          variant="outline"
          onClick={() => setCurrentIdx((p) => Math.min(questions.length - 1, p + 1))}
          disabled={currentIdx === questions.length - 1}
        >
          Selanjutnya →
        </Button>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kumpulkan Ujian?</DialogTitle>
            <DialogDescription>
              Kamu sudah menjawab {answeredCount} dari {questions.length} soal.
              {answeredCount < questions.length && ' Masih ada soal yang belum dijawab.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleSubmit}>Ya, Kumpulkan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
