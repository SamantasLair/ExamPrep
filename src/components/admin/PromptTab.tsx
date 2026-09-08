'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LabelSelector, type LabelTaxonomy } from '@/components/exam/LabelSelector';
import { Settings2, HelpCircle, Type, CheckCircle2, Copy } from 'lucide-react';

interface PromptTabProps {
  promptType: string;
  setPromptType: (val: string) => void;
  promptCount: string;
  setPromptCount: (val: string) => void;
  promptLang: string;
  setPromptLang: (val: string) => void;
  promptLevel: string;
  setPromptLevel: (val: string) => void;
  promptContext: string;
  setPromptContext: (val: string) => void;
  promptOther: string;
  setPromptOther: (val: string) => void;
  promptLabels: LabelTaxonomy;
  setPromptLabels: React.Dispatch<React.SetStateAction<LabelTaxonomy>>;
  tipsRange: string;
  setTipsRange: (val: string) => void;
  isCustomTips: boolean;
  setIsCustomTips: (val: boolean) => void;
  generatedPrompt: string;
  copiedPrompt: boolean;
  onCopyPrompt: () => void;
}

export function PromptTab({
  promptType,
  setPromptType,
  promptCount,
  setPromptCount,
  promptLang,
  setPromptLang,
  promptLevel,
  setPromptLevel,
  promptContext,
  setPromptContext,
  promptOther,
  setPromptOther,
  promptLabels,
  setPromptLabels,
  tipsRange,
  setTipsRange,
  isCustomTips,
  setIsCustomTips,
  generatedPrompt,
  copiedPrompt,
  onCopyPrompt,
}: PromptTabProps) {
  return (
    <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight">AI Prompt Generator</h2>
          <p className="text-sm text-muted-foreground mt-1">Rakitan prompt spesifik untuk AI sesuai dengan standar ekosistem ExaPrep.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
        <Card className="border-border/50 shadow-sm hover:border-primary/30 transition-colors bg-card">
          <CardHeader className="p-5 border-b bg-muted/20 pb-4">
            <CardTitle className="text-base font-black flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" /> Karakteristik Soal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            <div className="space-y-2 relative">
              <Label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Tipe Soal 
                <span className="group relative cursor-help">
                  <HelpCircle className="w-3.5 h-3.5 text-primary/70" />
                  <span className="pointer-events-none absolute left-0 bottom-full mb-2 w-64 rounded bg-popover p-2 text-xs text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100 dark:border z-50 normal-case font-medium">
                    Pilih tipe soal yang akan di-generate oleh AI. Pastikan AI mengetahui format yang diinginkan seperti (PILGAN) atau (ESSAY).
                  </span>
                </span>
              </Label>
              <select 
                className="w-full flex h-10 rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-sm ring-offset-background focus-visible:bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-semibold"
                value={promptType} 
                onChange={(e) => setPromptType(e.target.value)}
              >
                <option value="Pilihan Ganda (PILGAN)">Pilihan Ganda (PILGAN)</option>
                <option value="Esai (ESSAY)">Esai (ESSAY)</option>
                <option value="Campuran Teks dan Gambar">Campuran (Pilihan Ganda & Esai)</option>
              </select>
            </div>

            <div className="space-y-2 relative">
              <Label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Jumlah Soal
                <span className="group relative cursor-help">
                  <HelpCircle className="w-3.5 h-3.5 text-primary/70" />
                  <span className="pointer-events-none absolute left-0 bottom-full mb-2 w-48 rounded bg-popover p-2 text-xs text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100 dark:border z-50 normal-case font-medium">
                    Sangat disarankan membatasi maksimal 15 soal per prompt agar respon AI tidak terpotong.
                  </span>
                </span>
              </Label>
              <Input placeholder="Cth: 10" value={promptCount} onChange={(e) => setPromptCount(e.target.value)} className="h-10 bg-muted/30 focus-visible:bg-background transition-colors font-mono font-bold" />
            </div>

            <div className="space-y-2 relative">
              <Label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Rentang Bantuan Tips
                <span className="group relative cursor-help">
                  <HelpCircle className="w-3.5 h-3.5 text-primary/70" />
                  <span className="pointer-events-none absolute left-0 bottom-full mb-2 w-48 rounded bg-popover p-2 text-xs text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100 dark:border z-50 normal-case font-medium">
                    Jumlah tips yang akan dihasilkan AI per soal.
                  </span>
                </span>
              </Label>
              <select 
                className="w-full flex h-10 rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-sm ring-offset-background focus-visible:bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-semibold"
                value={isCustomTips ? "custom" : tipsRange} 
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomTips(true);
                    setTipsRange('0-5');
                  } else {
                    setIsCustomTips(false);
                    setTipsRange(e.target.value);
                  }
                }}
              >
                <option value="0-0">0-0 (Tanpa Tips)</option>
                <option value="0-1">0-1 (Sedikit Bantuan)</option>
                <option value="1-2">1-2 (Bantuan Menengah)</option>
                <option value="1-3">1-3 (Bantuan Ekstra)</option>
                <option value="2-4">2-4 (Banyak Bantuan)</option>
                <option value="0-5">0-5 (Variasi Lebar)</option>
                <option value="custom">Kustom...</option>
              </select>
              {isCustomTips && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                  <Input 
                    placeholder="Ketik rentang (misal: 3-5, 0-10)..." 
                    value={tipsRange} 
                    onChange={(e) => setTipsRange(e.target.value)} 
                    className="h-10 bg-muted/30 focus-visible:bg-background transition-colors font-mono font-bold"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2 relative">
              <Label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Bahasa
              </Label>
              <Input placeholder="Cth: Indonesia (Baku)" value={promptLang} onChange={(e) => setPromptLang(e.target.value)} className="h-10 bg-muted/30 focus-visible:bg-background transition-colors font-semibold" />
            </div>

            <div className="space-y-2 relative">
              <Label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Tingkat Soal / Level
              </Label>
              <Input placeholder="Cth: SD Kelas 6, Olimpiade Matematika" value={promptLevel} onChange={(e) => setPromptLevel(e.target.value)} className="h-10 bg-muted/30 focus-visible:bg-background transition-colors font-semibold" />
            </div>

            <div className="space-y-2 relative">
              <Label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Konteks Penting Topik
              </Label>
              <Textarea 
                placeholder="Cth: Semua soal wajib berisi Diagram Interaktif (JSXGraph), topik geometri lingkaran." 
                value={promptContext} 
                onChange={(e) => setPromptContext(e.target.value)} 
                className="h-24 resize-none bg-muted/30 focus-visible:bg-background transition-colors font-semibold"
              />
            </div>

            <div className="space-y-2 relative">
              <Label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Konteks Lainnya (Opsional)
              </Label>
              <Textarea 
                placeholder="Cth: Hindari soal yang terlalu trivial." 
                value={promptOther} 
                onChange={(e) => setPromptOther(e.target.value)} 
                className="h-24 resize-none bg-muted/30 focus-visible:bg-background transition-colors font-semibold"
              />
            </div>
            
            <div className="space-y-2 relative pt-4 border-t border-border/50">
              <Label className="flex items-center gap-2 mb-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Taxonomi & Label Soal
              </Label>
              <LabelSelector selectedLabels={promptLabels} onChange={setPromptLabels} />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col h-full space-y-6">
          <Card className="border-border/50 shadow-sm hover:border-primary/30 transition-colors bg-card flex-1 flex flex-col overflow-hidden">
            <CardHeader className="p-4 border-b bg-gradient-to-br from-primary/10 to-primary/5 pb-3">
              <CardTitle className="text-base font-black flex justify-between items-center text-primary">
                <div className="flex items-center gap-2">
                  <Type className="w-5 h-5" /> Hasil Prompt AI
                </div>
                <Button size="sm" onClick={onCopyPrompt} className={`gap-2 transition-colors font-bold shadow-sm ${copiedPrompt ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'}`}>
                  {copiedPrompt ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  {copiedPrompt ? 'Tersalin!' : 'Salin Teks'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-1 relative min-h-[400px]">
              <Textarea
                readOnly
                value={generatedPrompt}
                className="absolute inset-0 h-full w-full font-mono text-sm resize-none border-0 focus-visible:ring-0 rounded-none p-5 text-foreground bg-muted/5 leading-relaxed selection:bg-primary/20"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
