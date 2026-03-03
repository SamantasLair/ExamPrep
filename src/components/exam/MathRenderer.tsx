'use client';

import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  tex: string;
  displayMode?: boolean;
}

export function MathRenderer({ tex, displayMode = false }: MathRendererProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(tex, ref.current, {
        displayMode,
        throwOnError: false,
        errorColor: '#ef4444',
      });
    } catch {
      ref.current.textContent = tex;
    }
  }, [tex, displayMode]);

  return displayMode ? (
    <span ref={ref} className="block my-3 text-center overflow-x-auto" />
  ) : (
    <span ref={ref} className="inline" />
  );
}
