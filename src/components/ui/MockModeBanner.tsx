'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isMockMode } from '@/lib/supabase';
import { resetMockData } from '@/lib/mockSupabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, RotateCcw, ChevronDown, ChevronUp, User, ShieldCheck } from 'lucide-react';

export function MockModeBanner() {
  const [mounted, setMounted] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isMockMode || pathname?.startsWith('/exam/')) return null;

  const handleReset = () => {
    if (window.confirm('Reset semua data mock lokal (siswa, ujian, riwayat attempt, bank soal) ke kondisi awal demo?')) {
      resetMockData();
      localStorage.removeItem('exaprep_student');
      window.location.href = '/';
    }
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs px-3 py-1.5 flex items-center justify-between z-50 sticky top-0 backdrop-blur-md">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="border-amber-500/50 bg-amber-500/20 text-amber-900 dark:text-amber-100 text-[10px] font-bold px-1.5 py-0 flex items-center gap-1">
          <Database className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          MOCK MODE (OFFLINE LOCAL)
        </Badge>
        {!minimized && (
          <div className="flex items-center gap-3 text-[11px] flex-wrap">
            <span className="flex items-center gap-1 text-muted-foreground">
              <User className="w-3 h-3" />
              Siswa: <strong className="text-foreground">EXA-001</strong>, <strong className="text-foreground">EXA-002</strong>, <strong className="text-foreground">EXA-003</strong>
            </span>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <ShieldCheck className="w-3 h-3" />
              Admin: <strong className="text-foreground">/adminDoor</strong> (Password: <code className="bg-muted px-1 py-0.5 rounded font-mono">superSeecreetPassword</code>)
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          size="sm"
          variant="outline"
          onClick={handleReset}
          className="h-6 px-2 text-[10px] border-amber-500/40 hover:bg-amber-500/20 text-amber-900 dark:text-amber-100 flex items-center gap-1"
          title="Reset database lokal kembali ke awal"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          Reset Demo
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setMinimized(!minimized)}
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          title={minimized ? 'Perluas informasi' : 'Perkecil banner'}
        >
          {minimized ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </Button>
      </div>
    </div>
  );
}
