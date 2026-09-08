'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Database } from 'lucide-react';

interface DangerZoneTabProps {
  onExecuteWipe: (action: string) => Promise<void>;
  isSaving: boolean;
}

export function DangerZoneTab({ onExecuteWipe, isSaving }: DangerZoneTabProps) {
  const [dangerAction, setDangerAction] = useState<string | null>(null);
  const [dangerConfirmText, setDangerConfirmText] = useState('');

  const handleRunWipe = async (action: string) => {
    await onExecuteWipe(action);
    setDangerAction(null);
    setDangerConfirmText('');
  };

  return (
    <div className="flex-1 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 text-destructive">
          <AlertTriangle className="w-8 h-8" /> DANGER ZONE
        </h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Targeted Deletion */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 border border-destructive/20 rounded-2xl bg-card shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-destructive" /> Pembersihan Parsial
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Tindakan ini akan menghapus entitas tertentu secara permanen. Tidak dapat dibatalkan.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="border-destructive/30 text-destructive hover:bg-destructive hover:text-white justify-start" 
                onClick={() => { setDangerAction('WIPE_QUESTIONS'); setDangerConfirmText(''); }}
              >
                Kosongkan Bank Soal
              </Button>
              <Button 
                variant="outline" 
                className="border-destructive/30 text-destructive hover:bg-destructive hover:text-white justify-start" 
                onClick={() => { setDangerAction('WIPE_TESTS'); setDangerConfirmText(''); }}
              >
                Kosongkan Daftar Ujian
              </Button>
              <Button 
                variant="outline" 
                className="border-destructive/30 text-destructive hover:bg-destructive hover:text-white justify-start" 
                onClick={() => { setDangerAction('WIPE_ATTEMPTS'); setDangerConfirmText(''); }}
              >
                Hapus Riwayat Nilai
              </Button>
              <Button 
                variant="outline" 
                className="border-destructive/30 text-destructive hover:bg-destructive hover:text-white justify-start" 
                onClick={() => { setDangerAction('WIPE_STUDENTS'); setDangerConfirmText(''); }}
              >
                Hapus Semua Siswa
              </Button>
            </div>
          </div>

          {dangerAction && dangerAction !== 'WIPE_ALL' && (
            <div className="p-6 bg-destructive/5 rounded-2xl border-2 border-destructive/50 animate-in slide-in-from-top-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-destructive via-red-500 to-destructive" />
              <Label className="text-destructive font-black text-lg mb-2 block uppercase tracking-widest">
                Konfirmasi: {dangerAction}
              </Label>
              <p className="text-sm font-medium mb-4 text-destructive/80">
                Ketik kata <span className="font-mono bg-destructive text-white px-2 py-0.5 rounded shadow-sm mx-1">WIPE CLEAN</span> untuk mengeksekusi.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input 
                  value={dangerConfirmText} 
                  onChange={e => setDangerConfirmText(e.target.value)} 
                  placeholder="Ketik WIPE CLEAN..." 
                  className="border-destructive/50 focus-visible:ring-destructive font-mono text-lg py-6" 
                />
                <Button 
                  variant="destructive" 
                  size="lg" 
                  disabled={dangerConfirmText !== 'WIPE CLEAN' || isSaving} 
                  onClick={() => handleRunWipe(dangerAction)} 
                  className="py-6 font-bold shadow-xl shadow-destructive/20 w-full sm:w-auto"
                >
                  {isSaving ? 'MEMPROSES...' : 'EKSEKUSI SEKARANG'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: WIPE ALL */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 border-2 border-destructive bg-destructive/10 rounded-2xl shadow-[0_0_40px_rgba(239,68,68,0.15)] relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ef4444 25%, transparent 25%, transparent 75%, #ef4444 75%, #ef4444), repeating-linear-gradient(45deg, #ef4444 25%, transparent 25%, transparent 75%, #ef4444 75%, #ef4444)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }} />
            
            <div className="relative z-10">
              <h3 className="text-xl font-black text-destructive mb-2 uppercase tracking-widest">WIPE CLEAN ALL</h3>
              <p className="text-sm font-semibold text-destructive/80 mb-8 leading-relaxed">
                Sistem akan mereset ke hari pertama. Semua tabel akan dihapus bersih kecuali user admin.
              </p>
              
              <Button 
                variant="destructive" 
                className="w-full py-8 text-xl font-black shadow-2xl shadow-destructive/40 hover:scale-[1.02] transition-transform" 
                onClick={() => { setDangerAction('WIPE_ALL'); setDangerConfirmText(''); }}
              >
                TRIGGER WIPE ALL
              </Button>
            </div>
          </div>

          {dangerAction === 'WIPE_ALL' && (
            <div className="p-6 bg-black rounded-2xl border-2 border-red-600 animate-in zoom-in-95 relative shadow-2xl shadow-red-900/50">
              <AlertTriangle className="w-12 h-12 text-red-500 absolute top-6 right-6 opacity-20" />
              <Label className="text-red-500 font-black text-xl mb-4 block uppercase tracking-widest">
                PERINGATAN FINAL
              </Label>
              <p className="text-sm font-bold mb-6 text-red-400">
                Ketik kata <span className="font-mono bg-red-600 text-white px-2 py-0.5 rounded mx-1">WIPE CLEAN</span> untuk Kiamat Data.
              </p>
              <div className="space-y-4">
                <Input 
                  value={dangerConfirmText} 
                  onChange={e => setDangerConfirmText(e.target.value)} 
                  placeholder="WIPE CLEAN" 
                  className="bg-red-950/50 border-red-600 text-red-100 placeholder:text-red-800 focus-visible:ring-red-600 font-mono text-xl py-6 text-center" 
                />
                <Button 
                  variant="destructive" 
                  size="lg" 
                  disabled={dangerConfirmText !== 'WIPE CLEAN' || isSaving} 
                  onClick={() => handleRunWipe(dangerAction)} 
                  className="w-full py-6 text-xl font-black bg-red-600 hover:bg-red-700"
                >
                  {isSaving ? 'DESTROYING...' : 'CONFIRM DESTROY'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
