'use client';

import type { Question } from '@/lib/types';
import { ContentBlockList } from './ContentBlockRenderer';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type FeedbackMode = 'graded' | 'neutral';

interface QuestionRendererProps {
  question: Question;
  answer?: string;
  onAnswer?: (questionId: number, answer: string) => void;
  showDiscussion?: boolean;
  showOnlyDiscussion?: boolean;
  showCorrectAnswer?: boolean;
  feedbackMode?: FeedbackMode;
  disabled?: boolean;
  printMode?: boolean; // Nasty UI elements stripped out
  compactLayout?: boolean;
  answerStyle?: 'solid' | 'outlined' | 'minimalist' | 'boxed' | 'bracket';
}

export function QuestionRenderer({
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
}: QuestionRendererProps) {
  const isGraded = showCorrectAnswer && feedbackMode === 'graded';
  const isNeutral = showCorrectAnswer && feedbackMode === 'neutral';
  const isCorrect = isGraded && answer === question.correctAnswer;
  const isWrong = isGraded && answer !== undefined && answer !== question.correctAnswer;

  if (showOnlyDiscussion) {
    return (
      <div className={cn(
        "p-4 rounded-lg relative overflow-visible", 
        printMode ? "py-2 mt-2" : "bg-muted/40 border border-border"
      )}>
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
    <div className={cn("space-y-4", printMode ? "" : "pt-5")}>
      {/* Header - Hidden in Print Mode */}
      {!printMode && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs">
            Q{question.id}
          </Badge>
          <Badge variant={question.type === 'MCQ' ? 'default' : 'outline'} className="text-xs">
            {question.type === 'MCQ' ? 'Pilihan Ganda' : 'Essay'}
          </Badge>
          {isGraded && (
            <Badge variant={isCorrect ? 'default' : 'destructive'} className="text-xs ml-auto">
              {isCorrect ? 'Benar' : 'Salah'}
            </Badge>
          )}
          {isNeutral && answer !== undefined && (
            <Badge variant="secondary" className="text-xs ml-auto">
              Jawaban Anda: {answer}
            </Badge>
          )}
        </div>
      )}

        {/* Question Body */}
        <div className={cn(printMode ? "text-[1em]" : "text-sm")}>
          <ContentBlockList blocks={question.body} compactLayout={compactLayout} />
        </div>

      {/* MCQ Options */}
      {question.type === 'MCQ' && question.options && (
        <div className={cn("space-y-2", !printMode && "pl-1")}>
          {!printMode ? (
            <RadioGroup
              value={answer || ''}
              onValueChange={(val) => onAnswer?.(question.id, val)}
              disabled={disabled}
              className="space-y-2"
            >
              {question.options.map((opt) => {
                const isThisCorrect = isGraded && opt.key === question.correctAnswer;
                const isThisSelected = answer === opt.key;
                const isThisWrongPick = isGraded && isThisSelected && !isThisCorrect;
                return (
                  <Label
                    key={opt.key}
                    htmlFor={`q${question.id}-${opt.key}`}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                      'hover:bg-accent/50',
                      isThisSelected && !showCorrectAnswer && 'border-primary bg-primary/5',
                      isThisCorrect && 'border-green-500 bg-green-50/50 dark:bg-green-950/20',
                      isThisWrongPick && 'border-red-500 bg-red-50/50 dark:bg-red-950/20',
                      isNeutral && isThisSelected && 'border-muted-foreground bg-muted/40',
                      disabled && 'cursor-default',
                    )}
                  >
                    <RadioGroupItem value={opt.key} id={`q${question.id}-${opt.key}`} className="mt-0.5" />
                    <span className="font-semibold mr-1">{opt.key}.</span>
                    <span className="flex-1 text-sm">
                      <ContentBlockList blocks={opt.body} compactLayout={compactLayout} />
                    </span>
                  </Label>
                );
              })}
            </RadioGroup>
          ) : (
            // PRINT MODE OPTIONS (NO BOXES/RADIOS)
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
        <Textarea
          placeholder="Tulis jawaban di sini..."
          value={answer || ''}
          onChange={(e) => onAnswer?.(question.id, e.target.value)}
          disabled={disabled}
          className="min-h-[100px] resize-y"
        />
      )}
      {question.type === 'ESSAY' && printMode && (
        <div className="border border-dashed border-gray-400 min-h-[150px] mt-4 w-full" />
      )}

      {/* Discussion */}
      {showDiscussion && question.discussion && question.discussion.length > 0 && (
        <div className={cn(
          "mt-4 p-4 rounded-lg relative overflow-visible", 
          printMode ? "py-2 mt-2" : "bg-muted/40 border border-border"
        )}>
          {printMode && answerStyle === 'bracket' ? (
            <div className="absolute left-[-10px] top-0 bottom-0 w-[20px] pointer-events-none overflow-hidden">
               <span className="text-8xl font-light text-black opacity-40 leading-[0.5] select-none">(</span>
            </div>
          ) : (
            printMode && <div className="absolute left-0 top-0 bottom-0 w-1 bg-black" />
          )}
          <p className={cn("text-xs uppercase tracking-wider text-muted-foreground mb-2", !printMode && "font-bold")}>Jawaban & Pembahasan</p>
          <div className={cn(printMode ? "text-[1em]" : "text-sm")}>
            <ContentBlockList blocks={question.discussion || []} compactLayout={compactLayout} />
          </div>
        </div>
      )}
    </div>
  );

  return printMode ? (
    <div className="w-full text-black">
      {innerContent}
    </div>
  ) : (
    <Card className={cn(
      'transition-all duration-200',
      isCorrect && 'border-green-500/50 bg-green-50/30 dark:bg-green-950/10',
      isWrong && 'border-red-500/50 bg-red-50/30 dark:bg-red-950/10',
      isNeutral && answer !== undefined && 'border-muted-foreground/30 bg-muted/20',
    )}>
      <CardContent className="pt-5 space-y-4">
        {innerContent}
      </CardContent>
    </Card>
  );
}

