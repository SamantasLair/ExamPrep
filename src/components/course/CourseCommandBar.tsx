'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronRight,
  PanelLeft,
  PanelLeftClose,
  Sparkles,
  BookOpen,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface CourseBreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface CourseCommandBarProps {
  courseTitle: string;
  courseId: string;
  categoryTitle?: string;
  chapterTitle?: string;
  subChapterTitle?: string;
  masteryPercentage?: number; // 0 - 100
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  backHref?: string;
  className?: string;
  rightSlot?: React.ReactNode;
}

export function CourseCommandBar({
  courseTitle,
  courseId,
  categoryTitle,
  chapterTitle,
  subChapterTitle,
  masteryPercentage = 0,
  sidebarOpen = true,
  onToggleSidebar,
  backHref = `/course/${courseId}`,
  className,
  rightSlot,
}: CourseCommandBarProps) {
  // SVG Radial Mastery Ring calculation
  // Radius = 14, circumference = 2 * PI * 14 ≈ 87.96
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.max(0, Math.min(100, masteryPercentage));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <header
      className={cn(
        'h-14 border-b border-border/80 bg-card/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-30 select-none shadow-2xs',
        className
      )}
      data-testid="course-command-bar"
    >
      {/* Left Section: Back Button, Sidebar Toggle & Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Back Link */}
        <Link href={backHref} className="shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs font-medium gap-1.5 text-muted-foreground hover:text-foreground rounded-lg"
            title="Kembali ke Silabus Kursus"
            aria-label="Kembali ke Silabus Kursus"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden md:inline">Silabus</span>
          </Button>
        </Link>

        {/* Sidebar Toggle Button */}
        {onToggleSidebar && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleSidebar}
            className="h-8 px-2.5 rounded-lg text-xs font-semibold border-border/70 text-foreground hover:bg-muted gap-1.5 shrink-0"
            title={sidebarOpen ? 'Sembunyikan Navigasi Kurikulum' : 'Buka Navigasi Kurikulum'}
            aria-label={sidebarOpen ? 'Sembunyikan Navigasi Kurikulum' : 'Buka Navigasi Kurikulum'}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="size-4 text-primary" />
            ) : (
              <PanelLeft className="size-4 text-primary" />
            )}
            <span className="hidden lg:inline">
              {sidebarOpen ? 'Tutup Pohon' : 'Pohon Kurikulum'}
            </span>
          </Button>
        )}

        <div className="h-4 w-px bg-border/60 shrink-0 hidden sm:block" />

        {/* Hierarchical Breadcrumb: Kursus > Kategori > Bab > Sub-bab */}
        <nav
          aria-label="Breadcrumb Navigasi Pembelajaran"
          className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0 overflow-hidden"
        >
          {/* Kursus Level */}
          <Link
            href={`/course/${courseId}`}
            className="hover:text-foreground font-semibold text-foreground/90 truncate max-w-[110px] sm:max-w-[150px] transition-colors"
            title={courseTitle}
          >
            {courseTitle}
          </Link>

          {categoryTitle && (
            <>
              <ChevronRight className="size-3.5 text-muted-foreground/60 shrink-0" />
              <span
                className="hidden md:inline truncate max-w-[120px] text-muted-foreground/90"
                title={categoryTitle}
              >
                {categoryTitle}
              </span>
            </>
          )}

          {chapterTitle && (
            <>
              <ChevronRight className="size-3.5 text-muted-foreground/60 shrink-0" />
              <span
                className="hidden xl:inline truncate max-w-[140px] text-muted-foreground/90"
                title={chapterTitle}
              >
                {chapterTitle}
              </span>
            </>
          )}

          {subChapterTitle && (
            <>
              <ChevronRight className="size-3.5 text-muted-foreground/60 shrink-0" />
              <span
                className="font-semibold text-primary truncate max-w-[140px] sm:max-w-[200px]"
                title={subChapterTitle}
              >
                {subChapterTitle}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Right Section: Radial Mastery Ring & Action Slots */}
      <div className="flex items-center gap-3 shrink-0">
        {rightSlot}

        {/* Radial Mastery Ring Indicator */}
        <div
          className="flex items-center gap-2.5 px-2.5 py-1 rounded-xl bg-muted/40 border border-border/70 text-xs shadow-2xs"
          title={`Tingkat Penguasaan Sub-bab: ${Math.round(clampedProgress)}%`}
        >
          {/* Circular Mastery SVG */}
          <div className="relative size-8 shrink-0 flex items-center justify-center">
            <svg className="size-8 -rotate-90" viewBox="0 0 36 36">
              {/* Background Track Ring */}
              <circle
                cx="18"
                cy="18"
                r={radius}
                className="stroke-muted/80 fill-none"
                strokeWidth="3"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="18"
                cy="18"
                r={radius}
                className={cn(
                  'fill-none transition-all duration-500 ease-out',
                  clampedProgress >= 100
                    ? 'stroke-emerald-500'
                    : clampedProgress >= 70
                    ? 'stroke-primary'
                    : clampedProgress >= 40
                    ? 'stroke-amber-500'
                    : 'stroke-primary/70'
                )}
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            {/* Center Percentage or Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              {clampedProgress >= 100 ? (
                <Award className="size-3.5 text-emerald-500 stroke-[2.5]" />
              ) : (
                <span className="text-[10px] font-bold font-mono tracking-tight text-foreground tabular-nums">
                  {Math.round(clampedProgress)}%
                </span>
              )}
            </div>
          </div>

          <div className="hidden sm:flex flex-col text-left leading-tight pr-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Penguasaan
            </span>
            <span className="text-xs font-semibold text-foreground">
              {clampedProgress >= 100
                ? 'Tuntas'
                : clampedProgress >= 70
                ? 'Mahir'
                : clampedProgress >= 40
                ? 'Berkembang'
                : 'Pemula'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
