'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { ContentBlock } from '@/lib/types';
import { parseCourseMarkdown, extractReadingTimeMinutes, type CalloutType } from '@/lib/courseParser';
import { MathRenderer } from '@/components/exam/MathRenderer';
import { DiagramRenderer } from '@/components/exam/DiagramRenderer';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import {
  Info,
  Lightbulb,
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle2,
  BookOpen,
  Copy,
  Check,
} from 'lucide-react';
import {
  db,
  getCourseProgressLocal,
  saveCourseProgressLocal,
  enqueueCourseDelta,
  type CourseProgressRecord,
} from '@/lib/db';

const DynamicChartRenderer = dynamic(
  () => import('@/components/exam/ChartRenderer').then((mod) => mod.ChartRenderer),
  {
    ssr: false,
    loading: () => (
      <div className="h-[260px] w-full flex flex-col items-center justify-center bg-muted/10 rounded-xl border border-dashed border-border/50 animate-pulse">
        <span className="text-xs text-muted-foreground font-medium">Memuat grafik data...</span>
      </div>
    ),
  }
);

interface TheoryCanvasProps {
  courseId: string;
  materialId: string;
  userId?: string;
  title: string;
  markdownContent: string;
  estimatedMinutes?: number;
  initialCompleted?: boolean;
  onMarkCompleted?: (materialId: string) => void;
  className?: string;
}

