'use client';

import type { ContentBlock } from '@/lib/types';
import { MathRenderer } from './MathRenderer';
import { ChartRenderer } from './ChartRenderer';

interface ContentBlockRendererProps {
  block: ContentBlock;
}

export function ContentBlockRenderer({ block }: ContentBlockRendererProps) {
  switch (block.type) {
    case 'text':
      return <span className="whitespace-pre-wrap">{block.content}</span>;
    case 'math-inline':
      return <MathRenderer tex={block.content} />;
    case 'math-block':
      return <MathRenderer tex={block.content} displayMode />;
    case 'chart':
      return (
        <div className="my-4 p-4 rounded-xl border bg-card">
          <ChartRenderer block={block} />
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
