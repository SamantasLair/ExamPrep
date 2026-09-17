'use client';

import { memo } from 'react';
import type { Question } from '@/lib/types';
import { ContentBlockList } from './ContentBlockRenderer';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Lightbulb, Wrench, AlertTriangle, Flag, Check, CheckCircle2, XCircle } from 'lucide-react';
import { getPenaltyForTip } from '@/lib/parser';

type FeedbackMode = 'graded' | 'neutral';

interface QuestionRendererProps {
  question: Question;
  answer?: string;
  onAnswer?: (questionId: string | number, answer: string) => void;
  showDiscussion?: boolean;
  showOnlyDiscussion?: boolean;
  showCorrectAnswer?: boolean;
  feedbackMode?: FeedbackMode;
  disabled?: boolean;
  printMode?: boolean; // Nasty UI elements stripped out
  compactLayout?: boolean;
  answerStyle?: 'solid' | 'outlined' | 'minimalist' | 'boxed' | 'bracket';
  onUseTip?: (questionId: string | number, tipIndex: number, type: 'THEORY' | 'PRACTICE') => void;
  usedTips?: number[];
  enableTipPenalty?: boolean;
  tipPenaltyTheory?: string;
  tipPenaltyPractice?: string;
  flagged?: boolean;
  onToggleFlag?: (questionId: string | number) => void;
  textSize?: 'normal' | 'medium' | 'large';
  borderless?: boolean;
  hideHeader?: boolean;
}

