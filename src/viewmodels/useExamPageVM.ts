import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { parseMarkdown } from '@/lib/parser';
import type { Question, TestRow } from '@/lib/types';
import { useRouter } from 'next/navigation';

export function useExamPageVM(examId: string) {
  const router = useRouter();
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

  const handleSubmit = useCallback(async (answers: Record<string, string>, score: number, tipsUsedData: Record<string, { theory: number; practice: number }>) => {
    let studentId = null;
    try {
      const savedStudentStr = localStorage.getItem('exaprep_student');
      if (savedStudentStr) studentId = JSON.parse(savedStudentStr).id;
    } catch { /* ignore */ }

    const { data: attemptData, error: attemptError } = await supabase.from('attempts').insert({
      test_id: examId,
      student_id: studentId,
      responses: answers,
      tips_used: tipsUsedData,
      score,
      status: 'finished',
      finished_at: new Date().toISOString(),
    }).select().single();

    if (attemptError || !attemptData) {
      alert('Gagal Mengirim Ujian: RLS Supabase memblokir INSERT data ujian. Hubungi administrator (buat Policy INSERT untuk tabel attempts di Supabase).');
      return; // Halt submission so they don't lose progress
    }

    setFinalScore(score);
    setSubmitted(true);
    
    try {
      localStorage.setItem(`exaprep_finished_${examId}`, attemptData.id);
    } catch { /* ignore */ }
  }, [examId]);

  return {
    test,
    questions,
    loading,
    error,
    submitted,
    finalScore,
    handleSubmit,
    router
  };
}
