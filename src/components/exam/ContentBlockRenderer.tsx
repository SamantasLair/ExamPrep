'use client';

import { useState } from 'react';
import type { ContentBlock } from '@/lib/types';
import { MathRenderer } from './MathRenderer';
import { ChartRenderer } from './ChartRenderer';
import { DiagramRenderer } from './DiagramRenderer';
import { Button } from '@/components/ui/button';

interface ContentBlockRendererProps {
  block: ContentBlock;
}

export function ContentBlockRenderer({ block }: ContentBlockRendererProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(block.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  switch (block.type) {
    case 'text':
      return <span className="whitespace-pre-wrap">{block.content}</span>;
    case 'math-inline':
      return <MathRenderer tex={block.content} />;
    case 'math-block':
      return <MathRenderer tex={block.content} displayMode />;
    case 'chart':
      return (
        <div 
          className="my-4 p-4 rounded-xl border bg-card print:border-none print:p-0 print:my-2"
          style={{ transform: 'scale(var(--print-graphic-scale, 1))', transformOrigin: 'top left' } as React.CSSProperties}
        >
          <ChartRenderer block={block} />
        </div>
      );
    case 'diagram':
      return (
        <div 
          className="my-4 p-4 rounded-xl border bg-card print:border-none print:p-0 print:my-2"
          style={{ transform: 'scale(var(--print-graphic-scale, 1))', transformOrigin: 'top left' } as React.CSSProperties}
        >
          <DiagramRenderer block={block} />
        </div>
      );
    case 'image':
      return (
        <img
          src={block.content}
          alt="exam-image"
          className="my-3 max-w-full rounded-lg border shadow-sm"
          loading="lazy"
        />
      );
    case 'code-block':
      return (
        <div className="my-4 relative rounded-md border bg-zinc-950 text-zinc-50 overflow-hidden font-mono text-xs">
          <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800">
            <span className="text-zinc-400 font-semibold">{block.language || 'code'}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 px-2 text-zinc-400 hover:text-white"
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <div className="p-3 overflow-x-auto whitespace-pre">
            <code>{block.content}</code>
          </div>
        </div>
      );
    default:
      return null;
  }
}

interface ContentBlockListProps {
  blocks: ContentBlock[];
}

export function ContentBlockList({ blocks }: ContentBlockListProps) {
  return (
    <div className="leading-relaxed">
      {blocks.map((block, i) => (
        <ContentBlockRenderer key={i} block={block} />
      ))}
    </div>
  );
}
