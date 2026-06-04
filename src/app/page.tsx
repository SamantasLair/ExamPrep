'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { TestRow, StudentRow } from '@/lib/types';
import { StudentLogin } from '@/components/auth/StudentLogin';
import { WelcomeAnimation } from '@/components/ui/WelcomeAnimation';
import { UserCircle2, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStudentPortalVM } from '@/viewmodels/useStudentPortalVM';

export default function HomePage() {
  const {
    loading,
    student,
    showWelcome, setShowWelcome,
    handleLogin,
    handleLogout,
    categorized
  } = useStudentPortalVM();

  function ExamGrid({ title, items, emptyText }: { title: string, items: TestRow[], emptyText: string }) {
    return (
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Badge variant="outline">{items.length}</Badge>
        </div>
        <Separator className="mb-4" />
        {items.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground border rounded-xl border-dashed">
            {emptyText}
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((test, idx) => (
              <Card 
                key={test.id} 
                className="group hover:border-primary/40 hover:shadow-lg transition-all duration-300 animate-in fade-in zoom-in-95 hover:-translate-y-1 bg-card/80 backdrop-blur-sm"
                style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
              >
                <CardHeader className="p-4 pb-2 border-b border-border/40 bg-muted/20">
                  <CardTitle className="text-sm leading-snug font-bold truncate">{test.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {test.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{test.description}</p>
                  )}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                      {test.duration_minutes}m
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium border-primary/20 text-primary">
                      KKM {test.passing_grade}
                    </Badge>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-border/40">
                    <Link href={`/exam/${test.id}`} className="flex-1">
                      <Button variant="default" size="sm" className="w-full h-8 text-[11px] font-bold shadow-sm transition-transform active:scale-[0.98]">
                        Mulai
                      </Button>
                    </Link>
                    <Link href={`/exam/${test.id}/review`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full h-8 text-[11px] font-bold transition-transform active:scale-[0.98]">
                        Review
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!loading && !student) {
    return <StudentLogin onLogin={handleLogin} />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className="min-h-screen bg-background"
    >
      {showWelcome && student && (
        <WelcomeAnimation name={student.name} onComplete={() => setShowWelcome(false)} />
      )}
      {/* Hero */}
      <header className="relative overflow-hidden border-b bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl space-y-4 animate-fade-in">
              <Badge variant="secondary" className="text-xs font-medium">
                Student Portal
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
                ExaPrep
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Platform persiapan ujian minimalis berkinerja tinggi.
                Pilih paket ujian yang tersedia di bawah ini untuk memulai.
              </p>
            </div>
            
            {student && (
              <Card className="shadow-sm border-primary/20 bg-card/80 backdrop-blur w-full md:w-auto">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    {student.avatar_url ? (
                      <img src={student.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <UserCircle2 className="w-8 h-8" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground font-medium">Siswa Aktif</p>
                    <p className="font-bold text-lg leading-tight">{student.name}</p>
                    <p className="text-xs font-mono text-muted-foreground">{student.id}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleLogout} title="Keluar">
                    <LogOut className="w-5 h-5 text-muted-foreground" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-10">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-pulse text-muted-foreground text-sm">Memuat ujian bertekstur...</div>
          </div>
        ) : (
          <>
            <ExamGrid 
              title="Sedang Berlangsung / Hari Ini" 
              items={categorized.daily} 
              emptyText="Tidak ada ujian yang sedang berlangsung hari ini." 
            />
            <ExamGrid 
              title="Latihan Tersedia" 
              items={categorized.available} 
              emptyText="Tidak ada soal latihan publik yang tersedia." 
            />
            <ExamGrid 
              title="Akan Datang" 
              items={categorized.upcoming} 
              emptyText="Tidak ada jadwal ujian di waktu mendatang." 
            />
            <ExamGrid 
              title="Sudah Lewat" 
              items={categorized.past} 
              emptyText="Belum ada riwayat ujian yang terlewat." 
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-10">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          ExaPrep Exam Engine © {new Date().getFullYear()}
        </div>
      </footer>
    </motion.div>
  );
}
