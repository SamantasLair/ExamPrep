import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { parseMarkdown } from '@/lib/parser';
import type { Question, TestRow } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { batchSyncManager } from '@/lib/batchSyncManager';
import { db } from '@/lib/db';

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
      // OFFLINE MODE via Dexie IndexedDB + BatchSyncManager
      try {
        await batchSyncManager.enqueueSubmission(examId, studentId, payload);
        localStorage.setItem(`exaprep_offline_sync_${examId}`, JSON.stringify(payload));
        setIsOfflineSync(true);
        setFinalScore(score);
        setSubmitted(true);
      } catch {
        alert('Gagal menyimpan mode offline (Storage penuh).');
      }
      return;
    }

    // ONLINE MODE
    try {
      const { data: attemptData, error: attemptError } = await supabase.from('attempts').insert(payload).select().single();

      if (attemptError || !attemptData) {
        if (attemptError?.message?.toLowerCase().includes('fetch') || attemptError?.message?.toLowerCase().includes('network')) {
          // Network error during fetch - fallback to Dexie Offline Queue
          await batchSyncManager.enqueueSubmission(examId, studentId, payload);
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
    } catch (netErr) {
      // Uncaught fetch error (network drop)
      await batchSyncManager.enqueueSubmission(examId, studentId, payload);
      localStorage.setItem(`exaprep_offline_sync_${examId}`, JSON.stringify(payload));
      setIsOfflineSync(true);
      setFinalScore(score);
      setSubmitted(true);
    }
  }, [examId]);

  // Background Sync Mechanism via BatchSyncManager
  useEffect(() => {
    const handleOnline = async () => {
      await batchSyncManager.syncAllPending();
      const finishedId = localStorage.getItem(`exaprep_finished_${examId}`);
      if (finishedId) {
        setIsOfflineSync(false);
      }
    };

    window.addEventListener('online', handleOnline);
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
