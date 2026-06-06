import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { AttemptRow, TestRow, StudentRow } from '@/lib/types';

export interface EnrichedAttempt extends AttemptRow {
  tests: TestRow;
}

export function useStudentDashboardVM(studentId: string) {
  const [student, setStudent] = useState<StudentRow | null>(null);
  const [attempts, setAttempts] = useState<EnrichedAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!studentId) return;
      
      setLoading(true);
      setError('');

      try {
        // Fetch student profile
        const { data: studentData, error: studentErr } = await supabase
          .from('students')
          .select('*')
          .eq('id', studentId)
          .single();

        if (studentErr || !studentData) {
          setError('Data siswa tidak ditemukan.');
          setLoading(false);
          return;
        }
        setStudent(studentData as StudentRow);

        // Fetch attempts joined with test
        const { data: attemptsData, error: attemptsErr } = await supabase
          .from('attempts')
          .select('*, tests(*)')
          .eq('student_id', studentId)
          .order('finished_at', { ascending: true }) // Chronological order for charts
          .limit(100);

        if (!attemptsErr && attemptsData) {
          setAttempts(attemptsData as EnrichedAttempt[]);
        }
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan sistem.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [studentId]);

  return {
    student,
    attempts,
    loading,
    error
  };
}
