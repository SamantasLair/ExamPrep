'use client';

import { useEffect, useRef } from 'react';
import type { ContentBlock } from '@/lib/types';

interface DiagramRendererProps {
  block: ContentBlock;
}

export function DiagramRenderer({ block }: DiagramRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current || !block.diagramConfig) return;
    let JXG: typeof import('jsxgraph');
    let mounted = true;

    (async () => {
      JXG = (await import('jsxgraph')).default ?? await import('jsxgraph');
      // Inject JSXGraph CSS once
      if (!document.getElementById('jsxgraph-css')) {
        const link = document.createElement('link');
        link.id = 'jsxgraph-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/jsxgraph/distrib/jsxgraph.css';
        document.head.appendChild(link);
      }
      if (!mounted || !containerRef.current) return;

      // Cleanup previous board
      if (boardRef.current) {
        try { JXG.JSXGraph.freeBoard(boardRef.current as never); } catch { /* noop */ }
      }
      containerRef.current.innerHTML = '';

      const cfg = block.diagramConfig!;
      const boardId = `jxg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      containerRef.current.id = boardId;

      const type = (cfg.type as string) ?? block.diagramType ?? 'functionPlot';

      if (type === 'geometry' || type === 'functionPlot') {
        const board = JXG.JSXGraph.initBoard(boardId, {
          boundingbox: (cfg.boundingBox as [number, number, number, number]) ?? [
            (cfg.xMin as number) ?? -10,
            (cfg.yMax as number) ?? 10,
            (cfg.xMax as number) ?? 10,
            (cfg.yMin as number) ?? -10,
          ] as [number, number, number, number],
          axis: cfg.axis !== undefined ? !!cfg.axis : true,
          grid: cfg.grid !== undefined ? !!cfg.grid : true,
          keepaspectratio: true,
          showNavigation: false,
          showCopyright: false,
        });
        boardRef.current = board;

        const registry: Record<string, any> = {};
        
        // Handle legacy functionPlot 'fn' at root
        if (type === 'functionPlot' && cfg.fn) {
           const fns = Array.isArray(cfg.fn) ? cfg.fn as string[] : [cfg.fn as string];
           fns.forEach((fnStr, idx) => {
             registry[`root_fn_${idx}`] = board.create('functiongraph', [
               // eslint-disable-next-line no-new-func
               new Function('x', `return ${fnStr}`) as (x: number) => number,
             ], { strokeWidth: 2 });
           });
        }

        const elements = (cfg.elements as Array<Record<string, unknown>>) ?? [];
        for (const el of elements) {
          const name = el.name as string || `el_${Math.random().toString(36).slice(2, 5)}`;
          const props: Record<string, any> = {
            name: el.name as string,
            strokeWidth: (el.strokeWidth as number) ?? 2,
            strokeColor: (el.strokeColor as string) ?? '#0072b2',
            dash: (el.dash as number) ?? 0,
            fillColor: (el.fillColor as string) ?? 'none',
            fillOpacity: (el.fillOpacity as number) ?? 0,
            ...((el.props as Record<string, any>) || {}),
          };

          if (el.type === 'point') {
            registry[name] = board.create('point', el.coords as number[], {
              ...props,
              size: (el.size as number) ?? 3,
            });
          } else if (el.type === 'line' && registry[el.p1 as string] && registry[el.p2 as string]) {
            registry[name] = board.create('line', [registry[el.p1 as string], registry[el.p2 as string]], {
              straightFirst: false, 
              straightLast: false, 
              ...props,
            });
          } else if (el.type === 'functionGraph') {
            registry[name] = board.create('functiongraph', [
              // eslint-disable-next-line no-new-func
              new Function('x', `return ${el.fn as string}`) as (x: number) => number,
            ], props);
          } else if (el.type === 'integral' && el.range) {
            const c1 = registry[el.curve1 as string] || el.curve1 || 0;
            const c2 = registry[el.curve2 as string] || el.curve2 || 0;
            registry[name] = board.create('integral', [el.range as [number, number], c1, c2], props);
          } else if (el.type === 'circle' && registry[el.center as string]) {
            registry[name] = board.create('circle', [registry[el.center as string], el.radius as number], props);
          } else if (el.type === 'polygon' && Array.isArray(el.vertices)) {
            const polygonPoints = (el.vertices as string[])
              .map((vName) => registry[vName])
              .filter(Boolean);
            if (polygonPoints.length > 0) {
              registry[name] = board.create('polygon', polygonPoints, {
                ...props,
                fillOpacity: props.fillOpacity === 0 ? 0.1 : props.fillOpacity,
                borders: { 
                    strokeWidth: props.strokeWidth,
                    dash: props.dash,
                    strokeColor: props.strokeColor,
                },
              });
            }
          } else if (el.type === 'sector' && registry[el.p1 as string] && registry[el.p2 as string] && registry[el.p3 as string]) {
            registry[name] = board.create('sector', [registry[el.p1 as string], registry[el.p2 as string], registry[el.p3 as string]], props);
          } else if (el.type === 'angle' && registry[el.p1 as string] && registry[el.p2 as string] && registry[el.p3 as string]) {
             registry[name] = board.create('angle', [registry[el.p1 as string], registry[el.p2 as string], registry[el.p3 as string]], {
                 ...props,
                 radius: (el.radius as number) ?? 1,
             });
          } else if (el.type === 'text' && el.coords) {
            registry[name] = board.create('text', [...(el.coords as number[]), el.text as string], {
                fontSize: (el.fontSize as number) ?? 14,
                color: (el.color as string) ?? props.strokeColor,
                ...props,
            });
          }
        }

      } else if (type === '3d') {
        const board = JXG.JSXGraph.initBoard(boardId, {
          boundingbox: [-8, 8, 8, -8],
          axis: false,
          showNavigation: false,
          showCopyright: false,
        });
        boardRef.current = board;
        const xRange = (cfg.xRange as number[]) ?? [-3, 3];
        const yRange = (cfg.yRange as number[]) ?? [-3, 3];
        const fnStr = (cfg.fn as string) ?? 'Math.sin(x)*Math.cos(y)';
        // eslint-disable-next-line no-new-func
        const fn3d = new Function('x', 'y', `return ${fnStr}`) as (x: number, y: number) => number;
        const view = (board as unknown as Record<string, (...args: unknown[]) => unknown>).create
          ? board.create('view3d' as never, [[-6, -3], [8, 8], [xRange, yRange, [-3, 3]]] as never, {
              xPlaneRear: { visible: false },
              yPlaneRear: { visible: false },
              zPlaneRear: { visible: true, fillOpacity: 0.1 },
            } as never)
          : null;
        if (view) {
          (view as unknown as Record<string, (...args: unknown[]) => unknown>).create(
            'functiongraph3d',
            [fn3d, xRange, yRange],
            { strokeWidth: 0.5, stepsU: 40, stepsV: 40 }
          );
        }
      }
    })();

    return () => {
      mounted = false;
      if (boardRef.current) {
        import('jsxgraph').then((mod) => {
          const J = mod.default ?? mod;
          try { J.JSXGraph.freeBoard(boardRef.current as never); } catch { /* noop */ }
          boardRef.current = null;
        });
      }
    };
  }, [block.diagramConfig, block.diagramType]);

  if (!block.diagramConfig) {
    return <p className="text-sm text-destructive">Konfigurasi diagram tidak ditemukan.</p>;
  }
  return <div ref={containerRef} className="w-full aspect-[4/3] min-h-[260px]" />;
}
