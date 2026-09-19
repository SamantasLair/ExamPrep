'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  BookOpen,
  PlayCircle,
  Lock,
  PanelLeftClose,
  PanelLeft,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CourseCategory, CourseChapter, CourseSubChapter, UserCourseProgress } from '@/lib/types';

export interface CurriculumTreeSidebarProps {
  categories: CourseCategory[];
  progress?: UserCourseProgress | null;
  activeSubChapterId?: string | null;
  onSelectSubChapter?: (subChapterId: string) => void;
  className?: string;
  isCollapsedDefault?: boolean;
}

export function CurriculumTreeSidebar({
  categories,
  progress,
  activeSubChapterId,
  onSelectSubChapter,
  className,
  isCollapsedDefault = false,
}: CurriculumTreeSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(isCollapsedDefault);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const cat of categories) {
      if (cat.chapters) {
        for (const chap of cat.chapters) {
          initial[chap.id] = true;
        }
      }
    }
    return initial;
  });

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const completedMaterialsSet = useMemo(() => {
    return new Set(progress?.completed_materials || []);
  }, [progress?.completed_materials]);

  const quizScores = progress?.quiz_scores || {};

  const getSubChapterStatus = (subChapter: CourseSubChapter) => {
    const materials = subChapter.materials || [];
    const quizzes = subChapter.quizzes || [];

    const isLocked = quizzes.some(q => {
      const score = quizScores[q.id];
      return score !== undefined && score < (q.passing_score ?? 70);
    });

    const isMaterialsDone = materials.length > 0 && materials.every(m => completedMaterialsSet.has(m.id));
    const isQuizzesDone = quizzes.length > 0 && quizzes.every(q => {
      const score = quizScores[q.id];
      return score !== undefined && score >= (q.passing_score ?? 70);
    });

    const isCompleted = (materials.length > 0 || quizzes.length > 0) &&
      (materials.length === 0 || isMaterialsDone) &&
      (quizzes.length === 0 || isQuizzesDone);

    return {
      isLocked,
      isCompleted,
      isActive: activeSubChapterId === subChapter.id
    };
  };

  if (isCollapsed) {
    return (
      <aside
        className={cn(
          'w-14 h-full flex flex-col items-center py-3 border-r bg-card/60 backdrop-blur-md shrink-0 select-none transition-all duration-300',
          className
        )}
        data-testid="curriculum-tree-sidebar-dock"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="size-9 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground mb-4"
          title="Buka Navigasi Kurikulum"
          aria-label="Buka Navigasi Kurikulum"
        >
          <PanelLeft className="size-4" />
        </Button>

        <div className="w-8 h-[1px] bg-border/60 mb-4" />

        <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col items-center gap-2 py-1 px-1">
          {categories.flatMap(cat => cat.chapters || []).map((chapter, idx) => (
            <div
              key={chapter.id}
              className="size-9 rounded-lg flex items-center justify-center bg-muted/40 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title={chapter.title}
              onClick={() => setIsCollapsed(false)}
            >
              {idx + 1}
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        'w-80 h-full flex flex-col border-r bg-card/60 backdrop-blur-md shrink-0 select-none transition-all duration-300',
        className
      )}
      data-testid="curriculum-tree-sidebar"
    >
      <div className="h-14 px-4 flex items-center justify-between border-b border-border/60">
        <div className="flex items-center gap-2 min-w-0">
          <GraduationCap className="size-5 text-primary shrink-0" />
          <h2 className="font-semibold text-sm tracking-tight truncate">Struktur Kurikulum</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(true)}
          className="size-8 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
          title="Ciutkan ke Dock Rail"
          aria-label="Ciutkan ke Dock Rail"
        >
          <PanelLeftClose className="size-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {categories.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Tidak ada materi kurikulum tersedia.
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="space-y-1.5">
              <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <Folder className="size-3.5 text-primary/70 shrink-0" />
                <span className="truncate">{category.title}</span>
              </div>

              <div className="space-y-1 pl-1">
                {(category.chapters || []).map((chapter) => {
                  const isExpanded = !!expandedChapters[chapter.id];
                  const subChapters = chapter.subchapters || [];

                  return (
                    <div key={chapter.id} className="rounded-lg overflow-hidden border border-border/30 bg-background/50">
                      <button
                        type="button"
                        onClick={() => toggleChapter(chapter.id)}
                        className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-accent/40 text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          {isExpanded ? (
                            <FolderOpen className="size-4 text-amber-500/80 shrink-0 group-hover:text-amber-500" />
                          ) : (
                            <Folder className="size-4 text-muted-foreground shrink-0 group-hover:text-foreground" />
                          )}
                          <span className="text-xs font-medium text-foreground truncate">
                            {chapter.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                            {subChapters.length}
                          </Badge>
                          {isExpanded ? (
                            <ChevronDown className="size-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="size-3.5 text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      {isExpanded && subChapters.length > 0 && (
                        <div className="border-t border-border/20 divide-y divide-border/10 bg-muted/20">
                          {subChapters.map((subChapter) => {
                            const { isLocked, isCompleted, isActive } = getSubChapterStatus(subChapter);

                            return (
                              <button
                                key={subChapter.id}
                                type="button"
                                disabled={isLocked}
                                onClick={() => !isLocked && onSelectSubChapter?.(subChapter.id)}
                                className={cn(
                                  'w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-all cursor-pointer',
                                  isActive
                                    ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/30',
                                  isLocked && 'opacity-50 cursor-not-allowed hover:bg-transparent'
                                )}
                              >
                                <div className="flex items-center gap-2 min-w-0 pr-2">
                                  {isLocked ? (
                                    <Lock className="size-3.5 text-destructive/70 shrink-0" />
                                  ) : isCompleted ? (
                                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                  ) : isActive ? (
                                    <BookOpen className="size-3.5 text-primary shrink-0 animate-pulse" />
                                  ) : (
                                    <PlayCircle className="size-3.5 text-muted-foreground/70 shrink-0" />
                                  )}
                                  <span className="truncate">{subChapter.title}</span>
                                </div>

                                {isLocked ? (
                                  <span className="text-[10px] text-destructive shrink-0 font-medium">Terkunci</span>
                                ) : isCompleted ? (
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 shrink-0 font-medium">Selesai</span>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
