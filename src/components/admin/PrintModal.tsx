'use client';

import React from 'react';
import type { Question } from '@/lib/types';
import { QuestionRenderer } from '@/components/exam/QuestionRenderer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Printer, Columns, FileText, HelpCircle, Settings2, Type } from 'lucide-react';

interface PrintModalProps {
  onClose: () => void;
  printDocumentStyle: { w: number; h: number; css: string };
  printColumns: '1' | '2';
  setPrintColumns: (val: '1' | '2') => void;
  printPaperSize: string;
  setPrintPaperSize: (val: any) => void;
  customPaperWidth: number;
  setCustomPaperWidth: (val: number) => void;
  customPaperHeight: number;
  setCustomPaperHeight: (val: number) => void;
  showPrintDiscussion: boolean;
  setShowPrintDiscussion: (val: boolean) => void;
  printSideBySide: boolean;
  setPrintSideBySide: (val: boolean) => void;
  printAnswersAtEnd: boolean;
  setPrintAnswersAtEnd: (val: boolean) => void;
  printAnswerStyle: 'solid' | 'outlined' | 'minimalist' | 'boxed' | 'bracket';
  setPrintAnswerStyle: (val: any) => void;
  printFontSize: number;
  setPrintFontSize: (val: number) => void;
  printGraphicScale: number;
  setPrintGraphicScale: (val: number) => void;
  printShowHeader: boolean;
  setPrintShowHeader: (val: boolean) => void;
  printCompactLayout: boolean;
  setPrintCompactLayout: (val: boolean) => void;
  printCustomTitle: string;
  setPrintCustomTitle: (val: string) => void;
  examTitle: string;
  duration: number;
  questions: Question[];
}

