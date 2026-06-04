'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { TestRow, StudentRow } from '@/lib/types';
import { StudentLogin } from '@/components/auth/StudentLogin';
import { WelcomeAnimation } from '@/components/ui/WelcomeAnimation';
import { UserCircle2, LogOut } from 'lucide-react';

export default function HomePage() {
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((test) => (
              <Card key={test.id} className="group hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base leading-snug">{test.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {test.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{test.description}</p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {test.duration_minutes} menit
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      KKM: {test.passing_grade}
                    </Badge>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Link href={`/exam/${test.id}`} className="flex-1">
                      <Button variant="default" size="sm" className="w-full text-xs">
                        Mulai
                      </Button>
                    </Link>
                    <Link href={`/exam/${test.id}/review`}>
                      <Button variant="outline" size="sm" className="text-xs">
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
    <div className="min-h-screen bg-background">
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
    </div>
  );
}
