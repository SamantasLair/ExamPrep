'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CourseCatalog } from '@/components/course/CourseCatalog';
import { Button } from '@/components/ui/button';
import { AnimeBox } from '@/components/ui/AnimeBox';
import {
  ArrowLeft,
  BookOpen,
  Compass,
  Sparkles,
  BarChart2,
  GraduationCap
} from 'lucide-react';
import type { StudentRow } from '@/lib/types';

export default function CourseDiscoveryPage() {
  const [student, setStudent] = useState<StudentRow | null>(null);

  useEffect(() => {
    const savedStudentStr = localStorage.getItem('exaprep_student');
    if (savedStudentStr) {
      try {
        setStudent(JSON.parse(savedStudentStr));
      } catch {
        /* ignore invalid local storage */
      }
    }
  }, []);

  return (
    <AnimeBox
      preset="page"
      className="min-h-screen flex flex-col bg-background text-foreground select-none"
    >
      {/* MODERN COMMAND BAR (Slim 52px, Sticky Header) */}
      <header className="h-13 border-b border-border/60 bg-card/90 backdrop-blur-md sticky top-0 z-20 px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs font-medium gap-1.5 text-muted-foreground hover:text-foreground rounded-lg"
              title="Kembali ke Beranda Portal"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Beranda</span>
            </Button>
          </Link>
          <div className="h-4 w-px bg-border/60" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-foreground">Katalog Kursus</span>
              <span className="text-muted-foreground/40 text-xs mx-1.5 hidden sm:inline">•</span>
              <span className="text-xs text-muted-foreground hidden sm:inline font-normal">
                Eksplorasi Modul Pembelajaran
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {student && (
            <Link href={`/student/${student.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-medium rounded-lg gap-1.5 border-border/70 hover:bg-muted"
              >
                <BarChart2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="hidden md:inline">Portofolio Siswa</span>
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* DISCOVERY HERO & CONTENT */}
      <main className="flex-1 container mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8 space-y-6">
        {/* Hero Banner Section */}
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-linear-to-r from-card via-card/90 to-primary/5 p-6 md:p-8 shadow-2xs">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-semibold text-primary">
              <Sparkles className="w-3 h-3" />
              <span>Kurikulum Terstruktur & Adaptif</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Perdalam Pemahaman Konsep Melalui Modul Terintegrasi
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Pelajari materi sains, matematika murni, dan penalaran analitik dengan silabus modular bertingkat,
              dilengkapi latihan interaktif dan evaluasi kuis terukur.
            </p>
          </div>

          {/* Abstract Pattern Graphic */}
          <div className="absolute right-4 bottom-2 opacity-5 pointer-events-none hidden md:block">
            <GraduationCap className="w-48 h-48" />
          </div>
        </div>

        {/* Course Catalog Component */}
        <CourseCatalog studentId={student?.id || null} />
      </main>

      {/* FOOTER BAR */}
      <footer className="border-t border-border/60 py-4 px-6 text-center text-xs text-muted-foreground bg-card/30">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">ExaPrep Course Learning Engine</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Desain adaptif sesuai standar kompetensi SMA, SNBT UTBK, dan Olimpiade Sains.
          </p>
        </div>
      </footer>
    </AnimeBox>
  );
}
