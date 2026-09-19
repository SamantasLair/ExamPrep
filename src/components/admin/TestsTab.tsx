'use client';

import React from 'react';
import type { TestRow } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Clock, Target, LineChart, Link, Eye, Edit2, Trash2 } from 'lucide-react';

interface TestsTabProps {
  testList: TestRow[];
  onCreateNew: () => void;
  onEdit: (test: TestRow) => void;
  onDelete: (testId: string) => void;
  onAnalytics: (testId: string) => void;
  onCopyLink: (testId: string) => void;
}

export function TestsTab({
  testList,
  onCreateNew,
  onEdit,
  onDelete,
  onAnalytics,
  onCopyLink,
}: TestsTabProps) {
  return (
    <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Daftar Ujian Aktif</h2>
          <p className="text-sm text-muted-foreground mt-1">Kelola dan pantau seluruh sesi ujian yang tersedia.</p>
        </div>
        <Button onClick={onCreateNew} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs transition-all gap-2 h-10 px-5 font-semibold rounded-xl">
          <Plus className="w-4 h-4" /> Buat Ujian Baru
        </Button>
      </div>
      
      {testList.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-muted/10">
          <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold tracking-tight text-foreground">Belum ada ujian yang dibuat</h3>
          <p className="text-sm text-muted-foreground mb-6">Mulai rakit sesi ujian pertama Anda sekarang.</p>
          <Button onClick={onCreateNew} variant="outline" className="gap-2 rounded-xl font-semibold border-border/60">
            <Plus className="w-4 h-4" /> Buat Ujian
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testList.map((test) => (
            <Card key={test.id} className="group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border-border/60 hover:border-primary/50 overflow-hidden flex flex-col rounded-xl bg-card">
              <CardHeader className="p-5 border-b border-border/60 bg-gradient-to-br from-muted/30 to-muted/10 group-hover:from-primary/5 group-hover:to-transparent transition-colors pb-4">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-lg font-semibold tracking-tight text-foreground line-clamp-2 leading-tight">{test.title}</CardTitle>
                  <Badge variant={(!test.start_at && !test.end_at) ? "default" : "secondary"} className="shrink-0 font-semibold tracking-wide rounded-lg">
                    {(!test.start_at && !test.end_at) ? 'HARIAN' : 'TERJADWAL'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Durasi</span>
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" /> {test.duration_minutes} Menit
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">KKM</span>
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-primary" /> {test.passing_grade}
                    </span>
                  </div>
                </div>
                
                {(test.start_at || test.end_at) && (
                  <div className="bg-muted/30 p-3 rounded-xl text-xs space-y-2 border border-border/60">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-medium">Mulai:</span>
                      <span className="font-semibold text-foreground">
                        {test.start_at ? new Date(test.start_at).toLocaleString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-medium">Selesai:</span>
                      <span className="font-semibold text-foreground">
                        {test.end_at ? new Date(test.end_at).toLocaleString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '-'}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
              <div className="p-4 border-t border-border/60 bg-muted/5 flex items-center justify-between gap-2 mt-auto">
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10 hover:text-primary gap-1.5 font-semibold rounded-xl px-2.5" onClick={() => onAnalytics(test.id)} title="Analisis Butir Soal">
                    <LineChart className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-600/10 hover:text-blue-600 gap-1.5 font-semibold rounded-xl px-2.5" onClick={() => onCopyLink(test.id)} title="Salin Tautan Ujian">
                    <Link className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-emerald-600 hover:bg-emerald-600/10 hover:text-emerald-600 gap-1.5 font-semibold rounded-xl px-2.5" onClick={() => window.open(`/exam/${test.id}`, '_blank')} title="Preview Ujian">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5 bg-background hover:bg-muted font-semibold px-3 rounded-xl border-border/60" onClick={() => onEdit(test)}>
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" className="gap-1.5 shadow-xs px-3 rounded-xl" onClick={() => onDelete(test.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
