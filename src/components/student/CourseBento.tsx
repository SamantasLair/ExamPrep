'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { INITIAL_COURSES } from '@/lib/coursesMockData';
import { db, type CourseProgressRecord } from '@/lib/db';
import type { Course } from '@/lib/types';
import {
  BookOpen,
  GraduationCap,
  Award,
  CheckCircle2,
  Play,
  ArrowRight,
  Compass,
  Sparkles,
  Layers,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CourseBentoProps {
  studentId: string;
  className?: string;
}

interface EnrolledCourseProgress {
  course: Course;
  progress: number;
  completedUnitsCount: number;
  masteryScore: number;
}

export function CourseBento({ studentId, className }: CourseBentoProps) {
  const [courses] = useState<Course[]>(INITIAL_COURSES);
  const [progressRecords, setProgressRecords] = useState<CourseProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadStudentCourses() {
      try {
        setLoading(true);
        const records = await db.courseProgress.where('userId').equals(studentId).toArray();
        if (isMounted) {
          if (records.length > 0) {
            setProgressRecords(records);
          } else {
            // Seed sample course progress for existing students to reflect active learning in Bento
            const defaultRecords: CourseProgressRecord[] = [
              {
                id: `course-geom-01_${studentId}`,
                courseId: 'course-geom-01',
                userId: studentId,
                completedMaterials: ['mat-geom-01', 'mat-geom-02', 'mat-geom-03'],
                exerciseScores: { 'ex-geom-01': 90, 'ex-geom-02': 85 },
                quizScores: { 'quiz-geom-01': 88 },
                overallProgress: 75,
                updatedAt: Date.now() - 3600000 * 24
              },
              {
                id: `course-alj-01_${studentId}`,
                courseId: 'course-alj-01',
                userId: studentId,
                completedMaterials: ['mat-alj-01', 'mat-alj-02'],
                exerciseScores: { 'ex-alj-01': 80 },
                quizScores: {},
                overallProgress: 40,
                updatedAt: Date.now() - 3600000 * 48
              },
              {
                id: `course-kalk-01_${studentId}`,
                courseId: 'course-kalk-01',
                userId: studentId,
                completedMaterials: ['mat-kalk-01'],
                exerciseScores: {},
                quizScores: {},
                overallProgress: 20,
                updatedAt: Date.now() - 3600000 * 72
              }
            ];
            setProgressRecords(defaultRecords);
          }
        }
      } catch (err) {
        console.warn('[CourseBento] Failed to read IndexedDB courseProgress:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (studentId) {
      loadStudentCourses();
    }
    return () => {
      isMounted = false;
    };
  }, [studentId]);

  // Map active enrolled courses with enriched progress & metrics
  const activeEnrolled = useMemo<EnrolledCourseProgress[]>(() => {
    const map = new Map<string, CourseProgressRecord>();
    progressRecords.forEach((rec) => map.set(rec.courseId, rec));

    return courses
      .filter((c) => map.has(c.id))
      .map((course) => {
        const rec = map.get(course.id)!;
        const progress = Math.min(100, Math.max(0, rec.overallProgress || 0));
        const completedUnitsCount = (rec.completedMaterials?.length || 0) +
          Object.keys(rec.exerciseScores || {}).length +
          Object.keys(rec.quizScores || {}).length;

        // Calculate mastery score from quizzes and exercises
        const quizScores = Object.values(rec.quizScores || {});
        const exerciseScores = Object.values(rec.exerciseScores || {});
        const allScores = [...quizScores, ...exerciseScores];
        const masteryScore = allScores.length > 0
          ? Math.round(allScores.reduce((acc, curr) => acc + curr, 0) / allScores.length)
          : Math.round(progress * 0.9);

        return {
          course,
          progress,
          completedUnitsCount,
          masteryScore
        };
      })
      .sort((a, b) => b.progress - a.progress);
  }, [courses, progressRecords]);

  // Metrics calculation
  const totalCoursesEnrolled = activeEnrolled.length;
  const averageMasteryScore = totalCoursesEnrolled > 0
    ? Math.round(activeEnrolled.reduce((acc, curr) => acc + curr.masteryScore, 0) / totalCoursesEnrolled)
    : 0;
  const totalCompletedUnits = activeEnrolled.reduce((acc, curr) => acc + curr.completedUnitsCount, 0);

  return (
    <div className={cn('space-y-4', className)}>
      {/* SECTION HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-1.5">
              Program Kursus & Modul Belajar
            </h2>
            <p className="text-xs text-muted-foreground">
              Progres kurikulum terstruktur dan evaluasi unit pembelajaran aktif
            </p>
          </div>
        </div>

        <Link href="/course">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-medium rounded-lg gap-1.5 border-border/80 hover:bg-muted self-start sm:self-auto"
          >
            <Compass className="w-3.5 h-3.5 text-primary" />
            <span>Katalog Kursus</span>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
          </Button>
        </Link>
      </div>

      {/* METRIC KPI BENTO CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Card className="shadow-2xs border-border/70 hover:border-primary/40 transition-all rounded-xl">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider truncate">Total Kursus Diikuti</p>
              <p className="text-xl font-semibold tabular-nums leading-tight text-foreground">
                {totalCoursesEnrolled}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-border/70 hover:border-primary/40 transition-all rounded-xl">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider truncate">Rata-Rata Mastery Score</p>
              <p className="text-xl font-semibold tabular-nums leading-tight text-foreground">
                {averageMasteryScore}
                <span className="text-xs text-muted-foreground font-normal ml-1 font-mono">/ 100</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-border/70 hover:border-primary/40 transition-all rounded-xl">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider truncate">Unit Materi Tuntas</p>
              <p className="text-xl font-semibold tabular-nums leading-tight text-foreground">
                {totalCompletedUnits}
                <span className="text-xs text-muted-foreground font-normal ml-1">Unit</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ENROLLED ACTIVE COURSES GRID */}
      <Card className="shadow-2xs border-border/70 rounded-xl overflow-hidden bg-card">
        <CardHeader className="bg-muted/20 border-b p-3.5 sm:p-4 flex flex-row items-center justify-between shrink-0">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <Layers className="w-4 h-4 text-primary" /> Kursus Sedang Berjalan
          </CardTitle>
          <Badge variant="outline" className="text-[11px] font-medium border-primary/30 text-primary">
            {activeEnrolled.length} Modul Aktif
          </Badge>
        </CardHeader>

        <CardContent className="p-4 space-y-3.5">
          {loading ? (
            <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
              Memuat data kurikulum kursus...
            </div>
          ) : activeEnrolled.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeEnrolled.map(({ course, progress, completedUnitsCount, masteryScore }) => (
                <div
                  key={course.id}
                  className="p-4 rounded-xl border border-border/70 bg-card hover:border-primary/40 hover:bg-muted/10 transition-all flex flex-col justify-between gap-3 shadow-2xs group"
                >
                  <div className="space-y-2">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">
                          {course.level}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span>{course.estimated_hours} Jam</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        <Award className="w-3 h-3" />
                        <span>Mastery {masteryScore}</span>
                      </div>
                    </div>

                    {/* Course Title & Description */}
                    <div>
                      <h3 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    {/* Unit Finished Tag */}
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{completedUnitsCount} Unit Materi Diselesaikan</span>
                    </div>
                  </div>

                  {/* Progress Bar & Quick Action */}
                  <div className="space-y-2.5 pt-1 border-t border-border/50">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground font-medium flex items-center gap-1">
                          {progress >= 100 ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Selesai</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-primary" />
                              <span>Progres Belajar</span>
                            </>
                          )}
                        </span>
                        <span className="font-semibold tabular-nums text-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5 rounded-full" />
                    </div>

                    <Link href={`/course`} className="block w-full">
                      <Button
                        size="sm"
                        className="w-full h-7.5 text-xs font-medium rounded-lg gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Lanjutkan Belajar</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
              <p>Belum ada modul kursus aktif yang diikuti.</p>
              <Link href="/course">
                <Button variant="outline" size="sm" className="text-xs h-8 rounded-lg gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-primary" />
                  <span>Jelajahi Katalog Kursus</span>
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
