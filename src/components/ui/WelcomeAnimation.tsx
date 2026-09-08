'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { animate } from 'animejs';
import {
  Compass,
  Terminal,
  Shapes,
  Sparkles,
  GraduationCap,
  BookOpen,
  Activity,
  type LucideIcon
} from 'lucide-react';

interface WelcomeAnimationProps {
  name: string;
  onComplete: () => void;
}

interface ThemeConfig {
  id: string;
  name: string;
  bg: string;
  accent: string;
  badgeBg: string;
  subtitle: string;
  Icon: LucideIcon;
}

const THEMES: ThemeConfig[] = [
  {
    id: 'cosmic',
    name: 'Cosmic Orbit',
    bg: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950',
    accent: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/20 border-indigo-400/40 text-indigo-200',
    subtitle: 'Menjelajahi Cakrawala Ilmu Pengetahuan',
    Icon: Compass
  },
  {
    id: 'cyber',
    name: 'Cyber Grid',
    bg: 'bg-gradient-to-br from-zinc-950 via-slate-950 to-cyan-950',
    accent: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/20 border-cyan-400/40 text-cyan-200',
    subtitle: 'Inisialisasi Sistem Asesmen Digital Berkinerja Tinggi',
    Icon: Terminal
  },
  {
    id: 'origami',
    name: 'Geometric Origami',
    bg: 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900',
    accent: 'text-purple-400',
    badgeBg: 'bg-purple-500/20 border-purple-400/40 text-purple-200',
    subtitle: 'Membuka Dimensi Baru Kemampuan Berpikir Kritis',
    Icon: Shapes
  },
  {
    id: 'celebration',
    name: 'Celebration Pulse',
    bg: 'bg-gradient-to-br from-rose-950 via-slate-950 to-amber-950',
    accent: 'text-amber-400',
    badgeBg: 'bg-amber-500/20 border-amber-400/40 text-amber-200',
    subtitle: 'Siapkan Semangat Menuju Prestasi Gemilang',
    Icon: Sparkles
  },
  {
    id: 'academic',
    name: 'Academic Achievement',
    bg: 'bg-gradient-to-br from-blue-950 via-slate-950 to-blue-900',
    accent: 'text-blue-400',
    badgeBg: 'bg-blue-500/20 border-blue-400/40 text-blue-200',
    subtitle: 'Menjunjung Tinggi Integritas & Keunggulan Belajar',
    Icon: GraduationCap
  },
  {
    id: 'curtain',
    name: 'Kinetic Curtain',
    bg: 'bg-gradient-to-br from-zinc-950 via-neutral-900 to-stone-950',
    accent: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200',
    subtitle: 'Pintu Gerbang Menuju Potensi Tertinggi Terbuka',
    Icon: BookOpen
  },
  {
    id: 'zen',
    name: 'Zen Wave',
    bg: 'bg-gradient-to-br from-teal-950 via-slate-950 to-emerald-950',
    accent: 'text-teal-400',
    badgeBg: 'bg-teal-500/20 border-teal-400/40 text-teal-200',
    subtitle: 'Ketenangan Fokus Menghasilkan Ketajaman Analisis',
    Icon: Activity
  }
];

