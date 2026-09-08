'use client';

import { useParams } from 'next/navigation';
import { ExamRunner } from '@/components/exam/ExamRunner';
import { useExamPageVM } from '@/viewmodels/useExamPageVM';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Award, ArrowLeft } from 'lucide-react';

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
    isOfflineSync,
    handleSubmit,
    router
  } = useExamPageVM(examId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground text-xs">Memuat ujian...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive text-sm font-medium">{error}</p>
        <Button onClick={() => router.push('/')} variant="outline" size="sm" className="rounded-lg">
          Kembali ke Portal
        </Button>
      </div>
    );
  }

  if (submitted) {
    const isPassing = finalScore >= (test?.passing_grade ?? 70);

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/10 select-none">
        <div className="w-full max-w-sm rounded-xl border border-border/70 bg-card p-6 shadow-2xs text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-base font-semibold text-foreground tracking-tight">
              Ujian Berhasil Dikumpulkan
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {test?.title || 'Evaluasi Pembelajaran'}
            </p>
          </div>

          {isOfflineSync && (
            <div className="bg-amber-500/10 text-amber-800 dark:text-amber-200 p-2.5 rounded-lg text-xs font-medium border border-amber-500/20 text-left">
              Menunggu Sinkronisasi: Lembar jawaban tersimpan aman secara lokal dan otomatis tersinkronisasi saat koneksi pulih.
            </div>
          )}

          <div className="py-2 border-y border-border/50">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Skor Akhir</p>
            <p className="text-4xl font-semibold tabular-nums text-foreground tracking-tight">{finalScore}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground tabular-nums">KKM: {test?.passing_grade ?? 70}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${isPassing ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-destructive/10 text-destructive'}`}>
                {isPassing ? 'LULUS' : 'REMEDIAL'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => router.push(`/exam/${examId}/review`)}
              className="w-full h-9 text-xs font-medium rounded-lg gap-1.5 shadow-2xs"
            >
              <Award className="w-3.5 h-3.5" />
              Lihat Pembahasan Soal
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full h-9 text-xs font-medium rounded-lg border-border/80 hover:bg-muted"
            >
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      <ExamRunner
        testTitle={test?.title ?? 'Ujian'}
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
  );
}
