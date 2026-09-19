'use client';

import { useParams, useRouter } from 'next/navigation';
import { useStudentDashboardVM } from '@/viewmodels/useStudentDashboardVM';
import dynamic from 'next/dynamic';
import { AnimeBox } from '@/components/ui/AnimeBox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CourseBento } from '@/components/student/CourseBento';

const StudentTrendChart = dynamic(
  () => import('@/components/student/StudentTrendChart').then((mod) => mod.StudentTrendChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[340px] w-full flex flex-col items-center justify-center bg-muted/10 rounded-xl animate-pulse">
        <span className="text-xs text-muted-foreground">Memuat tren belajar...</span>
      </div>
    ),
  }
);

export default function StudentDashboardPage() {
  const params = useParams();
  const studentId = params.id as string;
  const router = useRouter();
  const { student, attempts, loading, error } = useStudentDashboardVM(studentId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Memuat Data Portofolio...</div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive font-bold text-lg">{error || 'Siswa tidak ditemukan'}</p>
        <Button onClick={() => router.push('/')} variant="outline">Kembali ke Beranda</Button>
      </div>
    );
  }

  const chartData = attempts.map((a, idx) => ({
    name: `Ujian ${idx + 1}`,
    attempt: `Ujian ${idx + 1}`,
    label: a.tests?.title || 'Unknown',
    score: a.score,
    testName: a.tests?.title || 'Unknown',
    date: a.finished_at ? new Date(a.finished_at).toLocaleDateString('id-ID') : 'N/A'
  }));

  const averageScore = attempts.length > 0 
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length) 
    : 0;

  return (
    <AnimeBox 
      preset="page"
      className="min-h-screen bg-muted/10 pb-10"
    >
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">{student.name}</h1>
              <p className="text-xs text-muted-foreground font-mono">{student.id}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 mt-6 max-w-7xl pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: KPI Cards + Chart */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-5">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <Card className="shadow-2xs border-border/70 hover:border-primary/40 transition-all rounded-xl">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider truncate">Ujian Selesai</p>
                    <p className="text-xl font-semibold tabular-nums leading-tight text-foreground">{attempts.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-2xs border-border/70 hover:border-primary/40 transition-all rounded-xl">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider truncate">Rata-Rata Skor</p>
                    <p className="text-xl font-semibold tabular-nums leading-tight text-foreground">{averageScore}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-2xs border-border/70 hover:border-primary/40 transition-all rounded-xl">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider truncate">Bergabung</p>
                    <p className="text-sm font-semibold leading-tight text-foreground truncate">
                      {new Date(student.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Learning Trend Chart */}
            <Card className="shadow-2xs border-border/70 rounded-xl overflow-hidden">
              <CardHeader className="bg-muted/20 border-b p-3.5 sm:p-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <TrendingUp className="w-4 h-4 text-primary" /> Tren Perkembangan Belajar
                </CardTitle>
                <Badge variant="outline" className="text-[11px] font-medium border-primary/30 text-primary">
                  {attempts.length} Titik Evaluasi
                </Badge>
              </CardHeader>
              <CardContent className="p-4 pt-6 h-[340px]">
                {attempts.length > 0 ? (
                  <StudentTrendChart chartData={chartData} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground text-sm">
                    <TrendingUp className="w-8 h-8 mb-2 opacity-30" />
                    Selesaikan ujian pertama Anda untuk melihat grafik perkembangan belajar di sini.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Exam History with Independent Internal Scroll */}
          <div className="lg:col-span-5 xl:col-span-5">
            <Card className="shadow-2xs border-border/70 rounded-xl flex flex-col h-full lg:max-h-[465px] bg-card overflow-hidden">
              <CardHeader className="bg-muted/20 border-b p-3.5 sm:p-4 flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  Riwayat Ujian
                </CardTitle>
                <Badge variant="secondary" className="text-[11px] font-medium">
                  {attempts.length} Selesai
                </Badge>
              </CardHeader>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5">
                {attempts.map((att) => {
                  const isPassing = att.score >= (att.tests?.passing_grade || 70);
                  return (
                    <div 
                      key={att.id} 
                      className="p-3.5 rounded-lg border border-border/70 bg-card hover:border-primary/40 hover:bg-muted/15 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-xs text-foreground truncate">{att.tests?.title || 'Unknown'}</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {att.finished_at ? new Date(att.finished_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${isPassing ? 'bg-green-500/10 text-green-700 dark:text-green-300' : 'bg-destructive/10 text-destructive'}`}>
                            KKM {att.tests?.passing_grade || 70}
                          </span>
                          {(att as any).violation_count > 0 ? (
                            <span className="text-[10px] font-medium bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-md">
                              {(att as any).violation_count} Pelanggaran
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium bg-green-500/10 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-md">
                              Integritas Aman
                            </span>
                          )}
                          {(att as any).offline_sync_at && (
                            <span className="text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-md">
                              Offline Sync
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-lg font-semibold tabular-nums ${isPassing ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                          {att.score}
                        </span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => router.push(`/exam/${att.test_id}/review`)}
                          className="h-7 px-2.5 text-[11px] font-medium rounded-lg border-border/80 hover:bg-muted"
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {attempts.length === 0 && (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    Belum ada riwayat ujian yang tercatat.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* INTEGRATED COURSE LEARNING BENTO */}
        <div className="mt-8">
          <CourseBento studentId={studentId} />
        </div>
      </div>
    </AnimeBox>
  );
}
