'use client';

import { useParams, useRouter } from 'next/navigation';
import { useStudentDashboardVM } from '@/viewmodels/useStudentDashboardVM';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
    score: a.score,
    testName: a.tests?.title || 'Unknown',
    date: a.finished_at ? new Date(a.finished_at).toLocaleDateString('id-ID') : 'N/A'
  }));

  const averageScore = attempts.length > 0 
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length) 
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
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

      <div className="container mx-auto px-4 mt-8 space-y-6 max-w-5xl">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-sm border-border/60 hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Ujian Selesai</p>
                <p className="text-3xl font-black">{attempts.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/60 hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Rata-Rata Skor</p>
                <p className="text-3xl font-black">{averageScore}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/60 hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Bergabung Sejak</p>
                <p className="text-lg font-bold">{new Date(student.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        {attempts.length > 0 && (
          <Card className="shadow-sm border-border/60 overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Tren Perkembangan Belajar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} domain={[0, 100]} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                    // @ts-ignore: Recharts types are inaccurate for ReactNode array
                    formatter={(value: number, name: string, props: any) => [
                      <span key="score" className="font-bold">{value} <span className="font-normal text-xs text-muted-foreground">({props.payload.testName})</span></span>,
                      "Skor"
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="var(--color-primary, #3b82f6)" 
                    strokeWidth={4} 
                    dot={{ strokeWidth: 4, r: 4, fill: 'white' }} 
                    activeDot={{ r: 8, strokeWidth: 0, fill: 'var(--color-primary, #3b82f6)' }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Exam History Table */}
        <Card className="shadow-sm border-border/60">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-base font-bold">Riwayat Ujian</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b">
                <tr>
                  <th className="px-6 py-4 font-bold">Nama Ujian</th>
                  <th className="px-6 py-4 font-bold">Waktu Penyelesaian</th>
                  <th className="px-6 py-4 font-bold text-center">Integritas</th>
                  <th className="px-6 py-4 font-bold text-right">Skor Akhir</th>
                  <th className="px-6 py-4 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attempts.map((att) => (
                  <tr key={att.id} className="bg-card hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{att.tests?.title || 'Unknown'}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {att.finished_at ? new Date(att.finished_at).toLocaleString('id-ID') : '-'}
                      {(att as any).offline_sync_at && (
                        <Badge variant="outline" className="ml-2 text-[10px] bg-amber-50 text-amber-600 border-amber-200">
                          Offline Sync
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(att as any).violation_count > 0 ? (
                        <span className="text-destructive font-bold text-xs bg-destructive/10 px-2 py-1 rounded">
                          {(att as any).violation_count} Pelanggaran
                        </span>
                      ) : (
                        <span className="text-green-600 font-bold text-xs bg-green-100 px-2 py-1 rounded">
                          Aman
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-black text-lg ${att.score >= (att.tests?.passing_grade || 70) ? 'text-green-600' : 'text-red-500'}`}>
                        {att.score}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/exam/${att.test_id}/review`)}>
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
                {attempts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      Belum ada riwayat ujian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
