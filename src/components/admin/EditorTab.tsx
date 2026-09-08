'use client';

import React from 'react';
import type { Question } from '@/lib/types';
import { QuestionRenderer } from '@/components/exam/QuestionRenderer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings2, FileText, Calendar, CheckCircle2, HelpCircle, Edit2, Database } from 'lucide-react';

interface EditorTabProps {
  editId: string | null;
  examTitle: string;
  setExamTitle: (val: string) => void;
  examDescription: string;
  setExamDescription: (val: string) => void;
  duration: number;
  setDuration: (val: number) => void;
  passingGrade: number;
  setPassingGrade: (val: number) => void;
  startAt: string;
  setStartAt: (val: string) => void;
  endAt: string;
  setEndAt: (val: string) => void;
  isDaily: boolean;
  setIsDaily: (val: boolean) => void;
  handleDailyToggle: (val: boolean) => void;
  showAnswer: boolean;
  setShowAnswer: (val: boolean) => void;
  immediateFeedback: boolean;
  setImmediateFeedback: (val: boolean) => void;
  enableTipPenalty: boolean;
  setEnableTipPenalty: (val: boolean) => void;
  penaltyTheoryConfig: string;
  setPenaltyTheoryConfig: (val: string) => void;
  penaltyPracticeConfig: string;
  setPenaltyPracticeConfig: (val: string) => void;
  showSettings: boolean;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
  rawMarkdown: string;
  setRawMarkdown: React.Dispatch<React.SetStateAction<string>>;
  questions: Question[];
  currentPreviewIdx: number;
  setCurrentPreviewIdx: React.Dispatch<React.SetStateAction<number>>;
  slideDir: 'left' | 'right';
  setSlideDir: (dir: 'left' | 'right') => void;
  saveMsg: string | null;
  onOpenBankPicker: () => void;
}

