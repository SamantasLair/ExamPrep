'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimeBox } from '@/components/ui/AnimeBox';
import { CourseSyllabus } from '@/components/course/CourseSyllabus';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getCourseByIdOrSlug } from '@/lib/coursesMockData';
import { getCourseProgressLocal, type CourseProgressRecord } from '@/lib/db';
import type { Course, StudentRow, UserCourseProgress } from '@/lib/types';
import {
  ArrowLeft,
  BookOpen,
  Compass,
  BarChart2,
  AlertCircle,
  PlayCircle
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default function CourseDetailPage(props: PageProps) {
  // Unwrap Next.js 15/16 dynamic route params safely
  const resolvedParams = props.params instanceof Promise ? use(props.params) : props.params;
  const courseId = resolvedParams.id;

  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [student, setStudent] = useState<StudentRow | null>(null);
  const [progress, setProgress] = useState<UserCourseProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Resolve Course Data
    const foundCourse = getCourseByIdOrSlug(courseId);
    if (foundCourse) {
      setCourse(foundCourse);
    }

    // 2. Resolve Active Student from localStorage
    let currentStudentId: string | null = null;
    const savedStudentStr = localStorage.getItem('exaprep_student');
    if (savedStudentStr) {
      try {
        const parsed = JSON.parse(savedStudentStr);
        setStudent(parsed);
        currentStudentId = parsed.id;
      } catch {
        /* ignore parsing error */
      }
    }

    // 3. Load User Course Progress from Dexie / Local Storage
    async function loadProgress() {
      const studentIdToQuery = currentStudentId || 'EXA-001';
      try {
        const localRec = await getCourseProgressLocal(courseId, studentIdToQuery);
        if (localRec) {
          setProgress({
            id: localRec.id,
            user_id: localRec.userId,
            course_id: localRec.courseId,
            completed_materials: localRec.completedMaterials || [],
            exercise_scores: localRec.exerciseScores || {},
            quiz_scores: localRec.quizScores || {},
            overall_progress: localRec.overallProgress || 0,
            updated_at: new Date(localRec.updatedAt).toISOString()
          });
        }
      } catch {
        /* progress fallback to null */
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs text-muted-foreground font-medium">Memuat Silabus Kursus...</span>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground space-y-4">
        <Card className="p-8 max-w-md w-full text-center space-y-4 rounded-2xl border-border/70">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-foreground">Kursus Tidak Ditemukan</h2>
            <p className="text-xs text-muted-foreground">
              Modul pembelajaran dengan pengenal <span className="font-mono font-semibold">"{courseId}"</span> tidak terdaftar dalam kurikulum aktif.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/course')}
              className="text-xs cursor-pointer rounded-lg"
            >
              Kembali ke Katalog
            </Button>
            <Button
              size="sm"
              onClick={() => router.push('/')}
              className="text-xs cursor-pointer rounded-lg"
            >
              Beranda Portal
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <AnimeBox
      preset="page"
      className="min-h-screen flex flex-col bg-background text-foreground select-none"
    >
      {/* 1. UNIFIED COMMAND BAR (Slim 52px Sticky Header) */}
      <header className="h-13 border-b border-border/60 bg-card/90 backdrop-blur-md sticky top-0 z-20 px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/course">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs font-medium gap-1.5 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
              title="Kembali ke Katalog Kursus"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Katalog Kursus</span>
            </Button>
          </Link>

          <div className="h-4 w-px bg-border/60 shrink-0" />

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-sm tracking-tight text-foreground truncate block max-w-[180px] sm:max-w-xs md:max-w-md">
                {course.title}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {student && (
            <Link href={`/student/${student.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-medium rounded-lg gap-1.5 border-border/70 hover:bg-muted cursor-pointer"
              >
                <BarChart2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="hidden md:inline">Portofolio Siswa</span>
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* 2. SYLLABUS DETAIL BODY */}
      <main className="flex-1 container mx-auto max-w-5xl px-4 md:px-6 py-6 md:py-8">
        <CourseSyllabus course={course} progress={progress} />
      </main>

      {/* 3. FOOTER */}
      <footer className="border-t border-border/60 py-4 px-6 text-center text-xs text-muted-foreground bg-card/30">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 max-w-5xl">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">ExaPrep Course Learning Engine</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Silabus adaptif berstandar Kurikulum Merdeka, UTBK SNBT, dan Olimpiade Sains.
          </p>
        </div>
      </footer>
    </AnimeBox>
  );
}
