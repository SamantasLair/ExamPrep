'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, User, Calendar } from 'lucide-react';

interface AttemptsTabProps {
  attemptList: any[];
  onRefresh: () => void;
}

export function AttemptsTab({ attemptList, onRefresh }: AttemptsTabProps) {
  return (
    <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Riwayat Pengerjaan</h2>
          <p className="text-sm text-muted-foreground mt-1">Pantau skor dan status ujian para siswa secara real-time.</p>
        </div>
        <Button onClick={onRefresh} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs transition-all gap-2 h-10 px-5 font-semibold rounded-xl">
          Segarkan Data
        </Button>
      </div>
      
      {attemptList.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-muted/10">
          <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold tracking-tight text-foreground">Belum ada peserta ujian</h3>
          <p className="text-sm text-muted-foreground mb-6">Riwayat pengerjaan siswa akan muncul di sini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {attemptList.map((att) => (
            <Card key={att.id} className="group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border-border/60 hover:border-primary/50 overflow-hidden flex flex-col rounded-xl bg-card">
              <CardHeader className="p-4 border-b border-border/60 bg-gradient-to-br from-muted/30 to-muted/10 group-hover:from-primary/5 group-hover:to-transparent transition-colors pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold tracking-tight text-foreground line-clamp-2 leading-tight">{att.tests?.title || 'Ujian Dihapus'}</CardTitle>
                  {att.status === 'finished' ? (
                    <Badge className="bg-green-500 hover:bg-green-600 font-semibold shrink-0 shadow-xs rounded-lg">Selesai</Badge>
                  ) : (
                    <Badge variant="secondary" className="font-semibold shrink-0 rounded-lg">Berjalan</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col justify-center items-center py-6 bg-muted/5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Total Skor</span>
                  <span className={`text-6xl font-bold tracking-tighter ${att.score && att.score >= 70 ? 'text-green-500' : att.score && att.score > 0 ? 'text-destructive' : 'text-foreground'}`}>
                    {att.score ?? '-'}
                  </span>
                </div>
              </CardContent>
              <div className="p-3 border-t border-border/60 bg-muted/10 flex flex-col gap-1 mt-auto text-xs text-muted-foreground font-medium">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-primary" /> ID Peserta: <span className="font-semibold text-foreground">{att.student_id || 'Anonim'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Selesai: <span className="font-semibold text-foreground">{att.finished_at ? new Date(att.finished_at).toLocaleString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '-'}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