export function EditorTab({
  editId,
  examTitle,
  setExamTitle,
  examDescription,
  setExamDescription,
  duration,
  setDuration,
  passingGrade,
  setPassingGrade,
  startAt,
  setStartAt,
  endAt,
  setEndAt,
  isDaily,
  handleDailyToggle,
  showAnswer,
  setShowAnswer,
  immediateFeedback,
  setImmediateFeedback,
  enableTipPenalty,
  setEnableTipPenalty,
  penaltyTheoryConfig,
  setPenaltyTheoryConfig,
  penaltyPracticeConfig,
  setPenaltyPracticeConfig,
  showSettings,
  setShowSettings,
  rawMarkdown,
  setRawMarkdown,
  questions,
  currentPreviewIdx,
  setCurrentPreviewIdx,
  slideDir,
  setSlideDir,
  saveMsg,
  onOpenBankPicker,
}: EditorTabProps) {
  return (
    <div className="flex-1 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {saveMsg && (
        <div className="p-4 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-bold shadow-sm flex items-center justify-center">
          {saveMsg}
        </div>
      )}
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">{editId ? 'Edit Konfigurasi Ujian' : 'Konfigurasi Ujian Baru'}</h2>
          <p className="text-sm text-muted-foreground mt-1">Atur parameter ujian dan tulis soal markdown Anda di bawah.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)} className="gap-2 rounded-full font-semibold">
          <Settings2 className="w-4 h-4" /> {showSettings ? 'Sembunyikan Panel' : 'Tampilkan Panel'}
        </Button>
      </div>

      {showSettings && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 animate-in slide-in-from-top-4 duration-500">
          {/* Card 1: Identitas Ujian */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4 hover:border-primary/30 transition-colors">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary border-b border-border/50 pb-3">
              <FileText className="w-4 h-4" /> Identitas Dasar
            </h3>
            <div className="space-y-2">
              <Label htmlFor="exam-title" className="text-xs font-bold text-muted-foreground">Judul Ujian</Label>
              <Input id="exam-title" placeholder="Cth: Ujian Harian" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} className="h-10 text-sm bg-muted/30 focus-visible:bg-background transition-colors" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-desc" className="text-xs font-bold text-muted-foreground">Deskripsi Singkat (Opsional)</Label>
              <Textarea id="exam-desc" placeholder="Instruksi tambahan untuk siswa..." value={examDescription} onChange={(e) => setExamDescription(e.target.value)} className="min-h-[80px] text-sm bg-muted/30 focus-visible:bg-background resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-xs font-bold text-muted-foreground">Durasi (m)</Label>
                <Input id="duration" type="number" min={1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="h-10 text-sm bg-muted/30 focus-visible:bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kkm" className="text-xs font-bold text-muted-foreground">KKM</Label>
                <Input id="kkm" type="number" min={0} max={100} value={passingGrade} onChange={(e) => setPassingGrade(Number(e.target.value))} className="h-10 text-sm bg-muted/30 focus-visible:bg-background" />
              </div>
            </div>
          </div>

          {/* Card 2: Akses & Penjadwalan */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4 hover:border-primary/30 transition-colors">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary border-b border-border/50 pb-3">
              <Calendar className="w-4 h-4" /> Penjadwalan
            </h3>
            <div className="space-y-2">
              <Label htmlFor="start-at" className="text-xs font-bold text-muted-foreground">Waktu Mulai</Label>
              <Input id="start-at" type="datetime-local" value={startAt} onChange={(e) => { setStartAt(e.target.value); }} disabled={isDaily} className="h-10 text-sm bg-muted/30 focus-visible:bg-background disabled:opacity-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-at" className="text-xs font-bold text-muted-foreground">Waktu Selesai</Label>
              <Input id="end-at" type="datetime-local" value={endAt} onChange={(e) => { setEndAt(e.target.value); }} disabled={isDaily} className="h-10 text-sm bg-muted/30 focus-visible:bg-background disabled:opacity-50" />
            </div>
            <label className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors mt-2 group">
              <span className="text-xs font-bold text-primary">Setel Sebagai Ujian Harian</span>
              <input type="checkbox" checked={isDaily} onChange={(e) => handleDailyToggle(e.target.checked)} className="h-4 w-4 rounded border-primary text-primary focus:ring-primary accent-primary" />
            </label>
          </div>

          {/* Card 3: Jawaban & Feedback */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4 hover:border-primary/30 transition-colors">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary border-b border-border/50 pb-3">
              <CheckCircle2 className="w-4 h-4" /> Feedback & Review
            </h3>
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-border/50 bg-muted/10 hover:bg-muted/30 hover:border-primary/30 transition-all">
              <input type="checkbox" checked={showAnswer} onChange={(e) => setShowAnswer(e.target.checked)} className="mt-1 h-4 w-4 rounded border-input accent-primary" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold leading-none">Tampilkan Kunci</span>
                <span className="text-xs text-muted-foreground leading-tight">Berikan akses review komprehensif di akhir ujian.</span>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-border/50 bg-muted/10 hover:bg-muted/30 hover:border-primary/30 transition-all">
              <input type="checkbox" checked={immediateFeedback} onChange={(e) => setImmediateFeedback(e.target.checked)} className="mt-1 h-4 w-4 rounded border-input accent-primary" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold leading-none">Feedback Instan</span>
                <span className="text-xs text-muted-foreground leading-tight">Munculkan animasi benar/salah saat memilih jawaban.</span>
              </div>
            </label>
          </div>

          {/* Card 4: Pengaturan Bantuan Tips (AI) */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4 hover:border-primary/30 transition-colors">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary border-b border-border/50 pb-3">
              <HelpCircle className="w-4 h-4" /> Penalti AI Tips
            </h3>
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-border/50 bg-muted/10 hover:bg-muted/30 hover:border-primary/30 transition-all mb-4">
              <input type="checkbox" checked={enableTipPenalty} onChange={(e) => setEnableTipPenalty(e.target.checked)} className="mt-1 h-4 w-4 rounded border-input accent-primary" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold leading-none">Aktifkan Pengurangan Nilai</span>
                <span className="text-xs text-muted-foreground leading-tight">Pengurangan persentase spesifik tiap penggunaan tips.</span>
              </div>
            </label>
            <div className="grid grid-cols-2 gap-3 opacity-100 transition-opacity" style={{ opacity: enableTipPenalty ? 1 : 0.4 }}>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">Teori (%)</Label>
                <Input value={penaltyTheoryConfig} onChange={(e) => setPenaltyTheoryConfig(e.target.value)} placeholder="10, 15..." className="h-10 text-xs bg-muted/30 font-mono" disabled={!enableTipPenalty}/>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">Praktik (%)</Label>
                <Input value={penaltyPracticeConfig} onChange={(e) => setPenaltyPracticeConfig(e.target.value)} placeholder="15, 20..." className="h-10 text-xs bg-muted/30 font-mono" disabled={!enableTipPenalty}/>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px] lg:h-[600px] xl:h-[700px]">
        <Card className="flex flex-col shadow-sm h-[500px] lg:h-full border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 transition-colors">
          <CardHeader className="py-3 px-5 border-b flex-none bg-muted/10">
            <CardTitle className="text-sm flex items-center justify-between font-black">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-2"><Edit2 className="w-4 h-4 text-primary" /> Markdown Editor</span>
                <Button variant="outline" size="sm" onClick={onOpenBankPicker} className="h-6 text-[10px] px-2 ml-2 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
                  <Database className="w-3 h-3 mr-1" /> Ambil dari Bank Soal
                </Button>
              </div>
              <Badge variant="secondary" className="text-xs font-mono font-bold bg-muted/50">{rawMarkdown.split('\n').length} baris</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden relative">
            <Textarea
              value={rawMarkdown}
              onChange={(e) => setRawMarkdown(e.target.value)}
              className="absolute inset-0 h-full font-mono text-sm resize-none border-0 focus-visible:ring-0 rounded-none p-5 bg-background/50 leading-relaxed"
              placeholder="Tempel Markdown di sini..."
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col shadow-sm h-[500px] lg:h-full border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 transition-colors">
          <CardHeader className="py-3 px-5 border-b flex-none bg-muted/10">
            <CardTitle className="text-sm flex items-center justify-between font-black">
              <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Live Preview</span>
              <Badge variant="secondary" className="text-xs font-bold bg-muted/50">{questions.length} soal</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden flex flex-col bg-background/50">
            {questions.length === 0 ? (
              <div className="flex items-center justify-center flex-1 text-muted-foreground text-sm">
                Belum ada soal terdeteksi. Pastikan format markdown benar.
              </div>
            ) : (
              <>
                {/* Number Grid Navigator */}
                <div className="flex flex-wrap gap-1.5 p-3 border-b bg-muted/20">
                  {questions.map((q, idx) => (
                    <Button
                      key={q.id}
                      variant={idx === currentPreviewIdx ? 'default' : 'outline'}
                      size="sm"
                      className="w-8 h-8 p-0 text-xs font-mono"
                      onClick={() => {
                        setSlideDir(idx > currentPreviewIdx ? 'right' : 'left');
                        setCurrentPreviewIdx(idx);
                      }}
                    >
                      {q.id}
                    </Button>
                  ))}
                </div>
                {/* Single Card with Slide Animation */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div
                    key={`preview-${currentPreviewIdx}`}
                    className={`animate-slide-${slideDir}`}
                  >
                    <QuestionRenderer
                      question={questions[currentPreviewIdx]}
                      showDiscussion
                      disabled
                    />
                  </div>
                </div>
                {/* Prev / Next */}
                <div className="flex items-center justify-between p-3 border-t bg-muted/20">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSlideDir('left');
                      setCurrentPreviewIdx((p) => Math.max(0, p - 1));
                    }}
                    disabled={currentPreviewIdx === 0}
                  >
                    ← Sebelumnya
                  </Button>
                  <span className="text-xs text-muted-foreground font-mono">
                    {currentPreviewIdx + 1} / {questions.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSlideDir('right');
                      setCurrentPreviewIdx((p) => Math.min(questions.length - 1, p + 1));
                    }}
                    disabled={currentPreviewIdx === questions.length - 1}
                  >
                    Selanjutnya →
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
