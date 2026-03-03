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

  useEffect(() => {
    async function load() {
      const [testRes, attemptRes] = await Promise.all([
        supabase.from('tests').select('*').eq('id', examId).single(),
        supabase.from('attempts').select('*').eq('test_id', examId).order('finished_at', { ascending: false }).limit(1).single(),
      ]);
      if (testRes.data) {
        setTest(testRes.data as TestRow);
        try { setQuestions(parseMarkdown(testRes.data.raw_markdown)); } catch { /* ignore */ }
      }
      if (attemptRes.data) setAttempt(attemptRes.data as AttemptRow);
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

