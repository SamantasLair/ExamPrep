import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { parseMarkdown } from '@/lib/parser';
import type { Question, TestRow, AttemptRow } from '@/lib/types';
import { useRouter } from 'next/navigation';

export function useExamReviewVM(examId: string) {
  const router = useRouter();
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

  const responses = (attempt?.responses ?? {}) as Record<string, string>;
  const feedbackMode = (test?.show_answer ? 'graded' : 'neutral') as 'graded' | 'neutral';

  return {
    test,
    attempt,
    questions,
    loading,
    isExamActive,
    accessDenied,
    responses,
    feedbackMode,
    router
  };
}
