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
    <div className="w-full my-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Sticky Stimulus Reading Card on Desktop */}
        <div className="lg:col-span-5 lg:sticky lg:top-4">
          <Card className="border-l-4 border-l-blue-500 bg-blue-50/40 dark:bg-blue-950/20 rounded-xl shadow-xs overflow-hidden">
            <CardHeader className="py-2.5 px-4 bg-blue-500/10 border-b border-blue-500/20">
              <CardTitle className="text-xs font-semibold tracking-wider uppercase text-blue-700 dark:text-blue-300">
                KASUS / STIMULUS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
              <div className="text-sm leading-relaxed text-foreground/90">
                <ContentBlockList blocks={blocks} />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Nested Questions Container */}
        <div className="lg:col-span-7 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
