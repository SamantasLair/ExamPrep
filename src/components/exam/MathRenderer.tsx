'use client';

import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  tex: string;
  displayMode?: boolean;
}

export function MathRenderer({ tex, displayMode = false }: MathRendererProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        displayMode,
        throwOnError: false,
        errorColor: '#ef4444',
      });
    } catch {
      return null;
    }
  }, [tex, displayMode]);

  if (!html) {
    return <span className={displayMode ? "block my-3 text-center" : "inline"}>{tex}</span>;
  }

  return displayMode ? (
    <span
      className="block my-3 text-center overflow-x-auto custom-scrollbar max-w-full [contain:layout_paint]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : (
    <span
      className="inline-block max-w-full align-middle [contain:layout_style]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
