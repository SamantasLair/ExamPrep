'use client';

import React, { useState, useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { StudentRow } from '@/lib/types';
import { User } from 'lucide-react';
import { AnimeBox } from '@/components/ui/AnimeBox';

interface StudentLoginProps {
  onLogin: (student: StudentRow) => void;
}

export function StudentLogin({ onLogin }: StudentLoginProps) {
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const blob1Ref = useRef<HTMLDivElement | null>(null);
  const blob2Ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let anim1: { revert: () => void } | null = null;
    let anim2: { revert: () => void } | null = null;

    if (blob1Ref.current) {
      anim1 = animate(blob1Ref.current, {
        scale: [1, 1.06, 1],
        rotate: [0, 5, 0],
        duration: 5000,
        loop: true,
        ease: 'inOutSine'
      }) as unknown as { revert: () => void };
    }

    if (blob2Ref.current) {
      anim2 = animate(blob2Ref.current, {
        scale: [1, 1.1, 1],
        rotate: [0, -6, 0],
        duration: 6500,
        loop: true,
        ease: 'inOutSine'
      }) as unknown as { revert: () => void };
    }

    return () => {
      anim1?.revert();
      anim2?.revert();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) return;
    setLoading(true);
    setError('');

    const { data, error: dbErr } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId.trim())
      .single();

    if (dbErr || !data) {
      setError('ID Siswa tidak ditemukan atau belum terdaftar.');
      setLoading(false);
      return;
    }

    onLogin(data as StudentRow);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4 relative overflow-hidden">
      {/* Decorative blobs powered by anime.js */}
      <div 
        ref={blob1Ref}
        className="absolute -top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" 
      />
      <div 
        ref={blob2Ref}
        className="absolute -bottom-20 -right-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" 
      />

      <AnimeBox 
        preset="pop" 
        duration={500} 
        className="w-full max-w-sm bg-card p-6 sm:p-7 rounded-xl shadow-xs border border-border/70 text-center z-10"
      >
        <AnimeBox 
          preset="slide-down" 
          delay={150} 
          duration={450} 
          ease="outBack"
          className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary cursor-default transition-transform hover:scale-105"
        >
          <User className="w-7 h-7" />
        </AnimeBox>
        
        <h1 className="text-xl font-semibold mb-1.5 tracking-tight text-foreground">Portal Siswa</h1>
        <p className="text-xs text-muted-foreground mb-6">Masukkan ID Siswa Anda untuk memulai sesi asesmen.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Input 
              placeholder="Contoh: EXA-001" 
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.toUpperCase())}
              className="text-center font-mono text-base uppercase h-11 rounded-lg border focus-visible:ring-offset-1 transition-all"
              disabled={loading}
              autoComplete="off"
            />
            {error && (
              <AnimeBox preset="fade-up" duration={250} className="text-xs text-destructive mt-1.5 font-medium">
                {error}
              </AnimeBox>
            )}
          </div>
          <div>
            <Button type="submit" className="w-full h-11 text-xs font-medium rounded-lg shadow-2xs" disabled={loading}>
              {loading ? 'Mencocokkan...' : 'Masuk Sekarang'}
            </Button>
          </div>
        </form>
      </AnimeBox>
    </div>
  );
}
