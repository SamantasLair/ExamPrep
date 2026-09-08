'use client';

import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs';

export type AnimePreset = 'page' | 'pop' | 'fade-up' | 'scale' | 'slide-down';

export interface AnimeBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  preset?: AnimePreset;
  duration?: number;
  delay?: number;
  ease?: string;
  animateProps?: Record<string, unknown>;
  onComplete?: () => void;
  as?: React.ElementType;
}

const PRESET_CONFIGS: Record<AnimePreset, Record<string, unknown>> = {
  page: {
    opacity: [0, 1],
    translateY: [12, 0],
    scale: [0.98, 1],
    duration: 450,
    ease: 'outQuad'
  },
  pop: {
    opacity: [0, 1],
    scale: [0.85, 1],
    duration: 400,
    ease: 'outBack'
  },
  'fade-up': {
    opacity: [0, 1],
    translateY: [24, 0],
    duration: 400,
    ease: 'outQuad'
  },
  scale: {
    opacity: [0, 1],
    scale: [0.95, 1],
    duration: 350,
    ease: 'outQuad'
  },
  'slide-down': {
    opacity: [0, 1],
    translateY: [-20, 0],
    duration: 350,
    ease: 'outQuad'
  }
};

export function AnimeBox({
  preset = 'page',
  duration,
  delay = 0,
  ease,
  animateProps,
  onComplete,
  as: Component = 'div',
  children,
  className,
  style,
  ...rest
}: AnimeBoxProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const baseConfig = PRESET_CONFIGS[preset] || PRESET_CONFIGS.page;
    const finalParams: Record<string, unknown> = {
      ...baseConfig,
      ...(duration !== undefined ? { duration } : {}),
      ...(delay !== undefined ? { delay } : {}),
      ...(ease !== undefined ? { ease } : {}),
      ...(animateProps || {})
    };

    if (onComplete) {
      finalParams.onComplete = onComplete;
    }

    const anim = animate(el, finalParams as any);

    return () => {
      anim.revert();
    };
  }, [preset, duration, delay, ease, animateProps, onComplete]);

  return (
    <Component
      ref={elementRef}
      className={className}
      style={{ opacity: 0, ...style }}
      {...rest}
    >
      {children}
    </Component>
  );
}
