import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentBlockList } from './ContentBlockRenderer';
import { parseMarkdown } from '@/lib/parser';

interface StimulusRendererProps {
  content: string; // Markdown text of the stimulus/case study
  children: React.ReactNode; // The questions that belong to this stimulus
}

export function StimulusRenderer({ content, children }: StimulusRendererProps) {
  // Use the parser to render any markdown, math, charts inside the case study
  // We wrap the raw markdown in a dummy question block to parse it easily with the existing parser.
  // Alternatively, parseInlineContent could be exported, but this is a quick workaround.
  const parsed = parseMarkdown(`# Q1 (ESSAY)\n${content}`);
  const blocks = parsed[0]?.body || [];

  return (
    <div className="w-full space-y-4 my-6">
      <Card className="border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/20 rounded-l-none">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-semibold tracking-wide uppercase text-blue-700 dark:text-blue-300">
            KASUS / STIMULUS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm leading-relaxed">
            <ContentBlockList blocks={blocks} />
          </div>
        </CardContent>
      </Card>
      
      {/* Nested Questions Container */}
      <div className="pl-4 md:pl-8 border-l-2 border-dashed border-muted-foreground/30 space-y-4">
        {children}
      </div>
    </div>
  );
}
