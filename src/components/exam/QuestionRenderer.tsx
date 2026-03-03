'use client';

import type { Question } from '@/lib/types';
import { ContentBlockList } from './ContentBlockRenderer';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuestionRendererProps {
  question: Question;
  answer?: string;
  onAnswer?: (questionId: number, answer: string) => void;
  showDiscussion?: boolean;
  showCorrectAnswer?: boolean;
  disabled?: boolean;
}

export function QuestionRenderer({
  question,
  answer,
  onAnswer,
  showDiscussion = false,
  showCorrectAnswer = false,
  disabled = false,
}: QuestionRendererProps) {
  const isCorrect = showCorrectAnswer && answer === question.correctAnswer;
  const isWrong = showCorrectAnswer && answer !== undefined && answer !== question.correctAnswer;

  return (
    <Card className={cn(
      'transition-all duration-200',
      showCorrectAnswer && isCorrect && 'border-green-500/50 bg-green-50/30 dark:bg-green-950/10',
      showCorrectAnswer && isWrong && 'border-red-500/50 bg-red-50/30 dark:bg-red-950/10',
    )}>
      <CardContent className="pt-5 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs">
            Q{question.id}
          </Badge>
          <Badge variant={question.type === 'MCQ' ? 'default' : 'outline'} className="text-xs">
            {question.type === 'MCQ' ? 'Pilihan Ganda' : 'Essay'}
          </Badge>
          {showCorrectAnswer && (
            <Badge variant={isCorrect ? 'default' : 'destructive'} className="text-xs ml-auto">
              {isCorrect ? 'Benar' : 'Salah'}
            </Badge>
          )}
        </div>

        {/* Question Body */}
        <div className="text-sm">
          <ContentBlockList blocks={question.body} />
        </div>

        {/* MCQ Options */}
        {question.type === 'MCQ' && question.options && (
          <RadioGroup
            value={answer || ''}
            onValueChange={(val) => onAnswer?.(question.id, val)}
            disabled={disabled}
            className="space-y-2"
          >
            {question.options.map((opt) => {
              const isThisCorrect = showCorrectAnswer && opt.key === question.correctAnswer;
              const isThisSelected = answer === opt.key;
              return (
                <Label
                  key={opt.key}
                  htmlFor={`q${question.id}-${opt.key}`}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                    'hover:bg-accent/50',
                    isThisSelected && !showCorrectAnswer && 'border-primary bg-primary/5',
                    showCorrectAnswer && isThisCorrect && 'border-green-500 bg-green-50/50 dark:bg-green-950/20',
                    showCorrectAnswer && isThisSelected && !isThisCorrect && 'border-red-500 bg-red-50/50 dark:bg-red-950/20',
                    disabled && 'cursor-default',
                  )}
                >
                  <RadioGroupItem value={opt.key} id={`q${question.id}-${opt.key}`} className="mt-0.5" />
                  <span className="font-semibold mr-1">{opt.key}.</span>
                  <span className="flex-1 text-sm">
                    <ContentBlockList blocks={opt.body} />
                  </span>
                </Label>
              );
            })}
          </RadioGroup>
        )}

        {/* Essay Input */}
        {question.type === 'ESSAY' && (
          <Textarea
            placeholder="Tulis jawaban di sini..."
            value={answer || ''}
            onChange={(e) => onAnswer?.(question.id, e.target.value)}
            disabled={disabled}
            className="min-h-[100px] resize-y"
          />
        )}

        {/* Discussion */}
        {showDiscussion && question.discussion && question.discussion.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">Pembahasan</p>
            <div className="text-sm">
              <ContentBlockList blocks={question.discussion} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
