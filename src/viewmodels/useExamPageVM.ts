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
  const [isOfflineSync, setIsOfflineSync] = useState(false);

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

  const handleSubmit = useCallback(async (answers: Record<string, string>, score: number, tipsUsedData: Record<string, { theory: number; practice: number }>, violationCount: number) => {
    let studentId = null;
    try {
      const savedStudentStr = localStorage.getItem('exaprep_student');
      if (savedStudentStr) studentId = JSON.parse(savedStudentStr).id;
    } catch { /* ignore */ }

    const payload = {
      test_id: examId,
      student_id: studentId,
      responses: answers,
      tips_used: tipsUsedData,
      score,
      status: 'finished',
      finished_at: new Date().toISOString(),
      violation_count: violationCount
    };

    if (!navigator.onLine) {
      // OFFLINE MODE
      try {
        localStorage.setItem(`exaprep_offline_sync_${examId}`, JSON.stringify(payload));
        setIsOfflineSync(true);
        setFinalScore(score);
        setSubmitted(true);
      } catch (e) {
        alert('Gagal menyimpan mode offline (Storage penuh).');
      }
      return;
    }

    // ONLINE MODE
    const { data: attemptData, error: attemptError } = await supabase.from('attempts').insert(payload).select().single();

    if (attemptError || !attemptData) {
      if (attemptError?.message?.toLowerCase().includes('fetch') || attemptError?.message?.toLowerCase().includes('network')) {
        // Network error during fetch
        localStorage.setItem(`exaprep_offline_sync_${examId}`, JSON.stringify(payload));
        setIsOfflineSync(true);
        setFinalScore(score);
        setSubmitted(true);
        return;
      }
      alert(`Gagal Mengirim Ujian: ${attemptError?.message || 'Data kosong'}`);
      return; // Halt submission
    }

    setFinalScore(score);
    setSubmitted(true);
    
    try {
      localStorage.setItem(`exaprep_finished_${examId}`, attemptData.id);
    } catch { /* ignore */ }
  }, [examId]);

  // Background Sync Mechanism
  useEffect(() => {
    const handleOnline = async () => {
      const offlineData = localStorage.getItem(`exaprep_offline_sync_${examId}`);
      if (offlineData) {
        try {
          const payload = JSON.parse(offlineData);
          payload.offline_sync_at = new Date().toISOString();
          
          const { data, error } = await supabase.from('attempts').insert(payload).select().single();
          if (!error && data) {
            localStorage.removeItem(`exaprep_offline_sync_${examId}`);
            localStorage.setItem(`exaprep_finished_${examId}`, data.id);
            setIsOfflineSync(false);
          }
        } catch { /* ignore */ }
      }
    };

    window.addEventListener('online', handleOnline);
    // Attempt sync immediately if it was stuck
    if (navigator.onLine) handleOnline();

    return () => window.removeEventListener('online', handleOnline);
  }, [examId]);

  return {
    test,
    questions,
    loading,
    error,
    submitted,
    finalScore,
    isOfflineSync,
    handleSubmit,
    router
  };
}