export function PrintModal({
  onClose,
  printDocumentStyle,
  printColumns,
  setPrintColumns,
  printPaperSize,
  setPrintPaperSize,
  customPaperWidth,
  setCustomPaperWidth,
  customPaperHeight,
  setCustomPaperHeight,
  showPrintDiscussion,
  setShowPrintDiscussion,
  printSideBySide,
  setPrintSideBySide,
  printAnswersAtEnd,
  setPrintAnswersAtEnd,
  printAnswerStyle,
  setPrintAnswerStyle,
  printFontSize,
  setPrintFontSize,
  printGraphicScale,
  setPrintGraphicScale,
  printShowHeader,
  setPrintShowHeader,
  printCompactLayout,
  setPrintCompactLayout,
  printCustomTitle,
  setPrintCustomTitle,
  examTitle,
  duration,
  questions,
}: PrintModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col print:static print:h-auto print:bg-white print:overflow-visible print:block print-main-parent">
      <style>{printDocumentStyle.css}</style>
      <div className="border-b p-4 flex flex-col items-start gap-4 bg-card print:hidden shadow-sm">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Printer className="w-5 h-5" /> Print Settings
          </h2>
          <div className="flex items-center gap-3">
            <Button onClick={() => window.print()} className="whitespace-nowrap">Cetak Sekarang</Button>
            <Button variant="ghost" onClick={onClose}>Tutup</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
          {/* Card 1: Layout */}
          <div className="p-3 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-2.5">
            <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 font-mono">
              <Columns className="w-3 h-3 text-primary" /> LAYOUT KOLOM
            </Label>
            <div className="flex items-center gap-3">
              <Label className="flex items-center gap-2 text-xs cursor-pointer whitespace-nowrap">
                <input type="radio" name="cols" checked={printColumns === '1'} onChange={() => setPrintColumns('1')} className="h-4 w-4 accent-primary" />
                1 Kolom
              </Label>
              <Label className="flex items-center gap-2 text-xs cursor-pointer whitespace-nowrap">
                <input type="radio" name="cols" checked={printColumns === '2'} onChange={() => setPrintColumns('2')} className="h-4 w-4 accent-primary" />
                2 Kolom
              </Label>
            </div>
          </div>

          {/* Card 2: Kertas */}
          <div className="p-3 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-2.5">
            <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 font-mono">
              <FileText className="w-3 h-3 text-primary" /> UKURAN KERTAS
            </Label>
            <div className="flex items-center gap-2">
              <select 
                className="h-7 text-xs border rounded px-1.5 bg-background flex-1"
                value={printPaperSize}
                onChange={(e) => setPrintPaperSize(e.target.value as any)}
              >
                <option value="A4">A4 (210×297)</option>
                <option value="F4">F4 / Folio (215.9×330.2)</option>
                <option value="Custom">Custom</option>
              </select>
              {printPaperSize === 'Custom' && (
                <div className="flex gap-1">
                  <Input type="number" min={100} max={1000} value={customPaperWidth} onChange={(e) => setCustomPaperWidth(Number(e.target.value))} className="w-10 h-7 text-[10px] px-1" />
                  <Input type="number" min={100} max={1000} value={customPaperHeight} onChange={(e) => setCustomPaperHeight(Number(e.target.value))} className="w-10 h-7 text-[10px] px-1" />
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Mode Jawaban */}
          <div className="p-3 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-2.5">
            <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 font-mono">
              <HelpCircle className="w-3 h-3 text-primary" /> MODE JAWABAN
            </Label>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Label className="flex items-center gap-1.5 text-xs cursor-pointer whitespace-nowrap">
                <input type="checkbox" checked={showPrintDiscussion} onChange={(e) => setShowPrintDiscussion(e.target.checked)} className="h-4 w-4 accent-primary rounded" />
                Pembahasan
              </Label>
              <Label className="flex items-center gap-1.5 text-xs cursor-pointer whitespace-nowrap" title="Soal kiri, Jawaban kanan">
                <input 
                  type="checkbox" 
                  checked={printSideBySide} 
                  onChange={(e) => {
                    const val = e.target.checked;
                    setPrintSideBySide(val);
                    if (val) {
                      setShowPrintDiscussion(true);
                      setPrintColumns('2');
                      setPrintAnswersAtEnd(false);
                    }
                  }} 
                  className="h-4 w-4 accent-primary rounded" 
                />
                Sampingan
              </Label>
              <Label className="flex items-center gap-1.5 text-xs cursor-pointer whitespace-nowrap">
                <input 
                  type="checkbox" 
                  checked={printAnswersAtEnd} 
                  onChange={(e) => {
                    const val = e.target.checked;
                    setPrintAnswersAtEnd(val);
                    if (val) setPrintSideBySide(false);
                  }} 
                  className="h-4 w-4 accent-primary rounded" 
                />
                Di Akhir
              </Label>
              {printAnswersAtEnd && (
                <div className="flex items-center gap-2 mt-1 w-full border-t border-border/40 pt-2">
                  <select 
                    className="h-6 text-[10px] border rounded px-1 flex-1 bg-background"
                    value={printAnswerStyle}
                    onChange={(e) => setPrintAnswerStyle(e.target.value as any)}
                  >
                    <option value="solid">Sirkel Solid</option>
                    <option value="outlined">Sirkel Outline</option>
                    <option value="minimalist">Minimalist</option>
                    <option value="boxed">Kotak/Boxed</option>
                    <option value="bracket">Kurung (Bracket)</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Visual & Header Toggle */}
          <div className="p-3 rounded-xl bg-muted/20 border border-border/50 flex flex-col gap-2.5">
            <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 font-mono">
              <Settings2 className="w-3 h-3 text-primary" /> VISUAL SKALA
            </Label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5" title="Font Size">
                <span className="text-[9px] font-bold">F</span>
                <Input type="number" min={8} max={24} value={printFontSize} onChange={(e) => setPrintFontSize(Number(e.target.value))} className="w-9 h-6 text-[10px] px-1 text-center" />
              </div>
              <div className="flex items-center gap-1.5" title="Graphic Scale">
                <span className="text-[9px] font-bold">G</span>
                <Input type="number" min={30} max={200} step={10} value={printGraphicScale} onChange={(e) => setPrintGraphicScale(Number(e.target.value))} className="w-11 h-6 text-[10px] px-1 text-center" />
              </div>
              <Label className="flex items-center gap-1.5 text-[9px] font-bold cursor-pointer ml-auto border-l pl-2 border-muted-foreground/30">
                <input type="checkbox" checked={printShowHeader} onChange={(e) => setPrintShowHeader(e.target.checked)} className="h-3.5 w-3.5 accent-primary" />
                Kop 
              </Label>
              <Label className="flex items-center gap-1.5 text-[9px] font-bold cursor-pointer border-l pl-2 border-muted-foreground/30 whitespace-nowrap" title="Hemat Kertas?">
                <input type="checkbox" checked={printCompactLayout} onChange={(e) => setPrintCompactLayout(e.target.checked)} className="h-3.5 w-3.5 accent-primary rounded-sm" />
                Padat
              </Label>
            </div>
          </div>

          {/* Full Width Card: Judul Kop */}
          {printShowHeader && (
            <div className="col-span-1 md:col-span-2 lg:col-span-4 p-3 rounded-xl bg-primary/5 border border-primary/20 flex flex-col md:flex-row items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 px-2 py-0.5 bg-primary/10 rounded-full shrink-0">
                <Type className="w-3 h-3 text-primary" />
                <span className="text-[9px] font-bold uppercase text-primary font-mono tracking-tighter">KOP JUDUL KUSTOM</span>
              </div>
              <Input 
                placeholder="Contoh: PENILAIAN AKHIR SEMESTER - MATEMATIKA XII IPA" 
                value={printCustomTitle} 
                onChange={(e) => setPrintCustomTitle(e.target.value)} 
                className="h-8 text-xs font-medium bg-white/50 focus:bg-white transition-all italic border-primary/20"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-muted p-8 print:p-0 print:bg-white text-black print:text-black print:overflow-visible print:block print:h-auto print:w-full scroll-smooth">
        <div 
          className={cn(
            "mx-auto bg-white shadow-lg print:shadow-none print:max-w-none print:w-full print:p-0 print:m-0 print:bg-transparent relative print-container-root",
            printColumns === '2' ? 'columns-2 gap-10' : ''
          )}
          style={{ 
            fontSize: `${printFontSize}px`,
            maxWidth: `${printDocumentStyle.w}mm`,
            padding: '15mm', 
            minHeight: `${printDocumentStyle.h}mm`,
            '--print-graphic-scale': printGraphicScale / 100 
          } as React.CSSProperties}
        >
          <style>{`
            @media screen {
              .preview-page-lines {
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                pointer-events: none;
                background-image: linear-gradient(to bottom, transparent calc(${printDocumentStyle.h}mm - 1px), #e2e8f0 ${printDocumentStyle.h}mm);
                background-size: 100% ${printDocumentStyle.h}mm;
                z-index: 0;
              }
              .column-balancing-fix {
                column-fill: balance;
              }
            }
            @media print {
              .column-balancing-fix {
                column-fill: auto;
              }
            }
          `}</style>
          
          <div className="preview-page-lines print:hidden" />
          
          <div className="relative z-10 font-serif">
            {printShowHeader && (
              <div className="mb-6 pb-2 border-b-2 border-black">
                <h1 className="font-bold uppercase leading-tight" style={{ fontSize: `${printFontSize * 1.25}px` }}>{printCustomTitle || examTitle || 'SOAL UJIAN'}</h1>
                <p className="mt-1 font-medium" style={{ fontSize: `${printFontSize * 0.9}px` }}>Waktu: {duration} Menit</p>
              </div>
            )}
            
            {!printAnswersAtEnd ? (
              <div className={cn("column-balancing-fix", printColumns === '2' ? 'columns-2 gap-10' : '')}>
                {questions.map((q, idx) => (
                  <div key={q.id}>
                    <div className={cn(
                      "mb-4 break-inside-avoid relative",
                      printSideBySide ? "grid grid-cols-2 gap-4" : ""
                    )}>
                      <div className="relative">
                        <div className="absolute left-0 text-[1.1em]" style={{ width: '1.5em' }}>{idx + 1}.</div>
                        <div className="pl-6">
                          <QuestionRenderer 
                            question={q} 
                            disabled 
                            showDiscussion={showPrintDiscussion && !printSideBySide} 
                            printMode={true} 
                            compactLayout={printCompactLayout}
                            answerStyle={printAnswerStyle}
                          />
                        </div>
                      </div>
                      {printSideBySide && (
                        <div className="pl-6 border-l border-dashed border-gray-300">
                          <QuestionRenderer 
                            question={q} 
                            disabled 
                            showOnlyDiscussion={true} 
                            printMode={true} 
                            compactLayout={printCompactLayout}
                            answerStyle={printAnswerStyle}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className={cn("column-balancing-fix mb-10", printColumns === '2' ? 'columns-2 gap-10' : '')}>
                  {questions.map((q, idx) => (
                    <div key={`q-only-${q.id}`} className="mb-4 break-inside-avoid relative">
                      <div className="absolute left-0 text-[1.1em]" style={{ width: '1.5em' }}>{idx + 1}.</div>
                      <div className="pl-6">
                        <QuestionRenderer question={q} disabled showDiscussion={false} printMode={true} compactLayout={printCompactLayout} answerStyle={printAnswerStyle} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className={cn(
                  "pt-10 break-before-page",
                  printColumns === '2' ? 'column-balancing-fix columns-2 gap-10' : ''
                )}>
                  <div className="space-y-6">
                    {questions.map((q, idx) => (
                      <div key={`ans-only-${q.id}`} className="break-inside-avoid">
                        <div className="flex items-start gap-4">
                          {printAnswerStyle === 'solid' && (
                            <span className="text-lg min-w-[2.5rem] h-10 w-10 flex items-center justify-center bg-black text-white rounded-full shrink-0">{idx + 1}</span>
                          )}
                          {printAnswerStyle === 'outlined' && (
                            <span className="text-lg min-w-[2.5rem] h-10 w-10 flex items-center justify-center border-2 border-black text-black rounded-full shrink-0">{idx + 1}</span>
                          )}
                          {printAnswerStyle === 'boxed' && (
                            <span className="text-lg min-w-[2.5rem] h-10 w-10 flex items-center justify-center bg-black text-white rounded-md shrink-0">{idx + 1}</span>
                          )}
                          {printAnswerStyle === 'minimalist' && (
                            <span className="text-lg min-w-[1.8rem] flex items-center justify-center text-black shrink-0">{idx + 1}.</span>
                          )}
                          {printAnswerStyle === 'bracket' && (
                            <div className="flex items-start gap-1 shrink-0">
                              <span className="text-lg text-black">{idx + 1}.</span>
                              <span className="text-4xl leading-[0.8] font-light text-black opacity-40 -mt-1 -ml-1">(</span>
                            </div>
                          )}
                          <div className="flex-1">
                            <QuestionRenderer question={q} disabled showOnlyDiscussion={true} printMode={true} compactLayout={printCompactLayout} answerStyle={printAnswerStyle} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
