'use client';

import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GripVertical, Columns, Eye, SplitSquareVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type SplitPreset = '50:50' | '65:35' | '35:65' | '100:0';

export interface ResizableSplitterProps {
  splitRatio: number; // Persentase lebar panel kiri (0 - 100)
  onRatioChange: (newRatio: number) => void;
  minRatio?: number; // Batas minimum persentase kiri (default: 20)
  maxRatio?: number; // Batas maksimum persentase kiri (default: 80)
  containerRef: React.RefObject<HTMLElement | null>;
  className?: string;
  disabled?: boolean;
}

export function ResizableSplitter({
  splitRatio,
  onRatioChange,
  minRatio = 20,
  maxRatio = 80,
  containerRef,
  className,
  disabled = false,
}: ResizableSplitterProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showPresets, setShowPresets] = useState<boolean>(false);
  const dragCleanupRef = useRef<(() => void) | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();

      const container = containerRef.current;
      if (!container) return;

      setIsDragging(true);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const updateRatio = (clientX: number) => {
        const rect = container.getBoundingClientRect();
        if (rect.width <= 0) return;
        const rawRatio = ((clientX - rect.left) / rect.width) * 100;
        const clampedRatio = Math.max(minRatio, Math.min(maxRatio, rawRatio));
        onRatioChange(Math.round(clampedRatio * 10) / 10);
      };

      const handlePointerMove = (moveEvent: PointerEvent) => {
        updateRatio(moveEvent.clientX);
      };

      const handlePointerUp = () => {
        setIsDragging(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
        dragCleanupRef.current = null;
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);

      dragCleanupRef.current = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
      };
    },
    [disabled, containerRef, minRatio, maxRatio, onRatioChange]
  );

  useEffect(() => {
    return () => {
      if (dragCleanupRef.current) {
        dragCleanupRef.current();
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, []);

  const applyPreset = useCallback(
    (preset: SplitPreset) => {
      switch (preset) {
        case '50:50':
          onRatioChange(50);
          break;
        case '65:35':
          onRatioChange(65);
          break;
        case '35:65':
          onRatioChange(35);
          break;
        case '100:0':
          onRatioChange(100);
          break;
      }
      setShowPresets(false);
    },
    [onRatioChange]
  );

  return (
    <div
      className={cn(
        'relative group shrink-0 flex items-center justify-center transition-colors z-20 select-none',
        'w-3 cursor-col-resize',
        isDragging ? 'bg-primary/25 text-primary' : 'bg-border/40 hover:bg-primary/20',
        disabled && 'pointer-events-none opacity-40',
        className
      )}
      onPointerDown={handlePointerDown}
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={Math.round(splitRatio)}
      aria-valuemin={minRatio}
      aria-valuemax={maxRatio}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          onRatioChange(Math.max(minRatio, splitRatio - 5));
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          onRatioChange(Math.min(maxRatio, splitRatio + 5));
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setShowPresets((prev) => !prev);
        }
      }}
    >
      {/* Central Thin Line */}
      <div
        className={cn(
          'w-0.5 h-full transition-colors',
          isDragging ? 'bg-primary' : 'bg-border group-hover:bg-primary/60'
        )}
      />

      {/* Tactile Grab Handle Badge */}
      <div
        className={cn(
          'absolute top-1/2 -translate-y-1/2 w-5 h-10 rounded-full border flex items-center justify-center transition-all shadow-xs',
          isDragging
            ? 'bg-primary text-primary-foreground border-primary scale-105'
            : 'bg-card text-muted-foreground border-border/80 group-hover:border-primary/50 group-hover:text-foreground'
        )}
        title="Geser pembatas horizontal atau klik untuk preset"
      >
        <GripVertical className="size-3 stroke-[2.2]" />
      </div>

      {/* Preset Ratio Bar Quick Access Trigger */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowPresets((prev) => !prev);
        }}
        className={cn(
          'absolute top-3 w-5 h-5 rounded-md border border-border/60 bg-card text-muted-foreground flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:text-foreground hover:border-primary/50 shadow-2xs cursor-pointer',
          showPresets && 'opacity-100 border-primary text-primary'
        )}
        title="Buka Preset Rasio Split"
        aria-label="Preset Rasio Split"
      >
        <SplitSquareVertical className="size-3" />
      </button>

      {/* Preset Popup Card */}
      {showPresets && (
        <div
          className="absolute top-10 left-1/2 -translate-x-1/2 z-30 p-1.5 rounded-xl border border-border/80 bg-card/95 backdrop-blur-md shadow-lg flex flex-col gap-1 min-w-[120px] animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Preset Rasio
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => applyPreset('50:50')}
            className={cn(
              'h-7 px-2 justify-between text-xs font-medium rounded-lg',
              splitRatio === 50 && 'bg-primary/10 text-primary font-semibold'
            )}
          >
            <span>Seimbang</span>
            <span className="text-[10px] font-mono text-muted-foreground">50:50</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => applyPreset('65:35')}
            className={cn(
              'h-7 px-2 justify-between text-xs font-medium rounded-lg',
              splitRatio === 65 && 'bg-primary/10 text-primary font-semibold'
            )}
          >
            <span>Fokus Teori</span>
            <span className="text-[10px] font-mono text-muted-foreground">65:35</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => applyPreset('35:65')}
            className={cn(
              'h-7 px-2 justify-between text-xs font-medium rounded-lg',
              splitRatio === 35 && 'bg-primary/10 text-primary font-semibold'
            )}
          >
            <span>Fokus Soal</span>
            <span className="text-[10px] font-mono text-muted-foreground">35:65</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => applyPreset('100:0')}
            className={cn(
              'h-7 px-2 justify-between text-xs font-medium rounded-lg text-primary hover:bg-primary/10',
              splitRatio === 100 && 'bg-primary/15 font-semibold'
            )}
          >
            <span className="flex items-center gap-1">
              <Eye className="size-3" />
              <span>Zen Mode</span>
            </span>
            <span className="text-[10px] font-mono">100:0</span>
          </Button>
        </div>
      )}
    </div>
  );
}
