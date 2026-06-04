'use client';

import { useParams } from 'next/navigation';
import { ExamRunner } from '@/components/exam/ExamRunner';
import type { Question, TestRow } from '@/lib/types';
import { motion } from 'framer-motion';
import { useExamPageVM } from '@/viewmodels/useExamPageVM';

export default function ExamPage() {
  const params = useParams();
  const examId = params.id as string;
  const {
    test,
    questions,
    loading,
    error,
    submitted,
    finalScore,
    handleSubmit,
    router
  } = useExamPageVM(examId);

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
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className="min-h-screen bg-background"
    >
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
          enableTipPenalty={test?.enable_tip_penalty ?? false}
          penaltyTheoryConfig={test?.penalty_theory_config ?? '10, 15, 20, ...'}
          penaltyPracticeConfig={test?.penalty_practice_config ?? '15, 20, 25, ...'}
        />
      </div>
    </motion.div>
  );
}