function renderFormattedInline(text: string): React.ReactNode[] {
  const TOKEN_RE = /(\*\*\*[\s\S]+?\*\*\*|___[\s\S]+?___|\*\*[\s\S]+?\*\*|__[\s\S]+?__|(?<!\*)\*(?!\*)[\s\S]+?(?<!\*)\*(?!\*)|(?<!_)_(?!_)[\s\S]+?(?<!_)_(?!_)|~~[\s\S]+?~~|`[^`]+`|==[\s\S]+?==|<u>[\s\S]+?<\/u>|<sup>[\s\S]+?<\/sup>|<sub>[\s\S]+?<\/sub>|\n)/g;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `token-${match.index}`;

    if (token === '\n') {
      nodes.push(<br key={key} />);
    } else if ((token.startsWith('***') && token.endsWith('***')) || (token.startsWith('___') && token.endsWith('___'))) {
      const inner = token.slice(3, -3);
      nodes.push(<strong key={key} className="font-semibold"><em className="italic">{inner}</em></strong>);
    } else if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__'))) {
      const inner = token.slice(2, -2);
      nodes.push(<strong key={key} className="font-semibold text-foreground">{inner}</strong>);
    } else if ((token.startsWith('*') && token.endsWith('*')) || (token.startsWith('_') && token.endsWith('_'))) {
      const inner = token.slice(1, -1);
      nodes.push(<em key={key} className="italic">{inner}</em>);
    } else if (token.startsWith('~~') && token.endsWith('~~')) {
      const inner = token.slice(2, -2);
      nodes.push(<del key={key} className="line-through text-muted-foreground">{inner}</del>);
    } else if (token.startsWith('==') && token.endsWith('==')) {
      const inner = token.slice(2, -2);
      nodes.push(<mark key={key} className="bg-amber-500/20 text-foreground px-1 py-0.5 rounded">{inner}</mark>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      const inner = token.slice(1, -1);
      nodes.push(<code key={key} className="font-mono text-[0.88em] bg-muted px-1.5 py-0.5 rounded border border-border/60 text-foreground">{inner}</code>);
    } else if (token.startsWith('<u>') && token.endsWith('</u>')) {
      const inner = token.slice(3, -4);
      nodes.push(<span key={key} className="underline underline-offset-2">{inner}</span>);
    } else if (token.startsWith('<sup>') && token.endsWith('</sup>')) {
      const inner = token.slice(5, -6);
      nodes.push(<sup key={key} className="text-xs font-semibold">{inner}</sup>);
    } else if (token.startsWith('<sub>') && token.endsWith('</sub>')) {
      const inner = token.slice(5, -6);
      nodes.push(<sub key={key} className="text-xs">{inner}</sub>);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function TypographyParagraphs({ text }: { text: string }) {
  const paragraphs = text.split(/\r?\n\s*\r?\n/);

  if (paragraphs.length <= 1) {
    const trimmed = text.trim();
    if (trimmed.startsWith('### ')) {
      return <h4 className="text-base font-semibold text-foreground mt-5 mb-2 tracking-tight">{renderFormattedInline(trimmed.slice(4))}</h4>;
    }
    if (trimmed.startsWith('## ')) {
      return <h3 className="text-xl font-semibold text-foreground mt-6 mb-2.5 tracking-tight border-b border-border/40 pb-1.5">{renderFormattedInline(trimmed.slice(3))}</h3>;
    }
    if (trimmed.startsWith('# ')) {
      return <h2 className="text-2xl font-bold text-foreground mt-7 mb-3 tracking-tight">{renderFormattedInline(trimmed.slice(2))}</h2>;
    }
    if (trimmed.startsWith('> ')) {
      return <blockquote className="border-l-4 border-primary/50 pl-4 py-1 italic my-3 text-muted-foreground bg-muted/20 rounded-r-md">{renderFormattedInline(trimmed.slice(2))}</blockquote>;
    }
    return <p className="leading-relaxed text-[1.03rem] text-foreground/90">{renderFormattedInline(text)}</p>;
  }

  return (
    <div className="space-y-4">
      {paragraphs.map((para, idx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('### ')) {
          return <h4 key={idx} className="text-base font-semibold text-foreground mt-5 mb-2 tracking-tight">{renderFormattedInline(trimmed.slice(4))}</h4>;
        }
        if (trimmed.startsWith('## ')) {
          return <h3 key={idx} className="text-xl font-semibold text-foreground mt-6 mb-2.5 tracking-tight border-b border-border/40 pb-1.5">{renderFormattedInline(trimmed.slice(3))}</h3>;
        }
        if (trimmed.startsWith('# ')) {
          return <h2 key={idx} className="text-2xl font-bold text-foreground mt-7 mb-3 tracking-tight">{renderFormattedInline(trimmed.slice(2))}</h2>;
        }
        if (trimmed.startsWith('> ')) {
          return <blockquote key={idx} className="border-l-4 border-primary/50 pl-4 py-1 italic my-3 text-muted-foreground bg-muted/20 rounded-r-md">{renderFormattedInline(trimmed.slice(2))}</blockquote>;
        }
        if (/^[-*]\s+/m.test(trimmed)) {
          const items = trimmed.split(/\r?\n/).map((l) => l.replace(/^[-*]\s+/, '').trim()).filter(Boolean);
          return (
            <ul key={idx} className="list-disc list-outside ml-6 space-y-1.5 my-3 text-[1.03rem] text-foreground/90 leading-relaxed">
              {items.map((item, itemIdx) => (
                <li key={itemIdx}>{renderFormattedInline(item)}</li>
              ))}
            </ul>
          );
        }
        if (/^\d+\.\s+/m.test(trimmed)) {
          const items = trimmed.split(/\r?\n/).map((l) => l.replace(/^\d+\.\s+/, '').trim()).filter(Boolean);
          return (
            <ol key={idx} className="list-decimal list-outside ml-6 space-y-1.5 my-3 text-[1.03rem] text-foreground/90 leading-relaxed">
              {items.map((item, itemIdx) => (
                <li key={itemIdx}>{renderFormattedInline(item)}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={idx} className="leading-relaxed text-[1.03rem] text-foreground/90">
            {renderFormattedInline(para)}
          </p>
        );
      })}
    </div>
  );
}

function CodeSnippetBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-5 rounded-lg border border-border/80 bg-zinc-950 text-zinc-100 overflow-hidden font-mono text-sm shadow-xs">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-900 border-b border-zinc-800 text-xs">
        <span className="text-zinc-400 font-semibold tracking-wider uppercase">{language || 'code'}</span>
        <Button
          variant="ghost"
          size="xs"
          onClick={handleCopy}
          className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 h-6 px-2 text-xs"
        >
          {copied ? (
            <>
              <Check className="size-3 mr-1 text-emerald-400" />
              <span>Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="size-3 mr-1" />
              <span>Salin</span>
            </>
          )}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto leading-relaxed text-xs sm:text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const CALLOUT_CONFIGS: Record<
  CalloutType,
  {
    border: string;
    bg: string;
    iconColor: string;
    titleColor: string;
    defaultTitle: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  NOTE: {
    border: 'border-blue-500/40 dark:border-blue-500/50',
    bg: 'bg-blue-50/60 dark:bg-blue-950/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    titleColor: 'text-blue-950 dark:text-blue-200',
    defaultTitle: 'Catatan Penting',
    icon: Info,
  },
  TIP: {
    border: 'border-emerald-500/40 dark:border-emerald-500/50',
    bg: 'bg-emerald-50/60 dark:bg-emerald-950/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    titleColor: 'text-emerald-950 dark:text-emerald-200',
    defaultTitle: 'Tips Konseptual',
    icon: Lightbulb,
  },
  WARNING: {
    border: 'border-amber-500/40 dark:border-amber-500/50',
    bg: 'bg-amber-50/60 dark:bg-amber-950/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    titleColor: 'text-amber-950 dark:text-amber-200',
    defaultTitle: 'Peringatan',
    icon: AlertTriangle,
  },
  IMPORTANT: {
    border: 'border-purple-500/40 dark:border-purple-500/50',
    bg: 'bg-purple-50/60 dark:bg-purple-950/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
    titleColor: 'text-purple-950 dark:text-purple-200',
    defaultTitle: 'Poin Kunci',
    icon: AlertCircle,
  },
};

function CalloutBox({
  type,
  title,
  content,
}: {
  type?: CalloutType;
  title?: string;
  content: string;
}) {
  const resolvedType = type && CALLOUT_CONFIGS[type] ? type : 'NOTE';
  const conf = CALLOUT_CONFIGS[resolvedType];
  const Icon = conf.icon;
  const displayTitle = title || conf.defaultTitle;

  return (
    <aside
      className={cn(
        'my-5 rounded-lg border-l-4 p-4 transition-colors',
        conf.border,
        conf.bg
      )}
      role="note"
      aria-label={displayTitle}
    >
      <div className="flex items-start gap-2.5 mb-2">
        <Icon className={cn('size-4 mt-0.5 shrink-0', conf.iconColor)} />
        <h5 className={cn('font-semibold text-sm tracking-tight', conf.titleColor)}>
          {displayTitle}
        </h5>
      </div>
      <div className="text-sm text-foreground/90 pl-6 leading-relaxed">
        <TypographyParagraphs text={content} />
      </div>
    </aside>
  );
}

function TheoryBlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'text':
      return <TypographyParagraphs text={block.content} />;
    case 'math-inline':
      return <MathRenderer tex={block.content} />;
    case 'math-block':
      return <MathRenderer tex={block.content} displayMode />;
    case 'callout':
      return (
        <CalloutBox
          type={block.calloutType}
          title={block.calloutTitle}
          content={block.content}
        />
      );
    case 'chart':
      return (
        <figure className="my-6 p-4 rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
          <DynamicChartRenderer block={block} />
        </figure>
      );
    case 'diagram':
      return (
        <figure className="my-6 p-4 rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
          <DiagramRenderer block={block} />
        </figure>
      );
    case 'image':
      return (
        <figure className="my-6">
          <img
            src={block.content}
            alt="Ilustrasi Materi"
            className="max-w-full h-auto rounded-lg border border-border shadow-xs object-cover"
            loading="lazy"
          />
        </figure>
      );
    case 'code-block':
      return <CodeSnippetBlock code={block.content} language={block.language} />;
    default:
      return null;
  }
}

export function TheoryCanvas({
  courseId,
  materialId,
  userId = 'guest',
  title,
  markdownContent,
  estimatedMinutes,
  initialCompleted = false,
  onMarkCompleted,
  className,
}: TheoryCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const readingTime = useMemo(() => {
    if (estimatedMinutes && estimatedMinutes > 0) return estimatedMinutes;
    return extractReadingTimeMinutes(markdownContent);
  }, [estimatedMinutes, markdownContent]);

  const parsedBlocks = useMemo(() => {
    return parseCourseMarkdown(markdownContent);
  }, [markdownContent]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const local = await getCourseProgressLocal(courseId, userId);
        if (active && local && local.completedMaterials.includes(materialId)) {
          setIsCompleted(true);
        }
      } catch (err) {
        console.warn('[TheoryCanvas] Failed loading local completion state:', err);
      }
    })();
    return () => {
      active = false;
    };
  }, [courseId, userId, materialId]);

  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (scrollHeight > 0) {
          const ratio = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
          setScrollProgress(ratio);
        }
        return;
      }

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollable = rect.height - windowHeight;
      if (totalScrollable <= 0) {
        setScrollProgress(100);
        return;
      }
      const scrolled = -rect.top;
      const progress = Math.min(100, Math.max(0, (scrolled / totalScrollable) * 100));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleToggleCompleted = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const targetState = !isCompleted;

    try {
      const existing = await getCourseProgressLocal(courseId, userId);
      let currentCompleted: string[] = existing?.completedMaterials || [];

      if (targetState) {
        if (!currentCompleted.includes(materialId)) {
          currentCompleted = [...currentCompleted, materialId];
        }
      } else {
        currentCompleted = currentCompleted.filter((id) => id !== materialId);
      }

      const updatedRecord: CourseProgressRecord = {
        id: `${courseId}_${userId}`,
        courseId,
        userId,
        completedMaterials: currentCompleted,
        exerciseScores: existing?.exerciseScores || {},
        quizScores: existing?.quizScores || {},
        overallProgress: existing?.overallProgress || 0,
        updatedAt: Date.now(),
      };

      await saveCourseProgressLocal(updatedRecord);

      if (targetState) {
        await enqueueCourseDelta({
          courseId,
          userId,
          entityType: 'MATERIAL_READ',
          entityId: materialId,
          payload: { materialId, readAt: Date.now() },
          timestamp: Date.now(),
        });
      }

      setIsCompleted(targetState);
      if (targetState && onMarkCompleted) {
        onMarkCompleted(materialId);
      }
    } catch (error) {
      console.error('[TheoryCanvas] Failed updating material progress:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, isCompleted, courseId, userId, materialId, onMarkCompleted]);

  return (
    <div ref={containerRef} className={cn('relative w-full pb-16', className)}>
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-primary/20 z-50 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <article className="mx-auto max-w-[75ch] px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-8 border-b border-border/60 pb-5">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground mb-3 font-medium">
            <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-full border border-border/40">
              <Clock className="size-3.5" />
              <span>{readingTime} menit baca</span>
            </div>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs">
                <CheckCircle2 className="size-3.5" />
                Selesai Dipelajari
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
            {title}
          </h1>
        </header>

        <div className="space-y-4">
          {parsedBlocks.map((block, idx) => (
            <TheoryBlockRenderer key={idx} block={block} />
          ))}
        </div>

        <footer className="mt-12 pt-6 border-t border-border/60">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border/70 shadow-xs">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'size-10 rounded-full flex items-center justify-center border shrink-0',
                  isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-muted border-border text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="size-5" />
                ) : (
                  <BookOpen className="size-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isCompleted ? 'Materi telah selesai dipelajari' : 'Sudah memahami materi ini?'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isCompleted
                    ? 'Kemajuan Anda tersimpan ke sistem luring dan daring.'
                    : 'Tandai materi selesai untuk memperbarui progres kurikulum.'}
                </p>
              </div>
            </div>

            <Button
              variant={isCompleted ? 'outline' : 'default'}
              size="sm"
              disabled={isSubmitting}
              onClick={handleToggleCompleted}
              className={cn(
                'w-full sm:w-auto font-medium transition-all shadow-xs',
                isCompleted
                  ? 'border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="size-4 mr-1.5" />
                  <span>Selesai (Klik untuk Batal)</span>
                </>
              ) : (
                <>
                  <Check className="size-4 mr-1.5" />
                  <span>Tandai Selesai Dibaca</span>
                </>
              )}
            </Button>
          </div>
        </footer>
      </article>
    </div>
  );
}
