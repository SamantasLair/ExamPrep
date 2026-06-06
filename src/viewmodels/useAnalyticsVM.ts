import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { AttemptRow, Question } from '@/lib/types';
import { parseMarkdown } from '@/lib/parser';

export interface ItemAnalysis {
  questionId: string;
  type: string;
  p: number; // Difficulty Index
  totalAttempts: number;
  correctAttempts: number;
  status: 'too_easy' | 'too_hard' | 'ideal';
}

export function useAnalyticsVM(testId: string | null) {
  const [analysis, setAnalysis] = useState<ItemAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function analyze() {
      if (!testId) {
        setAnalysis([]);
        return;
      }
      setLoading(true);
      setError('');

      try {
        // 1. Fetch the test to get raw questions (to know correct answers)
        const { data: testData, error: testErr } = await supabase
          .from('tests')
          .select('raw_markdown')
          .eq('id', testId)
          .single();

        if (testErr || !testData) throw new Error('Gagal mengambil soal ujian.');
        
        let questions: Question[] = [];
        try {
          questions = parseMarkdown(testData.raw_markdown);
        } catch {
          throw new Error('Gagal mem-parsing soal.');
        }

        // 2. Fetch IRT data from Server-Side RPC
        const { data: irtData, error: irtErr } = await supabase
          .rpc('calculate_irt', { p_test_id: testId });

        if (irtErr) throw new Error('Gagal menghitung analitik di server: ' + irtErr.message);

        if (!irtData || irtData.length === 0) {
          setAnalysis([]);
          setLoading(false);
          return;
        }

        // 3. Map results
        const results: ItemAnalysis[] = irtData.map((row: any) => {
          const q = questions.find(x => x.id.toString() === row.question_id);
          const p = parseFloat(row.p_score);
          let status: 'too_easy' | 'too_hard' | 'ideal' = 'ideal';
          if (p < 0.3) status = 'too_hard';
          else if (p > 0.8) status = 'too_easy';

          return {
            questionId: row.question_id,
            type: q ? q.type : 'MCQ',
            p,
            totalAttempts: row.total_count,
            correctAttempts: row.correct_count,
            status
          };
        });

        setAnalysis(results);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    analyze();
  }, [testId]);

  return { analysis, loading, error };
}