export function WelcomeAnimation({ name, onComplete }: WelcomeAnimationProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [theme] = useState<ThemeConfig>(() => {
    if (typeof window !== 'undefined') {
      const lastIndexStr = localStorage.getItem('exaprep_welcome_theme_idx');
      const lastIndex = lastIndexStr ? parseInt(lastIndexStr, 10) : -1;
      const nextIndex = (lastIndex + 1) % THEMES.length;
      try {
        localStorage.setItem('exaprep_welcome_theme_idx', String(nextIndex));
      } catch { /* ignore */ }
      return THEMES[nextIndex] || THEMES[0];
    }
    return THEMES[0];
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const iconRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const nameRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const wipeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Failsafe timer: ensures onComplete is unconditionally called after 2.8 seconds
    const failsafeTimer = setTimeout(() => {
      document.body.style.overflow = originalOverflow;
      onComplete();
    }, 2800);

    // 1. Central Welcome Card Pop In
    if (cardRef.current) {
      animate(cardRef.current, {
        scale: [0.85, 1],
        opacity: [0, 1],
        duration: 650,
        ease: 'outBack'
      });
    }

    // 2. Continuous Hero Icon Animation
    let iconAnim: { revert: () => void } | null = null;
    if (iconRef.current) {
      iconAnim = animate(iconRef.current, {
        translateY: [0, -14, 0],
        rotate: [-5, 5, -5],
        scale: [1, 1.06, 1],
        duration: 2000,
        loop: true,
        ease: 'inOutSine'
      }) as unknown as { revert: () => void };
    }

    // 3. Title drop-down
    if (titleRef.current) {
      animate(titleRef.current, {
        opacity: [0, 1],
        translateY: [-16, 0],
        duration: 450,
        delay: 180,
        ease: 'outQuad'
      });
    }

    // 4. Name Badge slide-up
    if (nameRef.current) {
      animate(nameRef.current, {
        opacity: [0, 1],
        translateY: [24, 0],
        scale: [0.92, 1],
        duration: 550,
        delay: 300,
        ease: 'outBack'
      });
    }

    // 5. Subtitle fade
    if (subtitleRef.current) {
      animate(subtitleRef.current, {
        opacity: [0, 1],
        translateY: [12, 0],
        duration: 450,
        delay: 450,
        ease: 'outQuad'
      });
    }

    // 6. Floating Theme Geometric Elements (Full Page)
    const elements = containerRef.current?.querySelectorAll('.theme-geo-shape');
    if (elements && elements.length > 0) {
      elements.forEach((el, idx) => {
        animate(el, {
          opacity: [0, 0.65, 0],
          translateY: [
            `${(idx % 2 === 0 ? 1 : -1) * 70}px`,
            `${(idx % 2 === 0 ? -1 : 1) * 100}px`
          ],
          rotate: [0, 180 + idx * 30],
          duration: 2000 + (idx % 3) * 300,
          delay: idx * 80,
          ease: 'outQuad'
        });
      });
    }

    // 7. Screen Wipe Out at the end
    if (wipeRef.current) {
      animate(wipeRef.current, {
        top: ['100%', '0%'],
        delay: 2200,
        duration: 450,
        ease: 'inOutQuad',
        onComplete: () => {
          clearTimeout(failsafeTimer);
          document.body.style.overflow = originalOverflow;
          onComplete();
        }
      });
    }

    return () => {
      clearTimeout(failsafeTimer);
      document.body.style.overflow = originalOverflow;
      iconAnim?.revert();
    };
  }, [mounted, onComplete]);

  if (!mounted) return null;

  const CurrentIcon = theme.Icon;

  const content = (
    <div
      ref={containerRef}
      className={`fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center ${theme.bg} text-white overflow-hidden select-none p-4`}
    >
      {/* Dynamic Geometric Decorative Shapes (No Emojis) */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="theme-geo-shape absolute rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm pointer-events-none opacity-0"
          style={{
            width: `${28 + (i % 4) * 18}px`,
            height: `${28 + (i % 4) * 18}px`,
            top: `${8 + (i * 7) % 78}%`,
            left: `${4 + (i * 13) % 88}%`,
            transform: `rotate(${i * 25}deg)`
          }}
        />
      ))}

      {/* Central Interactive Presentation Card - Precision Centered */}
      <div ref={cardRef} className="text-center z-10 max-w-lg w-full px-4 flex flex-col items-center justify-center opacity-0 my-auto">
        <div
          ref={iconRef}
          className="w-20 h-20 md:w-28 md:h-28 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl shadow-black/40 mb-5"
        >
          <CurrentIcon className={`w-10 h-10 md:w-14 md:h-14 ${theme.accent}`} />
        </div>

        <h1
          ref={titleRef}
          className="text-2xl md:text-4xl font-black tracking-tight text-white/90 drop-shadow-md opacity-0"
        >
          Selamat Datang,
        </h1>

        <h2
          ref={nameRef}
          className={`text-xl md:text-3xl font-extrabold mt-3 px-5 py-2 rounded-2xl inline-block border backdrop-blur-md shadow-xl opacity-0 ${theme.badgeBg}`}
        >
          {name}
        </h2>

        <p
          ref={subtitleRef}
          className="mt-4 text-xs md:text-sm font-medium text-white/65 tracking-wide uppercase opacity-0 max-w-sm mx-auto"
        >
          {theme.subtitle}
        </p>
      </div>

      {/* Screen Wipe Out Curtain */}
      <div
        ref={wipeRef}
        className="absolute inset-0 bg-background z-20 pointer-events-none"
        style={{ top: '100%' }}
      />
    </div>
  );

  return createPortal(content, document.body);
}
