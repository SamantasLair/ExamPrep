'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { parseMarkdown } from '@/lib/parser';
import { QuestionRenderer } from '@/components/exam/QuestionRenderer';
import { LabelSelector, type LabelTaxonomy } from '@/components/exam/LabelSelector';
import { BankSoalTab } from '@/components/admin/BankSoalTab';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { HelpCircle, Copy, Printer, CheckCircle2, Columns, FileText, Settings2, Calendar, Clock, User, Type, Database, AlertTriangle, Plus, Target, LineChart, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { useAdminDashboardVM } from '@/viewmodels/useAdminDashboardVM';
import { useAnalyticsVM } from '@/viewmodels/useAnalyticsVM';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'tests'|'attempts'|'students'|'editor'|'prompt'|'bank'|'analytics'|'danger'>('tests');
  const [dangerAction, setDangerAction] = useState<string | null>(null);
  const [dangerConfirmText, setDangerConfirmText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const {
    testList,
    attemptList,
    studentList,
    stuPrefix, setStuPrefix,
    stuCount, setStuCount,
    generatingStu, setGeneratingStu,
    stuMsg, setStuMsg,
    editId,
    rawMarkdown, setRawMarkdown,
    examTitle, setExamTitle,
    duration, setDuration,
    passingGrade, setPassingGrade,
    startAt, setStartAt,
    endAt, setEndAt,
    isDaily, setIsDaily,
    showAnswer, setShowAnswer,
    immediateFeedback, setImmediateFeedback,
    enableTipPenalty, setEnableTipPenalty,
    penaltyTheoryConfig, setPenaltyTheoryConfig,
    penaltyPracticeConfig, setPenaltyPracticeConfig,
    showSettings, setShowSettings,
    currentPreviewIdx, setCurrentPreviewIdx,
    slideDir, setSlideDir,
    saving,
    saveMsg,
    showPrintModal, setShowPrintModal,
    printColumns, setPrintColumns,
    printFontSize, setPrintFontSize,
    printGraphicScale, setPrintGraphicScale,
    showPrintDiscussion, setShowPrintDiscussion,
    printPaperSize, setPrintPaperSize,
    customPaperWidth, setCustomPaperWidth,
    customPaperHeight, setCustomPaperHeight,
    printShowHeader, setPrintShowHeader,
    printCustomTitle, setPrintCustomTitle,
    printSideBySide, setPrintSideBySide,
    printAnswersAtEnd, setPrintAnswersAtEnd,
    printAnswerStyle, setPrintAnswerStyle,
    printCompactLayout, setPrintCompactLayout,
    promptType, setPromptType,
    promptCount, setPromptCount,
    promptLang, setPromptLang,
    promptLevel, setPromptLevel,
    promptContext, setPromptContext,
    promptOther, setPromptOther,
    copiedPrompt,
    promptLabels, setPromptLabels,
    tipsRange, setTipsRange,
    isCustomTips, setIsCustomTips,
    questions,
    generatedPrompt,
    printDocumentStyle,
    handleGenerateStudents,
    handleDailyToggle,
    handleCreateNew,
    handleEdit,
    handleAnalytics,
    handleDelete,
    handleSave,
    handleCopyPrompt,
    loadTests,
    loadAttempts,
    loadStudents,
    selectedTestId,
  } = useAdminDashboardVM();

  const executeWipe = async (action: string) => {
    setIsSaving(true);
    let err = null;
    if (action === 'WIPE_QUESTIONS') {
      const { error } = await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      err = error;
    } else if (action === 'WIPE_TESTS') {
      const { error } = await supabase.from('tests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      err = error;
    } else if (action === 'WIPE_ATTEMPTS') {
      const { error } = await supabase.from('attempts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      err = error;
    } else if (action === 'WIPE_STUDENTS') {
      const { error } = await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      err = error;
    } else if (action === 'WIPE_ALL') {
      await supabase.from('attempts').delete().neq('id', '0');
      await supabase.from('tests').delete().neq('id', '0');
      await supabase.from('questions').delete().neq('id', '0');
      await supabase.from('students').delete().neq('id', '0');
    }

    setIsSaving(false);
    if (err) {
      alert(err.message);
    } else {
      setDangerAction(null);
      setDangerConfirmText('');
      alert('Eksekusi berhasil.');
    }
  };

  const { analysis, loading: analyticsLoading, error: analyticsError } = useAnalyticsVM(selectedTestId);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className="h-screen print:h-auto bg-background text-foreground flex flex-col"
    >
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10 flex-none print:hidden">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold">ExaPrep Admin</h1>
            <Badge variant="outline">Dashboard</Badge>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'editor' && (
              <>
                <Button size="sm" variant="secondary" onClick={() => setShowPrintModal(true)}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Ujian
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowSettings((v) => !v)}>
                  {showSettings ? 'Tutup Pengaturan' : 'Pengaturan'}
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Ujian'}
                </Button>
              </>
            )}
            <Button size="sm" variant="ghost" onClick={() => window.location.href = '/'}>
              Keluar
            </Button>
          </div>
        </div>
      </header>

      {/* PRINT OVERLAY (Only visible when printing or in print preview) */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col print:static print:h-auto print:bg-white print:overflow-visible print:block print-main-parent">
          <style>{printDocumentStyle.css}</style>
          
          <div className="border-b p-4 flex flex-col items-start gap-4 bg-card print:hidden shadow-sm">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-lg font-bold flex items-center gap-2"><Printer className="w-5 h-5"/> Print Settings</h2>
              <div className="flex items-center gap-3">
                <Button onClick={() => window.print()} className="whitespace-nowrap">Cetak Sekarang</Button>
                <Button variant="ghost" onClick={() => setShowPrintModal(false)}>Tutup</Button>
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
                      className="h-4 w-4 accent-primary rounded" />
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

              {/* Full Width Card: Judul Kop (Bottom position for balance) */}
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
                
                {/* MAIN CONTENT AREA */}
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
      )}
      <div className="flex-1 flex overflow-hidden print:hidden relative">
        <aside className="w-16 md:w-64 border-r bg-card flex flex-col shrink-0 transition-all duration-300 relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
           <div className="p-4 border-b hidden md:block">
             <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Menu Navigasi</h2>
           </div>
           <nav className="p-3 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
             <Button variant={activeTab === 'tests' ? 'default' : 'ghost'} onClick={() => setActiveTab('tests')} className="w-full justify-start overflow-hidden transition-all active:scale-[0.98]">
               <FileText className="w-4 h-4 md:mr-2 shrink-0" /> <span className="hidden md:inline truncate">Daftar Ujian</span>
             </Button>
             <Button variant={activeTab === 'bank' ? 'default' : 'ghost'} onClick={() => setActiveTab('bank')} className="w-full justify-start overflow-hidden transition-all active:scale-[0.98]">
               <Database className="w-4 h-4 md:mr-2 shrink-0" /> <span className="hidden md:inline truncate">Bank Soal</span>
             </Button>
             <Button variant={activeTab === 'attempts' ? 'default' : 'ghost'} onClick={() => setActiveTab('attempts')} className="w-full justify-start overflow-hidden transition-all active:scale-[0.98]">
               <CheckCircle2 className="w-4 h-4 md:mr-2 shrink-0" /> <span className="hidden md:inline truncate">Hasil Peserta</span>
             </Button>
             <Button variant={activeTab === 'students' ? 'default' : 'ghost'} onClick={() => setActiveTab('students')} className="w-full justify-start overflow-hidden transition-all active:scale-[0.98]">
               <User className="w-4 h-4 md:mr-2 shrink-0" /> <span className="hidden md:inline truncate">Data Siswa</span>
             </Button>
             <Button variant={activeTab === 'editor' ? 'default' : 'ghost'} onClick={() => setActiveTab('editor')} className="w-full justify-start overflow-hidden transition-all active:scale-[0.98]">
               <Settings2 className="w-4 h-4 md:mr-2 shrink-0" /> <span className="hidden md:inline truncate">{editId ? 'Edit Ujian' : 'Editor Baru'}</span>
             </Button>
             <Button variant={activeTab === 'analytics' ? 'default' : 'ghost'} onClick={() => setActiveTab('analytics')} className="w-full justify-start overflow-hidden transition-all active:scale-[0.98]">
               <Columns className="w-4 h-4 md:mr-2 shrink-0" /> <span className="hidden md:inline truncate">Analisis Butir Soal</span>
             </Button>
             <Button variant={activeTab === 'prompt' ? 'default' : 'ghost'} onClick={() => setActiveTab('prompt')} className="w-full justify-start overflow-hidden transition-all active:scale-[0.98]">
               <Type className="w-4 h-4 md:mr-2 shrink-0" /> <span className="hidden md:inline truncate">Prompt Generator</span>
             </Button>
             
             <div className="mt-8 border-t border-destructive/20 pt-4">
               <Button variant={activeTab === 'danger' ? 'destructive' : 'ghost'} onClick={() => setActiveTab('danger')} className={cn("w-full justify-start overflow-hidden transition-all active:scale-[0.98]", activeTab === 'danger' ? 'bg-destructive text-destructive-foreground' : 'text-destructive hover:bg-destructive/10')}>
                 <AlertTriangle className="w-4 h-4 md:mr-2 shrink-0" /> <span className="hidden md:inline truncate font-bold">Danger Zone</span>
               </Button>
             </div>
           </nav>
        </aside>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-muted/10 custom-scrollbar relative z-10">
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="h-full flex flex-col">
            <TabsList className="hidden">
              <TabsTrigger value="tests">1</TabsTrigger>
              <TabsTrigger value="attempts">2</TabsTrigger>
              <TabsTrigger value="students">3</TabsTrigger>
              <TabsTrigger value="editor">4</TabsTrigger>
              <TabsTrigger value="prompt">5</TabsTrigger>
              <TabsTrigger value="bank">6</TabsTrigger>
              <TabsTrigger value="danger">7</TabsTrigger>
            </TabsList>

          {/* TAB: BANK SOAL */}
          <TabsContent value="bank" className="flex-1 h-full">
            <BankSoalTab />
          </TabsContent>

          {/* TAB: DANGER ZONE */}
          <TabsContent value="danger" className="flex-1 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 text-destructive">
                <AlertTriangle className="w-8 h-8" /> DANGER ZONE
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Targeted Deletion */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 border border-destructive/20 rounded-2xl bg-card shadow-sm">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><Database className="w-5 h-5 text-destructive"/> Pembersihan Parsial</h3>
                  <p className="text-sm text-muted-foreground mb-6">Tindakan ini akan menghapus entitas tertentu secara permanen. Tidak dapat dibatalkan.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive hover:text-white justify-start" onClick={() => { setDangerAction('WIPE_QUESTIONS'); setDangerConfirmText(''); }}>
                      Kosongkan Bank Soal
                    </Button>
                    <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive hover:text-white justify-start" onClick={() => { setDangerAction('WIPE_TESTS'); setDangerConfirmText(''); }}>
                      Kosongkan Daftar Ujian
                    </Button>
                    <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive hover:text-white justify-start" onClick={() => { setDangerAction('WIPE_ATTEMPTS'); setDangerConfirmText(''); }}>
                      Hapus Riwayat Nilai
                    </Button>
                    <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive hover:text-white justify-start" onClick={() => { setDangerAction('WIPE_STUDENTS'); setDangerConfirmText(''); }}>
                      Hapus Semua Siswa
                    </Button>
                  </div>
                </div>

                {dangerAction && dangerAction !== 'WIPE_ALL' && (
                  <div className="p-6 bg-destructive/5 rounded-2xl border-2 border-destructive/50 animate-in slide-in-from-top-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-destructive via-red-500 to-destructive"></div>
                    <Label className="text-destructive font-black text-lg mb-2 block uppercase tracking-widest">
                      Konfirmasi: {dangerAction}
                    </Label>
                    <p className="text-sm font-medium mb-4 text-destructive/80">Ketik kata <span className="font-mono bg-destructive text-white px-2 py-0.5 rounded shadow-sm mx-1">WIPE CLEAN</span> untuk mengeksekusi.</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input value={dangerConfirmText} onChange={e => setDangerConfirmText(e.target.value)} placeholder="Ketik WIPE CLEAN..." className="border-destructive/50 focus-visible:ring-destructive font-mono text-lg py-6" />
                      <Button variant="destructive" size="lg" disabled={dangerConfirmText !== 'WIPE CLEAN' || isSaving} onClick={() => executeWipe(dangerAction)} className="py-6 font-bold shadow-xl shadow-destructive/20 w-full sm:w-auto">
                        {isSaving ? 'MEMPROSES...' : 'EKSEKUSI SEKARANG'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: WIPE ALL */}
              <div className="lg:col-span-1 space-y-6">
                <div className="p-6 border-2 border-destructive bg-destructive/10 rounded-2xl shadow-[0_0_40px_rgba(239,68,68,0.15)] relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ef4444 25%, transparent 25%, transparent 75%, #ef4444 75%, #ef4444), repeating-linear-gradient(45deg, #ef4444 25%, transparent 25%, transparent 75%, #ef4444 75%, #ef4444)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }}></div>
                  
                  <div className="relative z-10">
                    <h3 className="text-xl font-black text-destructive mb-2 uppercase tracking-widest">WIPE CLEAN ALL</h3>
                    <p className="text-sm font-semibold text-destructive/80 mb-8 leading-relaxed">Sistem akan mereset ke hari pertama. Semua tabel akan dihapus bersih kecuali user admin.</p>
                    
                    <Button variant="destructive" className="w-full py-8 text-xl font-black shadow-2xl shadow-destructive/40 hover:scale-[1.02] transition-transform" onClick={() => { setDangerAction('WIPE_ALL'); setDangerConfirmText(''); }}>
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
                    <p className="text-sm font-bold mb-6 text-red-400">Ketik kata <span className="font-mono bg-red-600 text-white px-2 py-0.5 rounded mx-1">WIPE CLEAN</span> untuk Kiamat Data.</p>
                    <div className="space-y-4">
                      <Input value={dangerConfirmText} onChange={e => setDangerConfirmText(e.target.value)} placeholder="WIPE CLEAN" className="bg-red-950/50 border-red-600 text-red-100 placeholder:text-red-800 focus-visible:ring-red-600 font-mono text-xl py-6 text-center" />
                      <Button variant="destructive" size="lg" disabled={dangerConfirmText !== 'WIPE CLEAN' || isSaving} onClick={() => executeWipe(dangerAction)} className="w-full py-6 text-xl font-black bg-red-600 hover:bg-red-700">
                        {isSaving ? 'DESTROYING...' : 'CONFIRM DESTROY'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* TAB: TEKS (DAFTAR UJIAN) */}
          <TabsContent value="tests" className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Daftar Ujian Aktif</h2>
                <p className="text-sm text-muted-foreground mt-1">Kelola dan pantau seluruh sesi ujian yang tersedia.</p>
              </div>
              <Button onClick={handleCreateNew} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all gap-2 h-10 px-6 font-bold rounded-full">
                <Plus className="w-4 h-4" /> Buat Ujian Baru
              </Button>
            </div>
            
            {testList.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-2xl bg-muted/10">
                <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-bold">Belum ada ujian yang dibuat</h3>
                <p className="text-sm text-muted-foreground mb-6">Mulai rakit sesi ujian pertama Anda sekarang.</p>
                <Button onClick={handleCreateNew} variant="outline" className="gap-2 rounded-full"><Plus className="w-4 h-4"/> Buat Ujian</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testList.map((test) => (
                  <Card key={test.id} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/50 hover:border-primary/50 overflow-hidden flex flex-col rounded-2xl bg-card">
                    <CardHeader className="p-5 border-b bg-gradient-to-br from-muted/30 to-muted/10 group-hover:from-primary/5 group-hover:to-transparent transition-colors pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-lg font-black line-clamp-2 leading-tight">{test.title}</CardTitle>
                        <Badge variant={(!test.start_at && !test.end_at) ? "default" : "secondary"} className="shrink-0 font-bold tracking-wide">
                          {(!test.start_at && !test.end_at) ? 'HARIAN' : 'TERJADWAL'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Durasi</span>
                          <span className="font-semibold text-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> {test.duration_minutes} Menit</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">KKM</span>
                          <span className="font-semibold text-foreground flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-primary" /> {test.passing_grade}</span>
                        </div>
                      </div>
                      
                      {(test.start_at || test.end_at) && (
                        <div className="bg-muted/30 p-3 rounded-xl text-xs space-y-2 border border-border/50">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground font-medium">Mulai:</span>
                            <span className="font-bold">{test.start_at ? new Date(test.start_at).toLocaleString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}) : '-'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground font-medium">Selesai:</span>
                            <span className="font-bold">{test.end_at ? new Date(test.end_at).toLocaleString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}) : '-'}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <div className="p-4 border-t bg-muted/5 flex items-center justify-between gap-2 mt-auto">
                      <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10 hover:text-primary gap-1.5 font-bold" onClick={() => handleAnalytics(test.id)}>
                        <LineChart className="w-4 h-4" /> Analisis
                      </Button>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="gap-1.5 bg-background hover:bg-muted font-semibold" onClick={() => handleEdit(test)}>
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" className="gap-1.5 shadow-sm" onClick={() => handleDelete(test.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB: ATTEMPTS (HASIL PESERTA) */}
          <TabsContent value="attempts" className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Riwayat Pengerjaan</h2>
              <Button variant="outline" onClick={loadAttempts}>Segarkan Data</Button>
            </div>
            <div className="rounded-md border bg-card overflow-hidden">
              <div className="grid grid-cols-4 gap-4 p-4 border-b bg-muted/30 font-semibold text-sm">
                <div>Ujian</div>
                <div>Status</div>
                <div>Waktu Selesai</div>
                <div className="text-right">Skor</div>
              </div>
              {attemptList.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">Belum ada peserta yang mengerjakan.</div>
              ) : (
                <div className="divide-y">
                  {attemptList.map((att) => (
                    <div key={att.id} className="grid grid-cols-4 gap-4 p-4 items-center text-sm hover:bg-muted/50 transition-colors">
                      <div className="font-medium truncate">{att.tests?.title || 'Ujian Dihapus'}</div>
                      <div>
                        {att.status === 'finished' ? (
                          <Badge variant="default" className="bg-green-600">Selesai</Badge>
                        ) : (
                          <Badge variant="secondary">Berjalan</Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {att.finished_at ? new Date(att.finished_at).toLocaleString('id-ID') : '-'}
                      </div>
                      <div className="text-right font-bold text-lg">{att.score}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB: DATA SISWA */}
          <TabsContent value="students" className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Manajemen Data Siswa</h2>
                <p className="text-sm text-muted-foreground mt-1">Buat ID Siswa (Manual / Otomatis) untuk login ujian.</p>
              </div>
              <Button variant="outline" onClick={loadStudents}>Segarkan Data</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buat Manual */}
              <details className="group border rounded-xl bg-card overflow-hidden shadow-sm [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors font-bold text-sm">
                  <div className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Buat ID Siswa Manual</div>
                  <HelpCircle className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="p-4 border-t space-y-4 bg-background">
                  <div className="space-y-2">
                    <Label>ID Spesifik (Contoh: Budi-2024)</Label>
                    <Input placeholder="ID Siswa" id="manual-id" className="w-full" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nama Lengkap</Label>
                    <Input placeholder="Nama Siswa" id="manual-name" className="w-full" />
                  </div>
                  <Button 
                    onClick={async () => {
                       const idVal = (document.getElementById('manual-id') as HTMLInputElement).value.trim();
                       const nameVal = (document.getElementById('manual-name') as HTMLInputElement).value.trim();
                       if (!idVal || !nameVal) return setStuMsg('ID dan Nama wajib diisi.');
                       setGeneratingStu(true);
                       const { error } = await supabase.from('students').insert([{ id: idVal, name: nameVal }]);
                       setGeneratingStu(false);
                       if (error) setStuMsg(error.message);
                       else { setStuMsg(`Siswa ${nameVal} berhasil ditambahkan.`); loadStudents(); }
                    }} 
                    disabled={generatingStu}
                    className="w-full"
                  >
                    {generatingStu ? 'Menyimpan...' : 'Simpan Siswa'}
                  </Button>
                </div>
              </details>

              {/* Generate Auto */}
              <details className="group border rounded-xl bg-card overflow-hidden shadow-sm [&_summary::-webkit-details-marker]:hidden" open>
                <summary className="flex cursor-pointer items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors font-bold text-sm">
                  <div className="flex items-center gap-2"><Settings2 className="w-4 h-4 text-primary" /> Generate ID Massal</div>
                  <HelpCircle className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="p-4 border-t space-y-4 bg-background">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Prefix (Teks depan)</Label>
                      <Input placeholder="SMA-" value={stuPrefix} onChange={e => setStuPrefix(e.target.value)} className="w-full" />
                    </div>
                    <div className="space-y-2">
                      <Label>Jumlah ID</Label>
                      <Input type="number" placeholder="10" value={stuCount} onChange={e => setStuCount(e.target.value)} className="w-full" />
                    </div>
                  </div>
                  <Button onClick={handleGenerateStudents} disabled={generatingStu} className="w-full">
                    {generatingStu ? 'Memproses...' : 'Generate Massal'}
                  </Button>
                </div>
              </details>
            </div>
            {stuMsg && <p className="text-sm font-medium text-primary mt-2 p-3 bg-primary/10 border border-primary/20 rounded-md text-center">{stuMsg}</p>}

            <div className="rounded-md border bg-card overflow-hidden">
              <div className="grid grid-cols-4 gap-4 p-4 border-b bg-muted/30 font-semibold text-sm">
                <div>ID Siswa</div>
                <div>Nama Lengkap</div>
                <div>Terdaftar Pada</div>
                <div className="text-right">Aksi</div>
              </div>
              {studentList.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">Belum ada siswa yang terdaftar.</div>
              ) : (
                <div className="divide-y max-h-[500px] overflow-y-auto">
                  {studentList.map((stu) => (
                    <div key={stu.id} className="grid grid-cols-4 gap-4 p-4 items-center text-sm hover:bg-muted/50 transition-colors">
                      <div className="font-mono font-medium">{stu.id}</div>
                      <div className="truncate">{stu.name}</div>
                      <div className="text-xs text-muted-foreground">{new Date(stu.created_at).toLocaleString('id-ID')}</div>
                      <div className="text-right">
                        <Button size="sm" variant="ghost" className="text-xs">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB: ANALISIS SOAL (ITEM RESPONSE THEORY) */}
          <TabsContent value="analytics" className="flex-1 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Analisis Butir Soal (IRT)</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Mengevaluasi tingkat kesukaran ($p$) dari ujian yang dipilih.
                </p>
              </div>
              <Button variant="outline" onClick={() => setActiveTab('tests')}>Kembali ke Daftar</Button>
            </div>

            <div className="rounded-md border bg-card overflow-hidden">
              {analyticsLoading ? (
                <div className="p-8 text-center text-muted-foreground animate-pulse">Menghitung analitik...</div>
              ) : analyticsError ? (
                <div className="p-8 text-center text-destructive">{analyticsError}</div>
              ) : analysis.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">Belum ada data pengerjaan yang cukup untuk dianalisis, atau ujian tidak dipilih.</div>
              ) : (
                <>
                  <div className="grid grid-cols-5 gap-4 p-4 border-b bg-muted/30 font-semibold text-sm">
                    <div>No. Soal (ID)</div>
                    <div>Tipe Soal</div>
                    <div className="text-center">Tingkat Kesukaran ($p$)</div>
                    <div className="text-center">Status</div>
                    <div className="text-right">Peserta Benar</div>
                  </div>
                  <div className="divide-y max-h-[600px] overflow-y-auto">
                    {analysis.map((item, idx) => (
                      <div key={item.questionId} className="grid grid-cols-5 gap-4 p-4 items-center text-sm hover:bg-muted/50 transition-colors">
                        <div className="font-medium text-muted-foreground">Q{idx + 1} ({item.questionId})</div>
                        <div className="text-xs">{item.type}</div>
                        <div className="text-center font-mono font-bold">
                          {(item.p).toFixed(2)}
                        </div>
                        <div className="text-center">
                          {item.status === 'too_hard' && <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/20">Terlalu Sulit ($p &lt; 0.3$)</Badge>}
                          {item.status === 'too_easy' && <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Terlalu Mudah ($p &gt; 0.8$)</Badge>}
                          {item.status === 'ideal' && <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Ideal</Badge>}
                        </div>
                        <div className="text-right text-xs">
                          {item.correctAttempts} / {item.totalAttempts}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* TAB: EDITOR */}
          <TabsContent value="editor" className="flex-1 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                  <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary border-b border-border/50 pb-3"><FileText className="w-4 h-4" /> Identitas Dasar</h3>
                  <div className="space-y-2">
                    <Label htmlFor="exam-title" className="text-xs font-bold text-muted-foreground">Judul Ujian</Label>
                    <Input id="exam-title" placeholder="Cth: Ujian Harian" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} className="h-10 text-sm bg-muted/30 focus-visible:bg-background transition-colors" />
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
                  <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary border-b border-border/50 pb-3"><Calendar className="w-4 h-4" /> Penjadwalan</h3>
                  <div className="space-y-2">
                    <Label htmlFor="start-at" className="text-xs font-bold text-muted-foreground">Waktu Mulai</Label>
                    <Input id="start-at" type="datetime-local" value={startAt} onChange={(e) => { setStartAt(e.target.value); setIsDaily(false); }} disabled={isDaily} className="h-10 text-sm bg-muted/30 focus-visible:bg-background disabled:opacity-50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-at" className="text-xs font-bold text-muted-foreground">Waktu Selesai</Label>
                    <Input id="end-at" type="datetime-local" value={endAt} onChange={(e) => { setEndAt(e.target.value); setIsDaily(false); }} disabled={isDaily} className="h-10 text-sm bg-muted/30 focus-visible:bg-background disabled:opacity-50" />
                  </div>
                  <label className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors mt-2 group">
                    <span className="text-xs font-bold text-primary">Setel Sebagai Ujian Harian</span>
                    <input type="checkbox" checked={isDaily} onChange={(e) => handleDailyToggle(e.target.checked)} className="h-4 w-4 rounded border-primary text-primary focus:ring-primary accent-primary" />
                  </label>
                </div>

                {/* Card 3: Jawaban & Feedback */}
                <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-4 hover:border-primary/30 transition-colors">
                  <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary border-b border-border/50 pb-3"><CheckCircle2 className="w-4 h-4" /> Feedback & Review</h3>
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
                  <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary border-b border-border/50 pb-3"><HelpCircle className="w-4 h-4" /> Penalti AI Tips</h3>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px] xl:h-[700px]">
              <Card className="flex flex-col shadow-sm h-full border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 transition-colors">
                <CardHeader className="py-3 px-5 border-b flex-none bg-muted/10">
                  <CardTitle className="text-sm flex items-center justify-between font-black">
                    <span className="flex items-center gap-2"><Edit2 className="w-4 h-4 text-primary" /> Markdown Editor</span>
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

              <Card className="flex flex-col shadow-sm h-full border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 transition-colors">
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
          </TabsContent>

          {/* TAB: PROMPT GENERATOR */}
          <TabsContent value="prompt" className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold tracking-tight">AI Prompt Generator</h2>
                <p className="text-muted-foreground mt-2">Buat prompt spesifik untuk AI Generator sesuai standar format ExaPrep.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8">
                <Card className="shadow-sm">
                  <CardHeader className="border-b pb-4">
                    <CardTitle className="text-lg">Karakteristik Soal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-6">
                    <div className="space-y-2 relative">
                      <Label className="flex items-center gap-2">
                        Tipe Soal 
                        <span className="group relative cursor-help">
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          <span className="pointer-events-none absolute left-0 bottom-full mb-2 w-64 rounded bg-popover p-2 text-xs text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100 dark:border z-50">
                            Pilih tipe soal yang akan di-generate oleh AI. Pastikan AI mengetahui format yang diinginkan seperti (PILGAN) atau (ESSAY).
                          </span>
                        </span>
                      </Label>
                      <select 
                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={promptType} onChange={(e) => setPromptType(e.target.value)}
                      >
                        <option value="Pilihan Ganda (PILGAN)">Pilihan Ganda (PILGAN)</option>
                        <option value="Esai (ESSAY)">Esai (ESSAY)</option>
                        <option value="Campuran Teks dan Gambar">Campuran (Pilihan Ganda & Esai)</option>
                      </select>
                    </div>

                    <div className="space-y-2 relative">
                      <Label className="flex items-center gap-2">
                        Jumlah Soal
                        <span className="group relative cursor-help">
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          <span className="pointer-events-none absolute left-0 bottom-full mb-2 w-48 rounded bg-popover p-2 text-xs text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100 dark:border z-50">
                            Masukkan jumlah total soal. Sangat disarankan membatasi maksimal 15 soal per prompt agar respon AI tidak terpotong.
                          </span>
                        </span>
                      </Label>
                      <Input placeholder="Cth: 10" value={promptCount} onChange={(e) => setPromptCount(e.target.value)} />
                    </div>

                    <div className="space-y-2 relative">
                      <Label className="flex items-center gap-2">
                        Rentang Bantuan Tips
                        <span className="group relative cursor-help">
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          <span className="pointer-events-none absolute left-0 bottom-full mb-2 w-48 rounded bg-popover p-2 text-xs text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100 dark:border z-50">
                            Jumlah tips yang akan dihasilkan AI per soal. Tips bisa berupa teori (rumus) atau praktik (langkah).
                          </span>
                        </span>
                      </Label>
                      <select 
                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={isCustomTips ? "custom" : tipsRange} 
                        onChange={(e) => {
                          if (e.target.value === 'custom') {
                            setIsCustomTips(true);
                            setTipsRange('0-5'); // Default custom value
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
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 relative">
                      <Label className="flex items-center gap-2">
                        Bahasa
                        <span className="group relative cursor-help">
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          <span className="pointer-events-none absolute left-0 bottom-full mb-2 w-48 rounded bg-popover p-2 text-xs text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100 dark:border z-50">
                            Bahasa pengantar soal dan pembahasan yang dihasilkan AI.
                          </span>
                        </span>
                      </Label>
                      <Input placeholder="Cth: Indonesia (Baku)" value={promptLang} onChange={(e) => setPromptLang(e.target.value)} />
                    </div>

                    <div className="space-y-2 relative">
                      <Label className="flex items-center gap-2">
                        Tingkat Soal / Level
                        <span className="group relative cursor-help">
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          <span className="pointer-events-none absolute left-0 bottom-full mb-2 w-56 rounded bg-popover p-2 text-xs text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100 dark:border z-50">
                            Level kesulitan, contoh: "SD Kelas 6", "Olimpiade SMP", "UTBK SMA". Semakin spesifik, analisis materinya semakin akurat.
                          </span>
                        </span>
                      </Label>
                      <Input placeholder="Cth: SD Kelas 6, Olimpiade Matematika" value={promptLevel} onChange={(e) => setPromptLevel(e.target.value)} />
                    </div>

                    <div className="space-y-2 relative">
                      <Label className="flex items-center gap-2">
                        Konteks Penting Topik
                        <span className="group relative cursor-help">
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          <span className="pointer-events-none absolute right-0 bottom-full mb-2 w-72 rounded bg-popover p-2 text-xs text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100 dark:border z-50">
                            Inti teknis soal (contoh: "Gunakan banyak diagram bangun datar, wajib ada grafik Recharts bar chart, fokus ke materi aljabar polinomial").
                          </span>
                        </span>
                      </Label>
                      <Textarea 
                        placeholder="Cth: Semua soal wajib berisi Diagram Interaktif (JSXGraph), topik geometri lingkaran, dan ada irisan bangun datar." 
                        value={promptContext} 
                        onChange={(e) => setPromptContext(e.target.value)} 
                        className="h-24 resize-none"
                      />
                    </div>

                    <div className="space-y-2 relative">
                      <Label className="flex items-center gap-2">
                        Konteks Lainnya (Opsional)
                        <span className="group relative cursor-help">
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          <span className="pointer-events-none absolute right-0 bottom-full mb-2 w-72 rounded bg-popover p-2 text-xs text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100 dark:border z-50">
                            Misal instruksi tambahan seperti "Hindari soal jebakan", atau "Gunakan cerita dalam kehidupan sehari-hari (Word problem)".
                          </span>
                        </span>
                      </Label>
                      <Textarea 
                        placeholder="Cth: Hindari soal yang terlalu trivial, beri penjelasan rumus step-by-step yang sangat panjang di bagian pembahasan." 
                        value={promptOther} 
                        onChange={(e) => setPromptOther(e.target.value)} 
                        className="h-24 resize-none"
                      />
                    </div>
                    
                    <div className="space-y-2 relative pt-2 border-t mt-4">
                      <Label className="flex items-center gap-2 mb-3">
                        Taxonomi & Label Soal
                        <span className="group relative cursor-help">
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          <span className="pointer-events-none absolute left-0 bottom-full mb-2 w-64 rounded bg-popover p-2 text-xs text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100 dark:border z-50">
                            Pilih label-label ini agar AI melabeli soal-soal tersebut sesuai taksonominya.
                          </span>
                        </span>
                      </Label>
                      <LabelSelector selectedLabels={promptLabels} onChange={setPromptLabels} />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col h-full space-y-4">
                  <Card className="shadow-sm flex-1 flex flex-col">
                    <CardHeader className="border-b pb-4 bg-muted/30">
                      <CardTitle className="text-lg flex justify-between items-center">
                        Hasil Prompt AI
                        <Button size="sm" onClick={handleCopyPrompt} className="gap-2 transition-colors" variant={copiedPrompt ? 'secondary' : 'default'}>
                          {copiedPrompt ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                          {copiedPrompt ? 'Salin Berhasil!' : 'Salin Prompt'}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex flex-1 relative min-h-[400px]">
                      <Textarea
                        readOnly
                        value={generatedPrompt}
                        className="absolute inset-0 h-full w-full font-mono text-sm resize-none border-0 focus-visible:ring-0 rounded-none p-5 text-muted-foreground bg-muted/10 leading-relaxed"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      </div>
    </motion.div>
  );
}


