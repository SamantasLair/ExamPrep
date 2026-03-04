'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { parseMarkdown } from '@/lib/parser';
import { ExamRunner } from '@/components/exam/ExamRunner';
import type { Question, TestRow } from '@/lib/types';

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const [test, setTest] = useState<TestRow | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    async function loadExam() {
      const { data, error: fetchErr } = await supabase
        .from('tests')
        .select('*')
        .eq('id', examId)
        .single();
      if (fetchErr || !data) {
        setError('Ujian tidak ditemukan.');
        setLoading(false);
        return;
      }
      setTest(data as TestRow);
      try {
        setQuestions(parseMarkdown(data.raw_markdown));
      } catch {
        setError('Gagal mem-parsing soal ujian.');
      }
      setLoading(false);
    }
    loadExam();
  }, [examId]);

  const handleSubmit = useCallback(async (answers: Record<string, string>, score: number) => {
    setFinalScore(score);
    setSubmitted(true);
    await supabase.from('attempts').insert({
      test_id: examId,
      responses: answers,
      score,
      status: 'finished',
      finished_at: new Date().toISOString(),
    });
  }, [examId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Memuat ujian...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive">{error}</p>
        <button onClick={() => router.push('/')} className="text-sm underline">Kembali</button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold">Ujian Selesai!</h1>
          <p className="text-4xl font-bold text-primary">{finalScore}</p>
          <p className={`text-sm font-semibold ${finalScore >= (test?.passing_grade ?? 70) ? 'text-green-600' : 'text-red-500'}`}>
            KKM: {test?.passing_grade ?? 70} {finalScore >= (test?.passing_grade ?? 70) ? 'LULUS' : 'BELUM LULUS'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/exam/${examId}/review`)}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
          >
            Lihat Pembahasan
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-accent transition"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-lg font-bold">{test?.title ?? 'Ujian'}</h1>
        </div>
      </header>
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <ExamRunner
          questions={questions}
          durationMinutes={test?.duration_minutes ?? 60}
          examId={examId}
          onSubmit={handleSubmit}
          immediateFeedback={test?.immediate_feedback ?? false}
        />
      </div>
    </div>
  );
}
