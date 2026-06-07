'use client';

import { useParams } from 'next/navigation';
import { QuestionRenderer } from '@/components/exam/QuestionRenderer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Question, TestRow, AttemptRow } from '@/lib/types';
import { motion } from 'framer-motion';
import { useExamReviewVM } from '@/viewmodels/useExamReviewVM';

export default function ReviewPage() {
  const params = useParams();
  const examId = params.id as string;
  const {
    test,
    attempt,
    questions,
    loading,
    isExamActive,
    accessDenied,
    responses,
    feedbackMode,
    router
  } = useExamReviewVM(examId);

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

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className="min-h-screen bg-background"
    >
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
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
    </motion.div>
  );
}

