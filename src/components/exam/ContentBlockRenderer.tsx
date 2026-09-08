'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ContentBlock } from '@/lib/types';
import { MathRenderer } from './MathRenderer';
import { ChartRenderer } from './ChartRenderer';
import { DiagramRenderer } from './DiagramRenderer';
import { Button } from '@/components/ui/button';

interface ContentBlockRendererProps {
  block: ContentBlock;
  compactLayout?: boolean;
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

function FormattedTextBlock({ text }: { text: string }) {
  const paragraphs = text.split(/\r?\n\s*\r?\n/);

  if (paragraphs.length <= 1) {
    const trimmed = text.trim();
    if (trimmed.startsWith('### ')) {
      return <h4 className="text-sm font-semibold text-foreground mt-3 mb-1">{renderFormattedInline(trimmed.slice(4))}</h4>;
    }
    if (trimmed.startsWith('## ')) {
      return <h3 className="text-base font-semibold text-foreground mt-3 mb-1.5">{renderFormattedInline(trimmed.slice(3))}</h3>;
    }
    if (trimmed.startsWith('# ')) {
      return <h2 className="text-lg font-bold text-foreground mt-4 mb-2">{renderFormattedInline(trimmed.slice(2))}</h2>;
    }
    if (trimmed.startsWith('> ')) {
      return <blockquote className="border-l-4 border-primary/40 pl-3.5 italic my-2 text-muted-foreground">{renderFormattedInline(trimmed.slice(2))}</blockquote>;
    }
    if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2, -2).includes('**')) {
      return <div className="font-bold text-base text-foreground tracking-tight pb-1 mb-2 border-b border-border/40">{renderFormattedInline(trimmed.slice(2, -2))}</div>;
    }
    return <span>{renderFormattedInline(text)}</span>;
  }

  return (
    <div className="space-y-3">
      {paragraphs.map((para, idx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('### ')) {
          return <h4 key={idx} className="text-sm font-semibold text-foreground mt-3 mb-1">{renderFormattedInline(trimmed.slice(4))}</h4>;
        }
        if (trimmed.startsWith('## ')) {
          return <h3 key={idx} className="text-base font-semibold text-foreground mt-3 mb-1.5">{renderFormattedInline(trimmed.slice(3))}</h3>;
        }
        if (trimmed.startsWith('# ')) {
          return <h2 key={idx} className="text-lg font-bold text-foreground mt-4 mb-2">{renderFormattedInline(trimmed.slice(2))}</h2>;
        }
        if (trimmed.startsWith('> ')) {
          return <blockquote key={idx} className="border-l-4 border-primary/40 pl-3.5 italic my-2 text-muted-foreground">{renderFormattedInline(trimmed.slice(2))}</blockquote>;
        }
        if (/^[-*]\s+/m.test(trimmed)) {
          const items = trimmed.split(/\r?\n/).map(l => l.replace(/^[-*]\s+/, '').trim()).filter(Boolean);
          return (
            <ul key={idx} className="list-disc list-inside space-y-1 my-2 pl-1">
              {items.map((item, itemIdx) => (
                <li key={itemIdx}>{renderFormattedInline(item)}</li>
              ))}
            </ul>
          );
        }
        if (/^\d+\.\s+/m.test(trimmed)) {
          const items = trimmed.split(/\r?\n/).map(l => l.replace(/^\d+\.\s+/, '').trim()).filter(Boolean);
          return (
            <ol key={idx} className="list-decimal list-inside space-y-1 my-2 pl-1">
              {items.map((item, itemIdx) => (
                <li key={itemIdx}>{renderFormattedInline(item)}</li>
              ))}
            </ol>
          );
        }

        if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2, -2).includes('**')) {
          return (
            <div key={idx} className="font-bold text-base text-foreground tracking-tight pb-1 mb-2 border-b border-border/40">
              {renderFormattedInline(trimmed.slice(2, -2))}
            </div>
          );
        }

        return (
          <p key={idx} className="leading-relaxed">
            {renderFormattedInline(para)}
          </p>
        );
      })}
    </div>
  );
}

export function ContentBlockRenderer({ block, compactLayout = false }: ContentBlockRendererProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(block.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  switch (block.type) {
    case 'text':
      return <FormattedTextBlock text={block.content} />;
    case 'math-inline':
      return <MathRenderer tex={block.content} />;
    case 'math-block':
      return <MathRenderer tex={block.content} displayMode />;
    case 'chart':
      return (
        <div 
          className={cn(
            "my-4 p-4 rounded-xl border bg-card print:border-none print:p-0 print:my-2 overflow-hidden",
            compactLayout && "float-right ml-4 mb-2 w-[250px] clear-right"
          )}
          style={{ transform: 'scale(var(--print-graphic-scale, 1))', transformOrigin: 'top left' } as React.CSSProperties}
        >
          <ChartRenderer block={block} />
        </div>
      );
    case 'diagram':
      return (
        <div 
          className={cn(
            "my-4 p-4 rounded-xl border bg-card print:border-none print:p-0 print:my-2 overflow-hidden",
            compactLayout && "float-right ml-4 mb-2 w-[250px] clear-right"
          )}
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
          className={cn(
            "my-3 max-w-full rounded-lg border shadow-sm",
            compactLayout && "float-right ml-4 mb-2 max-w-[200px] clear-right"
          )}
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
  compactLayout?: boolean;
}

export function ContentBlockList({ blocks, compactLayout = false }: ContentBlockListProps) {
  return (
    <div className={cn("leading-relaxed", compactLayout && "flow-root")}>
      {blocks.map((block, i) => (
        <ContentBlockRenderer key={i} block={block} compactLayout={compactLayout} />
      ))}
    </div>
  );
}
