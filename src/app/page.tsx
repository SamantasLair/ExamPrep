'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TestRow } from '@/lib/types';
import { StudentLogin } from '@/components/auth/StudentLogin';
import { WelcomeAnimation } from '@/components/ui/WelcomeAnimation';
import { 
  LogOut, Search, Clock, Award, 
  BarChart2, BookOpen, Calendar, CheckCircle2, Play,
  ArrowRight, Layers, User
} from 'lucide-react';
import { AnimeBox } from '@/components/ui/AnimeBox';
import { useStudentPortalVM } from '@/viewmodels/useStudentPortalVM';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const {
    loading,
    student,
    showWelcome, setShowWelcome,
    handleLogin,
    handleLogout,
    categorized
  } = useStudentPortalVM();

  const [activeTab, setActiveTab] = useState<'all' | 'daily' | 'available' | 'upcoming' | 'past'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // All tests flattened
  const allTests = useMemo(() => {
    return [
      ...categorized.daily,
      ...categorized.available,
      ...categorized.upcoming,
      ...categorized.past
    ];
  }, [categorized]);

  const displayedTests = useMemo(() => {
    let list: TestRow[] = [];
    if (activeTab === 'all') list = allTests;
    else if (activeTab === 'daily') list = categorized.daily;
    else if (activeTab === 'available') list = categorized.available;
    else if (activeTab === 'upcoming') list = categorized.upcoming;
    else if (activeTab === 'past') list = categorized.past;

    // Remove duplicates
    const uniqueMap = new Map<string, TestRow>();
    list.forEach(item => uniqueMap.set(item.id, item));
    const uniqueList = Array.from(uniqueMap.values());

    if (!searchQuery.trim()) return uniqueList;
    const q = searchQuery.toLowerCase();
    return uniqueList.filter(t => 
      t.title.toLowerCase().includes(q) || 
      (t.description && t.description.toLowerCase().includes(q))
    );
  }, [activeTab, allTests, categorized, searchQuery]);

  if (!loading && !student) {
    return <StudentLogin onLogin={handleLogin} />;
  }

  const categoryMeta = {
    all: { title: 'Semua Paket Ujian', desc: 'Daftar lengkap seluruh paket asesmen yang terdaftar di kurikulum.' },
    daily: { title: 'Ujian Hari Ini', desc: 'Paket ujian aktif yang terjadwal untuk dikerjakan hari ini.' },
    available: { title: 'Latihan Mandiri', desc: 'Bank latihan fleksibel tanpa batasan waktu pengerjaan ketat.' },
    upcoming: { title: 'Jadwal Mendatang', desc: 'Asesmen terjadwal yang akan dibuka pada periode berikutnya.' },
    past: { title: 'Arsip & Riwayat', desc: 'Ujian yang telah selesai atau melewati batas masa aktif.' }
  };

  return (
    <AnimeBox 
      preset="page"
      className="min-h-screen flex flex-col bg-background text-foreground select-none"
    >
      {showWelcome && student && (
        <WelcomeAnimation name={student.name} onComplete={() => setShowWelcome(false)} />
      )}

      {/* TOP STUDIO APP BAR (Slim 52px) */}
      <header className="h-13 border-b border-border/60 bg-card/90 backdrop-blur-md sticky top-0 z-20 px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground">ExaPrep</span>
          <span className="text-muted-foreground/30 text-xs hidden sm:inline">•</span>
          <span className="text-xs text-muted-foreground hidden sm:inline font-normal">Portal Siswa</span>
        </div>

        {student && (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 pr-2 border-r border-border/60">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground overflow-hidden text-xs font-medium">
                {student.avatar_url ? (
                  <img src={student.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-medium text-foreground leading-tight">{student.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{student.id}</p>
              </div>
            </div>

            <Link href={`/student/${student.id}`}>
              <Button variant="outline" size="sm" className="h-8 text-xs font-medium rounded-lg gap-1.5 border-border/70 hover:bg-muted">
                <BarChart2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="hidden sm:inline">Portofolio</span>
              </Button>
            </Link>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout} 
              className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg" 
              title="Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </header>

      {/* WORKSPACE LAYOUT (Modern 2-Column Cockpit on Desktop, Zero Vertical Stacking) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full">
        {/* LEFT RAIL / COCKPIT PANEL (Fixed Width on Desktop) */}
        {student && (
          <aside className="w-full lg:w-72 xl:w-80 border-b lg:border-b-0 lg:border-r border-border/60 bg-card/40 flex flex-col justify-between shrink-0 p-4 xl:p-5 gap-5 overflow-y-auto custom-scrollbar">
            <div className="space-y-5">
              {/* Student Identity Card */}
              <div className="p-3.5 rounded-xl border border-border/70 bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xs font-semibold text-foreground truncate">{student.name}</h2>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{student.id}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Siswa Terverifikasi
                    </span>
                  </div>
                </div>

                {/* Quick Status Counter */}
                <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-border/50 text-center">
                  <div className="p-1.5 rounded-lg bg-muted/40">
                    <p className="text-[10px] text-muted-foreground">Aktif</p>
                    <p className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{categorized.daily.length}</p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-muted/40">
                    <p className="text-[10px] text-muted-foreground">Latihan</p>
                    <p className="text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400">{categorized.available.length}</p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-muted/40">
                    <p className="text-[10px] text-muted-foreground">Total</p>
                    <p className="text-sm font-semibold tabular-nums text-foreground">{allTests.length}</p>
                  </div>
                </div>
              </div>

              {/* Category Navigation (Vertical Cockpit Menu) */}
              <div className="space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-2 mb-1.5">
                  Kategori Ujian
                </p>

                <button
                  onClick={() => setActiveTab('all')}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer",
                    activeTab === 'all' 
                      ? "bg-primary/10 text-primary font-semibold" 
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Semua Paket</span>
                  </div>
                  <span className="text-[11px] tabular-nums font-mono px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground">
                    {allTests.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('daily')}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer",
                    activeTab === 'daily' 
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold" 
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Hari Ini</span>
                  </div>
                  <span className="text-[11px] tabular-nums font-mono px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    {categorized.daily.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('available')}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer",
                    activeTab === 'available' 
                      ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold" 
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Play className="w-3.5 h-3.5 text-blue-500" />
                    <span>Latihan Mandiri</span>
                  </div>
                  <span className="text-[11px] tabular-nums font-mono px-1.5 py-0.2 rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-300">
                    {categorized.available.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer",
                    activeTab === 'upcoming' 
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold" 
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>Mendatang</span>
                  </div>
                  <span className="text-[11px] tabular-nums font-mono px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300">
                    {categorized.upcoming.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('past')}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer",
                    activeTab === 'past' 
                      ? "bg-zinc-500/10 text-zinc-800 dark:text-zinc-200 font-semibold" 
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Award className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Arsip / Selesai</span>
                  </div>
                  <span className="text-[11px] tabular-nums font-mono px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground">
                    {categorized.past.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Bottom Quick Link to Analytics */}
            <div className="pt-3 border-t border-border/50">
              <Link href={`/student/${student.id}`} className="block">
                <div className="p-3 rounded-xl border border-border/70 bg-card hover:border-primary/40 hover:bg-muted/20 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <BarChart2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">Analisis Portofolio</p>
                      <p className="text-[10px] text-muted-foreground">Grafik & Riwayat IRT</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </Link>
            </div>
          </aside>
        )}

        {/* RIGHT MAIN CATALOG AREA (Full Ergonomic Height, Zero Sprawl) */}
        <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
          {/* Catalog Controls Header */}
          <div className="px-5 py-3.5 border-b border-border/60 bg-card/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-foreground">
                {categoryMeta[activeTab].title}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {categoryMeta[activeTab].desc}
              </p>
            </div>

            {/* Instant Search Bar */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari paket ujian..."
                className="h-8 pl-8 text-xs rounded-lg border-border/70 bg-card focus:border-primary shadow-2xs"
              />
            </div>
          </div>

          {/* Catalog Grid Area */}
          <div className="flex-1 overflow-y-auto p-5 md:p-6 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-64 text-xs text-muted-foreground">
                Memuat paket ujian...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {displayedTests.map((test) => {
                  const isDaily = categorized.daily.some(d => d.id === test.id);
                  const isAvailable = categorized.available.some(a => a.id === test.id);
                  const isUpcoming = categorized.upcoming.some(u => u.id === test.id);

                  return (
                    <Card 
                      key={test.id} 
                      className="rounded-xl border border-border/70 bg-card hover:border-zinc-400 dark:hover:border-zinc-600 transition-all p-4 flex flex-col justify-between space-y-3 shadow-2xs"
                    >
                      <div>
                        {/* Pill Status Strip */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={cn(
                            "text-[10px] font-medium px-2 py-0.5 rounded-md",
                            isDaily ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" :
                            isAvailable ? "bg-blue-500/10 text-blue-700 dark:text-blue-300" :
                            isUpcoming ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" :
                            "bg-muted text-muted-foreground"
                          )}>
                            {isDaily ? 'Aktif Hari Ini' : isAvailable ? 'Latihan Publik' : isUpcoming ? 'Mendatang' : 'Arsip'}
                          </span>
                          
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
                            <Clock className="w-3 h-3" />
                            <span>{test.duration_minutes}m</span>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h2 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                          {test.title}
                        </h2>
                        {test.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                            {test.description}
                          </p>
                        )}
                      </div>

                      {/* Card Footer: Metadata & Actions */}
                      <div className="space-y-3 pt-3 border-t border-border/50">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] text-muted-foreground">KKM Kelulusan</span>
                          <span className="font-semibold text-foreground tabular-nums">{test.passing_grade}</span>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/exam/${test.id}`} className="flex-1">
                            <Button size="sm" className="w-full h-8 text-xs font-medium rounded-lg gap-1.5 shadow-2xs">
                              <Play className="w-3 h-3 fill-current" />
                              Mulai Ujian
                            </Button>
                          </Link>
                          <Link href={`/exam/${test.id}/review`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full h-8 text-xs font-medium rounded-lg border-border/70 hover:bg-muted">
                              Review
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  );
                })}

                {displayedTests.length === 0 && (
                  <div className="col-span-full p-12 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                    Tidak ada paket ujian yang ditemukan pada kategori ini.
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </AnimeBox>
  );
}