export const QuestionRenderer = memo(function QuestionRenderer({
  question,
  answer,
  onAnswer,
  showDiscussion = false,
  showOnlyDiscussion = false,
  showCorrectAnswer = false,
  feedbackMode = 'graded',
  disabled = false,
  printMode = false,
  compactLayout = false,
  answerStyle = 'solid',
  onUseTip,
  usedTips = [],
  enableTipPenalty = false,
  tipPenaltyTheory = '',
  tipPenaltyPractice = '',
  flagged = false,
  onToggleFlag,
  textSize = 'normal',
  borderless = false,
  hideHeader = false,
}: QuestionRendererProps) {
  const isGraded = showCorrectAnswer && feedbackMode === 'graded';
  const isNeutral = showCorrectAnswer && feedbackMode === 'neutral';
  const isCorrect = isGraded && answer === question.correctAnswer;
  const isWrong = isGraded && answer !== undefined && answer !== question.correctAnswer;

  if (showOnlyDiscussion) {
    return (
      <div
        id={`question-card-${question.id}`}
        tabIndex={-1}
        className={cn(
          "p-5 rounded-2xl relative overflow-visible [contain:layout_style_paint]", 
          printMode ? "py-2 mt-2" : "bg-muted/40 border border-border/80"
        )}
      >
        {printMode && answerStyle === 'bracket' ? (
          <div className="absolute left-[-10px] top-0 bottom-0 w-[20px] pointer-events-none overflow-hidden">
             <span className="text-8xl font-light text-black opacity-40 leading-[0.5] select-none">(</span>
          </div>
        ) : (
          printMode && <div className="absolute left-0 top-0 bottom-0 w-1 bg-black" />
        )}
        <p className={cn("text-xs uppercase tracking-wider text-muted-foreground mb-2", !printMode && "font-bold")}>Jawaban Q{question.id}</p>
        <div className={cn(printMode ? "text-[1em]" : "text-sm")}>
          <ContentBlockList blocks={question.discussion || []} compactLayout={compactLayout} />
        </div>
      </div>
    );
  }

  const innerContent = (
    <div className="space-y-5">
      {/* Header - Hidden in Print Mode or when hideHeader is set */}
      {!printMode && !hideHeader && (
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-foreground">
              Soal {question.id}
            </span>
            <span className="text-muted-foreground/40 text-xs">•</span>
            <span className="text-xs text-muted-foreground font-medium">
              {question.type === 'MCQ' ? 'Pilihan Ganda' : 'Essay'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isGraded && (
              <Badge variant={isCorrect ? 'default' : 'destructive'} className="text-xs font-medium">
                {isCorrect ? 'Benar' : 'Salah'}
              </Badge>
            )}
            {isNeutral && answer !== undefined && (
              <Badge variant="secondary" className="text-xs font-medium">
                Jawaban: {answer}
              </Badge>
            )}
            {!isGraded && !isNeutral && !disabled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleFlag?.(question.id)}
                className={cn(
                  "h-7 px-2.5 text-xs font-medium rounded-lg border transition-colors gap-1.5",
                  flagged 
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300" 
                    : "text-muted-foreground border-transparent hover:border-border hover:bg-muted"
                )}
              >
                <Flag className={cn("w-3.5 h-3.5", flagged ? "fill-amber-500 text-amber-500" : "text-muted-foreground")} />
                <span>{flagged ? 'Ditandai Ragu' : 'Tandai Ragu'}</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Question Body with Clean Natural Typography (max-w-[75ch] line-length guard) */}
      <div className={cn(
        "font-normal leading-relaxed text-foreground/95 tracking-normal max-w-[75ch]",
        printMode ? "text-[1em]" : textSize === 'large' ? 'text-lg' : textSize === 'medium' ? 'text-base' : 'text-[15px]'
      )}>
        <ContentBlockList blocks={question.body} compactLayout={compactLayout} />
      </div>

      {/* MCQ Options with Clean Modern Natural Rows */}
      {question.type === 'MCQ' && question.options && (
        <div className="space-y-2.5 pt-1 max-w-[75ch]">
          {!printMode ? (
            <div className="space-y-2.5">
              {question.options.map((opt) => {
                const isThisCorrect = isGraded && opt.key === question.correctAnswer;
                const isThisSelected = answer === opt.key;
                const isThisWrongPick = isGraded && isThisSelected && !isThisCorrect;
                return (
                  <div
                    key={opt.key}
                    onClick={() => !disabled && onAnswer?.(question.id, opt.key)}
                    className={cn(
                      "group relative flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border transition-all duration-150 cursor-pointer select-none text-sm",
                      "hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-muted/30",
                      isThisSelected && !showCorrectAnswer && "border-primary bg-primary/[0.04] ring-1 ring-primary/25 shadow-2xs",
                      isThisCorrect && "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/25 shadow-2xs",
                      isThisWrongPick && "border-rose-500 bg-rose-500/10 ring-1 ring-rose-500/25 shadow-2xs",
                      isNeutral && isThisSelected && "border-foreground/30 bg-muted/40",
                      !isThisSelected && !isThisCorrect && !isThisWrongPick && "border-border/70 bg-card",
                      disabled && "cursor-default opacity-85 hover:border-border/70 hover:bg-card"
                    )}
                  >
                    {/* Clean Keycap Badge */}
                    <div className={cn(
                      "w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center shrink-0 border transition-all mt-0.5",
                      isThisSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-2xs animate-keycap-pop"
                        : isThisCorrect
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                          : isThisWrongPick
                            ? "bg-rose-600 text-white border-rose-600 shadow-2xs"
                            : "bg-muted/60 text-muted-foreground border-border/80 group-hover:border-zinc-400 group-hover:text-foreground"
                    )}>
                      {opt.key}
                    </div>

                    {/* Option Text Content */}
                    <div className="flex-1 text-sm font-normal leading-relaxed text-foreground/90 pt-0.5">
                      <ContentBlockList blocks={opt.body} compactLayout={compactLayout} />
                    </div>

                    {/* Selection status */}
                    <div className="shrink-0 flex items-center justify-center pt-0.5">
                      {isThisSelected && !showCorrectAnswer && (
                        <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-primary stroke-[3]" />
                        </div>
                      )}
                      {isThisCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                      {isThisWrongPick && (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // PRINT MODE OPTIONS
            <div className="space-y-1.5 pl-4">
              {question.options.map((opt) => (
                <div key={opt.key} className="flex items-start gap-2">
                  <span className="font-medium text-[0.95em]">{opt.key}.</span>
                  <div className="flex-1">
                    <ContentBlockList blocks={opt.body} compactLayout={compactLayout} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Essay Input (Only show textarea if not printing) */}
      {question.type === 'ESSAY' && !printMode && (
        <div className="pt-2">
          <Textarea
            placeholder="Tulis lembar jawaban essay Anda di sini secara runut dan lengkap..."
            value={answer || ''}
            onChange={(e) => onAnswer?.(question.id, e.target.value)}
            disabled={disabled}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            className="min-h-[140px] resize-y [field-sizing:content] rounded-xl p-4 font-normal text-sm leading-relaxed border-border/80 focus:border-primary shadow-xs"
          />
        </div>
      )}
      {question.type === 'ESSAY' && printMode && (
        <div className="border border-dashed border-gray-400 min-h-[150px] mt-4 w-full" />
      )}

      {/* Discussion */}
      {showDiscussion && question.discussion && question.discussion.length > 0 && (
        <div className={cn(
          "mt-4 p-4 sm:p-5 rounded-xl relative overflow-visible", 
          printMode ? "py-2 mt-2" : "bg-muted/40 border border-border/70"
        )}>
          {printMode && answerStyle === 'bracket' ? (
            <div className="absolute left-[-10px] top-0 bottom-0 w-[20px] pointer-events-none overflow-hidden">
               <span className="text-8xl font-light text-black opacity-40 leading-[0.5] select-none">(</span>
            </div>
          ) : (
            printMode && <div className="absolute left-0 top-0 bottom-0 w-1 bg-black" />
          )}
          <p className={cn("text-xs uppercase tracking-wider text-muted-foreground mb-2", !printMode && "font-medium")}>Jawaban & Pembahasan</p>
          <div className={cn(printMode ? "text-[1em]" : "text-sm")}>
            <ContentBlockList blocks={question.discussion || []} compactLayout={compactLayout} />
          </div>
        </div>
      )}

      {/* Tips Section */}
      {question.tips && question.tips.length > 0 && !printMode && (
        <div className="mt-4 space-y-2.5">
          {question.tips.map((tip, idx) => {
            const isTheory = tip.type === 'THEORY';
            const isUsed = usedTips.includes(idx);
            
            const sameTypeTips = question.tips!.filter(t => t.type === tip.type);
            const myTypeIndex = sameTypeTips.indexOf(tip) + 1; 
            const penaltyVal = enableTipPenalty 
               ? getPenaltyForTip(isTheory ? tipPenaltyTheory : tipPenaltyPractice, myTypeIndex)
               : 0;

            if (isUsed || disabled) {
               return (
                 <div key={idx} className={cn("p-4 rounded-xl border", isTheory ? "bg-blue-50/60 border-blue-200 dark:bg-blue-950/20" : "bg-amber-50/60 border-amber-200 dark:bg-amber-950/20")}>
                    <div className="flex items-center gap-2 mb-2">
                      {isTheory ? <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                      <span className={cn("text-xs font-semibold uppercase tracking-wider", isTheory ? "text-blue-700 dark:text-blue-400" : "text-amber-700 dark:text-amber-400")}>
                        Tip {isTheory ? 'Teori' : 'Praktik'}
                      </span>
                    </div>
                    <div className="text-sm leading-relaxed">
                      <ContentBlockList blocks={tip.content} compactLayout={compactLayout} />
                    </div>
                 </div>
               )
            } else {
               return (
                 <button 
                   key={idx}
                   onClick={(e) => { e.preventDefault(); onUseTip?.(question.id, idx, tip.type); }}
                   className={cn(
                     "w-full flex items-center justify-between p-3.5 rounded-xl border border-dashed transition-all hover:shadow-xs",
                     isTheory ? "hover:bg-blue-50/50 border-blue-300 dark:border-blue-800" : "hover:bg-amber-50/50 border-amber-300 dark:border-amber-800"
                   )}
                 >
                    <div className="flex items-center gap-2">
                      {isTheory ? <Lightbulb className="w-4 h-4 text-blue-500" /> : <Wrench className="w-4 h-4 text-amber-500" />}
                      <span className="text-sm font-medium text-muted-foreground">Buka Tip {isTheory ? 'Teori' : 'Praktik'}</span>
                    </div>
                    {enableTipPenalty && penaltyVal > 0 && (
                      <Badge variant="outline" className="text-xs text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-950/30 font-semibold">
                        <AlertTriangle className="w-3 h-3 mr-1" /> -{penaltyVal}% Nilai
                      </Badge>
                    )}
                 </button>
               )
            }
          })}
        </div>
      )}
    </div>
  );

  return printMode ? (
    <div
      id={`question-card-${question.id}`}
      tabIndex={-1}
      className="w-full text-black"
    >
      {innerContent}
    </div>
  ) : borderless ? (
    <div
      id={`question-card-${question.id}`}
      tabIndex={-1}
      className={cn(
        'transition-all duration-200 w-full [contain:layout_style_paint]',
        flagged && 'rounded-xl p-4 sm:p-5 bg-amber-500/[0.03] border border-amber-500/30 ring-1 ring-amber-500/10'
      )}
    >
      {innerContent}
    </div>
  ) : (
    <Card
      id={`question-card-${question.id}`}
      tabIndex={-1}
      className={cn(
        'transition-all duration-200 rounded-xl border bg-card shadow-xs [contain:layout_style_paint]',
        flagged ? 'border-amber-500/50 ring-1 ring-amber-500/20' : 'border-border/70 hover:border-zinc-300 dark:hover:border-zinc-700',
        isCorrect && 'border-emerald-500/40 bg-emerald-500/[0.03]',
        isWrong && 'border-rose-500/40 bg-rose-500/[0.03]',
        isNeutral && answer !== undefined && 'border-muted-foreground/30 bg-muted/20',
      )}
    >
      <CardContent className="p-5 md:p-6">
        {innerContent}
      </CardContent>
    </Card>
  );
});

