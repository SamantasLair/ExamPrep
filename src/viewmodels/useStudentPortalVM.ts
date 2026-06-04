import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { TestRow, StudentRow } from '@/lib/types';

export function useStudentPortalVM() {
  const [tests, setTests] = useState<TestRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Auth State
  const [student, setStudent] = useState<StudentRow | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    async function loadAuthAndTests() {
      // Check auth first
      const savedStudentStr = localStorage.getItem('exaprep_student');
      if (savedStudentStr) {
        try {
          const parsed = JSON.parse(savedStudentStr);
          setStudent(parsed);
        } catch { /* ignore */ }
      }

      // Load tests
      const { data } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setTests(data as TestRow[]);
      setLoading(false);
    }
    loadAuthAndTests();
  }, []);

  const handleLogin = (s: StudentRow) => {
    localStorage.setItem('exaprep_student', JSON.stringify(s));
    setStudent(s);
    setShowWelcome(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('exaprep_student');
    setStudent(null);
  };

  const categorized = useMemo(() => {
    const now = new Date();
    const available: TestRow[] = [];
    const daily: TestRow[] = [];
    const upcoming: TestRow[] = [];
    const past: TestRow[] = [];

    for (const t of tests) {
      if (!t.start_at && !t.end_at) {
        available.push(t);
      } else if (t.start_at && t.end_at) {
        const start = new Date(t.start_at);
        const end = new Date(t.end_at);
        if (now >= start && now <= end) daily.push(t);
        else if (now < start) upcoming.push(t);
        else past.push(t);
      } else if (t.start_at && !t.end_at) {
         const start = new Date(t.start_at);
         if (now >= start) daily.push(t);
         else upcoming.push(t);
      } else if (!t.start_at && t.end_at) {
         const end = new Date(t.end_at);
         if (now <= end) daily.push(t);
         else past.push(t);
      }
    }
    return { available, daily, upcoming, past };
  }, [tests]);

  return {
    tests,
    loading,
    student,
    showWelcome, setShowWelcome,
    handleLogin,
    handleLogout,
    categorized
  };
}
