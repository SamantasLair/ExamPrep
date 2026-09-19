'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Columns, AlertTriangle, LineChart } from 'lucide-react';

interface AnalyticsTabProps {
  analysis: any[];
  loading: boolean;
  error: string | null;
  onBackToTests: () => void;
}

export function AnalyticsTab({
  analysis,
  loading,
  error,
  onBackToTests,
}: AnalyticsTabProps) {
  return (
    <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Analisis Butir Soal (IRT)</h2>
          <p className="text-sm text-muted-foreground mt-1">Mengevaluasi tingkat kesukaran ($p$) untuk memastikan kalibrasi ujian yang presisi.</p>
        </div>
        <Button onClick={onBackToTests} variant="outline" className="gap-2 h-10 px-5 font-semibold rounded-xl border-border/60">
          Kembali ke Daftar
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-muted/10 animate-pulse">
          <Columns className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold tracking-tight text-foreground">Menganalisis Pola Respons...</h3>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-destructive/20 bg-destructive/5 rounded-xl">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold text-destructive">Gagal Menarik Data</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      ) : analysis.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-muted/10">
          <LineChart className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold tracking-tight text-foreground">Data Belum Mencukupi</h3>
          <p className="text-sm text-muted-foreground">Belum ada populasi percobaan yang memadai untuk menghitung tingkat kesukaran.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {analysis.map((item, idx) => (
            <Card key={item.questionId} className="group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border-border/60 hover:border-primary/50 overflow-hidden flex flex-col rounded-xl bg-card">
              <CardHeader className="p-4 border-b border-border/60 bg-gradient-to-br from-muted/30 to-muted/10 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Nomor Soal</span>
                    <CardTitle className="text-lg font-semibold tracking-tight text-foreground line-clamp-1 leading-tight">Q{idx + 1}</CardTitle>
                  </div>
                  {item.status === 'too_hard' && <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 font-semibold shadow-xs text-[10px] rounded-lg">Sangat Sulit</Badge>}
                  {item.status === 'too_easy' && <Badge variant="outline" className="border-green-500 text-green-600 bg-green-500/10 font-semibold text-[10px] rounded-lg">Terlalu Mudah</Badge>}
                  {item.status === 'ideal' && <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-xs text-[10px] rounded-lg">Ideal</Badge>}
                </div>
              </CardHeader>
              <CardContent className="p-5 flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-background">
                <div className="relative z-10 flex flex-col items-center">
                  <span className={`text-5xl font-bold tracking-tighter ${item.status === 'too_hard' ? 'text-destructive' : item.status === 'ideal' ? 'text-blue-500' : 'text-green-500'}`}>
                    {(item.p).toFixed(2)}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mt-2">Tingkat Kesukaran ($p$)</span>
                </div>
              </CardContent>
              <div className="p-3 border-t border-border/60 bg-muted/10 grid grid-cols-2 gap-2 text-xs font-medium text-muted-foreground mt-auto">
                <div className="flex flex-col px-2">
                  <span className="text-[10px] uppercase font-semibold">Tipe Soal</span>
                  <span className="font-semibold text-foreground line-clamp-1">{item.type}</span>
                </div>
                <div className="flex flex-col px-2 border-l border-border/60">
                  <span className="text-[10px] uppercase font-semibold">Rasio Jawaban Benar</span>
                  <span className="font-semibold text-foreground line-clamp-1">{item.correctAttempts} / {item.totalAttempts}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
