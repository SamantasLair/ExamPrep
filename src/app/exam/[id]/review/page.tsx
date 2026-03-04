'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { parseMarkdown } from '@/lib/parser';
import { QuestionRenderer } from '@/components/exam/QuestionRenderer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Question, TestRow, AttemptRow } from '@/lib/types';

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const [test, setTest] = useState<TestRow | null>(null);
  const [attempt, setAttempt] = useState<AttemptRow | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExamActive, setIsExamActive] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    async function load() {
      // 1. Check if the user has a finished attempt in localStorage
      const finishedAttemptId = localStorage.getItem(`exaprep_finished_${examId}`);
      
      // If none, maybe they are still taking the test?
      if (!finishedAttemptId) {
        const activeExam = localStorage.getItem(`exaprep_exam_${examId}`);
        if (activeExam) setIsExamActive(true);
        else setAccessDenied(true);
        setLoading(false);
        return;
      }

      // 2. Fetch test and the specific attempt
      const [testRes, attemptRes] = await Promise.all([
        supabase.from('tests').select('*').eq('id', examId).single(),
        supabase.from('attempts').select('*').eq('id', finishedAttemptId).single(),
      ]);
      
      if (testRes.data) {
        setTest(testRes.data as TestRow);
        try { setQuestions(parseMarkdown(testRes.data.raw_markdown)); } catch { /* ignore */ }
      }
      if (attemptRes.data) {
        setAttempt(attemptRes.data as AttemptRow);
      } else {
        // Attempt ID invalid or deleted
        setAccessDenied(true);
      }
      setLoading(false);
    }

    load();
  }, [examId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Memuat pembahasan...</div>
      </div>
    );
  }

  if (isExamActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-xl font-bold text-destructive">Akses Ditolak</h1>
        <p className="text-muted-foreground">Selesaikan ujian terlebih dahulu untuk melihat pembahasan.</p>
        <Button onClick={() => router.push(`/exam/${examId}`)} className="mt-4">
          Kembali ke Ujian
        </Button>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-xl font-bold text-destructive">Akses Ditolak</h1>
        <p className="text-muted-foreground">Anda belum menyelesaikan ujian ini atau data sesi tidak ditemukan.</p>
        <Button onClick={() => router.push('/')} className="mt-4">
          Ke Halaman Utama
        </Button>
      </div>
    );
  }

  const responses = (attempt?.responses ?? {}) as Record<string, string>;
  const feedbackMode = test?.show_answer ? 'graded' : 'neutral';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold">Pembahasan</h1>
            <Badge variant="outline">{test?.title}</Badge>
          </div>
          <div className="flex items-center gap-3">
            {attempt && (
              <Badge variant={attempt.score >= (test?.passing_grade ?? 70) ? 'default' : 'destructive'}>
                Skor: {attempt.score}
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => router.push('/')}>
              Kembali
            </Button>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {questions.map((q) => (
              <QuestionRenderer
                key={q.id}
                question={q}
                answer={responses[q.id]}
                showDiscussion
                showCorrectAnswer
                feedbackMode={feedbackMode}
                disabled
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

