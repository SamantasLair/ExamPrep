'use client';

import React, { useState } from 'react';
import type { StudentRow } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Plus, Settings2, Database, Trash2 } from 'lucide-react';

interface StudentsTabProps {
  studentList: StudentRow[];
  stuPrefix: string;
  setStuPrefix: (val: string) => void;
  stuCount: number | string;
  setStuCount: (val: any) => void;
  generatingStu: boolean;
  stuMsg: string | null;
  onGenerateStudents: () => Promise<void>;
  onRefresh: () => void;
  onSingleRegister: (id: string, name: string) => Promise<void>;
}

export function StudentsTab({
  studentList,
  stuPrefix,
  setStuPrefix,
  stuCount,
  setStuCount,
  generatingStu,
  stuMsg,
  onGenerateStudents,
  onRefresh,
  onSingleRegister,
}: StudentsTabProps) {
  const [manualId, setManualId] = useState('');
  const [manualName, setManualName] = useState('');

  const handleRegister = async () => {
    if (!manualId.trim() || !manualName.trim()) return;
    await onSingleRegister(manualId.trim(), manualName.trim());
    setManualId('');
    setManualName('');
  };

  return (
    <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Manajemen Data Siswa</h2>
          <p className="text-sm text-muted-foreground mt-1">Buat ID Siswa (Manual / Massal) untuk mengatur akses login ujian.</p>
        </div>
        <Button onClick={onRefresh} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all gap-2 h-10 px-6 font-bold rounded-full">
          Segarkan Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buat Manual */}
        <Card className="border-border/50 shadow-sm hover:border-primary/30 transition-colors bg-card">
          <CardHeader className="p-5 border-b bg-muted/20 pb-4">
            <CardTitle className="text-base font-black flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Pendaftaran Tunggal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">ID Siswa (Unik)</Label>
              <Input 
                placeholder="Cth: Budi-2024" 
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                className="h-10 bg-muted/30 focus-visible:bg-background transition-colors" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nama Lengkap</Label>
              <Input 
                placeholder="Cth: Budi Santoso" 
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="h-10 bg-muted/30 focus-visible:bg-background transition-colors" 
              />
            </div>
            <Button 
              onClick={handleRegister} 
              disabled={generatingStu || !manualId.trim() || !manualName.trim()}
              className="w-full h-10 font-bold gap-2"
            >
              {generatingStu ? 'Memproses...' : <><Plus className="w-4 h-4"/> Daftarkan Siswa</>}
            </Button>
          </CardContent>
        </Card>

        {/* Generate Auto */}
        <Card className="border-border/50 shadow-sm hover:border-primary/30 transition-colors bg-card relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Settings2 className="w-32 h-32" />
          </div>
          <CardHeader className="p-5 border-b bg-muted/20 pb-4 relative z-10">
            <CardTitle className="text-base font-black flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" /> Generate ID Massal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 relative z-10">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Prefix (Awalan)</Label>
                <Input placeholder="SMA-" value={stuPrefix} onChange={e => setStuPrefix(e.target.value)} className="h-10 bg-muted/30 focus-visible:bg-background transition-colors font-mono" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Jumlah</Label>
                <Input type="number" placeholder="10" value={stuCount} onChange={e => setStuCount(e.target.value)} className="h-10 bg-muted/30 focus-visible:bg-background transition-colors" />
              </div>
            </div>
            <div className="pt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded border border-border/50">
              Sistem akan menghasilkan: <strong className="font-mono text-foreground">{stuPrefix}001</strong> s/d <strong className="font-mono text-foreground">{stuPrefix}{String(stuCount).padStart(3, '0')}</strong>
            </div>
            <Button onClick={onGenerateStudents} disabled={generatingStu} className="w-full h-10 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md gap-2">
              {generatingStu ? 'Mesin Bekerja...' : <><Database className="w-4 h-4"/> Generate Otomatis</>}
            </Button>
          </CardContent>
        </Card>
      </div>

      {stuMsg && (
        <div className="p-4 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-bold shadow-sm flex items-center justify-center animate-in fade-in zoom-in-95">
          {stuMsg}
        </div>
      )}

      {studentList.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-2xl bg-muted/10 mt-6">
          <User className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-bold">Basis Data Siswa Kosong</h3>
          <p className="text-sm text-muted-foreground mb-6">Daftarkan siswa secara manual atau gunakan mesin otomatis di atas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-8">
          {studentList.map((stu) => (
            <div key={stu.id} className="group relative flex flex-col items-center p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/10 flex items-center justify-center text-xl font-black text-primary mb-3 shadow-inner">
                {stu.name ? stu.name.charAt(0).toUpperCase() : stu.id.charAt(0).toUpperCase()}
              </div>
              <div className="text-center w-full">
                <h4 className="font-bold text-sm truncate w-full" title={stu.name || stu.id}>{stu.name || stu.id}</h4>
                <p className="text-xs text-muted-foreground font-mono mt-1 px-2 py-0.5 bg-muted/50 rounded-md border border-border/50 inline-block">{stu.id}</p>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="w-6 h-6 rounded-full bg-background/80 backdrop-blur text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
