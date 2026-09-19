'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import type { Course, CourseLevel } from '@/lib/types';
import { INITIAL_COURSES } from '@/lib/coursesMockData';
import { db, type CourseProgressRecord } from '@/lib/db';
import {
  Search,
  BookOpen,
  Clock,
  Layers,
  Sparkles,
  CheckCircle2,
  Play,
  ArrowRight,
  Filter,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseCatalogProps {
  studentId?: string | null;
}

const SCIENTIFIC_CATEGORIES = [
  'Semua Kategori',
  'Geometri',
  'Aljabar',
  'Kalkulus',
  'Fisika',
  'Logika',
  'Statistika',
  'Teori Bilangan',
  'Bahasa Inggris'
] as const;

const LEVEL_COLORS: Record<CourseLevel, { badge: string; border: string; bg: string }> = {
  SD: {
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    border: 'border-emerald-500/30',
    bg: 'from-emerald-500/10 to-transparent'
  },
  SMP: {
    badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    border: 'border-blue-500/30',
    bg: 'from-blue-500/10 to-transparent'
  },
  SMA: {
    badge: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
    border: 'border-indigo-500/30',
    bg: 'from-indigo-500/10 to-transparent'
  },
  UTBK: {
    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    border: 'border-amber-500/30',
    bg: 'from-amber-500/10 to-transparent'
  },
  OLIMPIADE: {
    badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
    border: 'border-purple-500/30',
    bg: 'from-purple-500/10 to-transparent'
  },
  UMUM: {
    badge: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20',
    border: 'border-zinc-500/30',
    bg: 'from-zinc-500/10 to-transparent'
  }
};

export function CourseCatalog({ studentId }: CourseCatalogProps) {
  const [courses] = useState<Course[]>(INITIAL_COURSES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua Kategori');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadProgress() {
      if (!studentId) {
        // Fallback default sample progress when not logged in or testing
        setProgressMap({
          'course-geom-01': 65,
          'course-alj-01': 30
        });
        return;
      }

      try {
        const records = await db.courseProgress.where('userId').equals(studentId).toArray();
        const map: Record<string, number> = {};
        records.forEach((rec: CourseProgressRecord) => {
          map[rec.courseId] = rec.overallProgress;
        });

        // Seed sample progress if database is newly initialized
        if (Object.keys(map).length === 0) {
          map['course-geom-01'] = 75;
          map['course-kalk-01'] = 20;
        }
        setProgressMap(map);
      } catch {
        setProgressMap({
          'course-geom-01': 50
        });
      }
    }
    loadProgress();
  }, [studentId]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        selectedCategory === 'Semua Kategori' ||
        course.tags.some((tag) => tag.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        course.title.toLowerCase().includes(selectedCategory.toLowerCase());

      const matchLevel = selectedLevel === 'ALL' || course.level === selectedLevel;

      return matchSearch && matchCategory && matchLevel;
    });
  }, [courses, searchQuery, selectedCategory, selectedLevel]);

  return (
    <div className="space-y-6">
      {/* FILTER & SEARCH COCKPIT */}
      <div className="p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Instant Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kursus berdasarkan topik, konsep, atau kata kunci..."
              className="h-9 pl-9 text-xs rounded-lg border-border/70 bg-background focus:border-primary shadow-2xs"
            />
          </div>

          {/* Level Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-[11px] font-medium text-muted-foreground px-2 flex items-center gap-1 shrink-0">
              <GraduationCap className="w-3.5 h-3.5" />
              Tingkat:
            </span>
            {(['ALL', 'SMA', 'UTBK', 'OLIMPIADE'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-medium rounded-md transition-all shrink-0 cursor-pointer',
                  selectedLevel === lvl
                    ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {lvl === 'ALL' ? 'Semua Tingkat' : lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Scientific Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-border/40 scrollbar-none">
          <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground pr-2 shrink-0">
            <Filter className="w-3 h-3" />
            <span>Kategori:</span>
          </div>
          {SCIENTIFIC_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-2.5 py-1 text-[11px] rounded-md transition-all shrink-0 cursor-pointer',
                  isActive
                    ? 'bg-secondary text-secondary-foreground font-medium border border-border/80'
                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* COURSE CARDS GRID */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCourses.map((course) => {
            const progress = progressMap[course.id] ?? 0;
            const isEnrolled = progress > 0;
            const levelStyle = LEVEL_COLORS[course.level] || LEVEL_COLORS.UMUM;

            return (
              <Card
                key={course.id}
                className="rounded-xl border border-border/70 bg-card hover:border-zinc-400 dark:hover:border-zinc-600 transition-all flex flex-col justify-between overflow-hidden group shadow-2xs hover:shadow-xs"
              >
                <div>
                  {/* Visual Abstract Cover Pattern Header */}
                  <div
                    className={cn(
                      'h-28 relative p-4 flex flex-col justify-between overflow-hidden bg-linear-to-br border-b border-border/40',
                      levelStyle.bg
                    )}
                  >
                    {/* Geometric Architectural Grid Line Accent */}
                    <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

                    <div className="flex items-center justify-between relative z-10">
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5', levelStyle.badge)}
                      >
                        {course.level}
                      </Badge>
                      <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-background/80 backdrop-blur-xs px-2 py-0.5 rounded-md border border-border/50">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span>{course.estimated_hours} Jam</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 relative z-10">
                      <div className="w-7 h-7 rounded-lg bg-background/90 border border-border/60 flex items-center justify-center text-primary shadow-2xs">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-medium text-foreground tracking-tight line-clamp-1">
                        {course.tags[0] || 'Modul Pembelajaran'}
                      </span>
                    </div>
                  </div>

                  {/* Course Content Body */}
                  <div className="p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Topic Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {course.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                      {course.tags.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md text-muted-foreground/60">
                          +{course.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action & Progress Footer */}
                <div className="p-4 pt-3 border-t border-border/50 bg-muted/10 space-y-3">
                  {/* Progress Indicator */}
                  {isEnrolled ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground flex items-center gap-1 font-medium">
                          {progress >= 100 ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Selesai Dipelajari</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>Sedang Berjalan</span>
                            </>
                          )}
                        </span>
                        <span className="font-semibold tabular-nums text-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5 rounded-full" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>Kurikulum Terstruktur</span>
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground/70">Belum Dimulai</span>
                    </div>
                  )}

                  {/* Primary CTA Button */}
                  <Link href={`/course/${course.id}`} className="block w-full">
                    <Button
                      size="sm"
                      variant={isEnrolled ? 'default' : 'outline'}
                      className="w-full h-8 text-xs font-medium rounded-lg gap-1.5 shadow-2xs cursor-pointer group-hover:border-primary/50"
                    >
                      {isEnrolled ? (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>Lanjutkan Belajar</span>
                        </>
                      ) : (
                        <>
                          <span>Mulai Belajar</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed rounded-xl space-y-3 bg-card/30">
          <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
            <Search className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-foreground">Tidak ada kursus yang sesuai</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Cobalah ubah kata kunci pencarian atau pilih filter kategori keilmuan yang berbeda.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua Kategori');
              setSelectedLevel('ALL');
            }}
            className="text-xs h-8"
          >
            Reset Filter
          </Button>
        </div>
      )}
    </div>
  );
}
