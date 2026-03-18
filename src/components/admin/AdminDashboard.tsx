'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { parseMarkdown } from '@/lib/parser';
import { QuestionRenderer } from '@/components/exam/QuestionRenderer';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HelpCircle, Copy, Printer, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { TestRow } from '@/lib/types';

const SAMPLE_MARKDOWN = `# Q1 (PILGAN)
Jika $f(x) = 2x^2 + 3x - 5$, maka nilai $f(2)$ adalah...

[[A]] 5
[[B]] 9
[[C]] 7
[[D]] 11
[[E]] 13

ANSWER: B
DISCUSSION: Substitusi $x=2$ ke $f(x)$:
$$f(2) = 2(4) + 3(2) - 5 = 8 + 6 - 5 = 9$$

# Q2 (PILGAN)
Perhatikan diagram penjualan berikut:

[CHART:BAR] {"labels":["Jan","Feb","Mar","Apr"],"data":[120,200,150,300]} [/CHART]

Bulan dengan penjualan tertinggi adalah...

[[A]] Januari
[[B]] Februari
[[C]] Maret
[[D]] April
[[E]] Mei

ANSWER: D
DISCUSSION: Dari diagram batang, April memiliki nilai penjualan tertinggi yaitu 300.

# Q3 (ESSAY)
Tuliskan contoh object JSON dasar.

ANSWER: ESSAY
DISCUSSION: 
\`\`\`json
{
  "key": "value",
  "number": 42
}
\`\`\`
`;

function getTodayRange() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return { start: `${y}-${m}-${d}T00:00`, end: `${y}-${m}-${d}T23:59` };
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('tests'); // 'tests' | 'attempts' | 'editor'
  
  // Lists
  const [testList, setTestList] = useState<TestRow[]>([]);
  const [attemptList, setAttemptList] = useState<any[]>([]);

  // Editor State
  const [editId, setEditId] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const [examTitle, setExamTitle] = useState('');
  const [duration, setDuration] = useState(60);
  const [passingGrade, setPassingGrade] = useState(70);
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [isDaily, setIsDaily] = useState(false);
  const [showAnswer, setShowAnswer] = useState(true);
  const [immediateFeedback, setImmediateFeedback] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentPreviewIdx, setCurrentPreviewIdx] = useState(0);
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right');
  const prevQuestionsLen = useRef(0);
  const previousMarkdownRef = useRef(markdown);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Print State
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printColumns, setPrintColumns] = useState<'1' | '2'>('1');
  const [printFontSize, setPrintFontSize] = useState(14); // in px
  const [printGraphicScale, setPrintGraphicScale] = useState(100); // in percentage
  const [showPrintDiscussion, setShowPrintDiscussion] = useState(false);
  const [printPaperSize, setPrintPaperSize] = useState<'A4' | 'F4' | 'Custom'>('A4');
  const [customPaperWidth, setCustomPaperWidth] = useState(210); // in mm
  const [customPaperHeight, setCustomPaperHeight] = useState(297); // in mm
  const [printShowHeader, setPrintShowHeader] = useState(true);
  const [printCustomTitle, setPrintCustomTitle] = useState('');

  // Prompt Generator State
  const [promptType, setPromptType] = useState('Pilihan Ganda (PILGAN)');
  const [promptCount, setPromptCount] = useState('10');
  const [promptLang, setPromptLang] = useState('Indonesia');
  const [promptLevel, setPromptLevel] = useState('SMA');
  const [promptContext, setPromptContext] = useState('');
  const [promptOther, setPromptOther] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const questions = useMemo(() => {
    try {
      return parseMarkdown(markdown);
    } catch {
      return [];
    }
  }, [markdown]);

  useEffect(() => {
    if (questions.length !== prevQuestionsLen.current) {
      setCurrentPreviewIdx(0);
      prevQuestionsLen.current = questions.length;
    }
  }, [questions]);

  // Auto-Delete Watcher
  useEffect(() => {
    if (markdown.includes('[Delete this]') && !previousMarkdownRef.current.includes('[Delete this]')) {
      // Small timeout to let state settle if pasting
      setTimeout(() => {
        const ok = window.confirm('Sistem mendeteksi tag "[Delete this]" (Kesalahan AI) di teks.\n\nApakah Anda ingin sistem menghapus otomatis soal-soal tersebut tanpa mengubah soal lainnya?');
        if (ok) {
          const parts = markdown.split(/(?=#\s*Q\d+\s*\((?:PILGAN|ESSAY)\)\s*)/i);
          const cleanedParts = parts.filter(part => !part.includes('[Delete this]'));
          setMarkdown(cleanedParts.join('').trimStart());
        }
      }, 50);
    }
    previousMarkdownRef.current = markdown;
  }, [markdown]);

  const loadTests = async () => {
    const { data } = await supabase.from('tests').select('*').order('created_at', { ascending: false });
    if (data) setTestList(data as TestRow[]);
  };

  const loadAttempts = async () => {
    const { data } = await supabase
      .from('attempts')
      .select('id, test_id, score, status, finished_at, tests(title)')
      .order('finished_at', { ascending: false });
    if (data) setAttemptList(data);
  };

  useEffect(() => {
    if (activeTab === 'tests') loadTests();
    if (activeTab === 'attempts') loadAttempts();
  }, [activeTab]);

  const handleDailyToggle = useCallback((checked: boolean) => {
    setIsDaily(checked);
    if (checked) {
      const { start, end } = getTodayRange();
      setStartAt(start);
      setEndAt(end);
    } else {
      setStartAt('');
      setEndAt('');
    }
  }, []);

  const handleCreateNew = () => {
    setEditId(null);
    setExamTitle('');
    setMarkdown(SAMPLE_MARKDOWN);
    setDuration(60);
    setPassingGrade(70);
    setStartAt('');
    setEndAt('');
    setIsDaily(false);
    setShowAnswer(true);
    setImmediateFeedback(false);
    setShowSettings(true);
    setSaveMsg('');
    setActiveTab('editor');
  };

  const handleEdit = (t: TestRow) => {
    setEditId(t.id);
    setExamTitle(t.title);
    setMarkdown(t.raw_markdown);
    setDuration(t.duration_minutes);
    setPassingGrade(t.passing_grade);
    setStartAt(t.start_at ? t.start_at.slice(0, 16) : '');
    setEndAt(t.end_at ? t.end_at.slice(0, 16) : '');
    setIsDaily(false);
    setShowAnswer(t.show_answer ?? true);
    setImmediateFeedback(t.immediate_feedback ?? false);
    setShowSettings(true);
    setSaveMsg('');
    setActiveTab('editor');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus ujian ini secara permanen?')) return;
    await supabase.from('tests').delete().eq('id', id);
    loadTests();
  };

  const handleSave = useCallback(async () => {
    if (!examTitle.trim()) { setSaveMsg('Judul ujian wajib diisi.'); return; }
    setSaving(true);
    setSaveMsg('');
    
    const payload = {
      title: examTitle.trim(),
      raw_markdown: markdown,
      duration_minutes: duration,
      passing_grade: passingGrade,
      start_at: startAt || null,
      end_at: endAt || null,
      show_answer: showAnswer,
      immediate_feedback: immediateFeedback,
    };

    let errorObj = null;
    let rlsBlocked = false;

    if (editId) {
      const { data, error } = await supabase.from('tests').update(payload).eq('id', editId).select();
      errorObj = error;
      if (!error && (!data || data.length === 0)) {
        rlsBlocked = true;
      }
    } else {
      const { data, error } = await supabase.from('tests').insert(payload).select();
      errorObj = error;
      if (!error && (!data || data.length === 0)) {
        rlsBlocked = true;
      }
    }

    setSaving(false);
    if (errorObj) {
      setSaveMsg(errorObj.message);
    } else if (rlsBlocked) {
      setSaveMsg('Gagal Menyimpan: RLS Supabase memblokir UPDATE/INSERT. Anda harus membuat Policy di dashboard Supabase milik Anda untuk tabel "tests".');
    } else {
      setSaveMsg('Ujian berhasil disimpan.');
      setTimeout(() => {
        setSaveMsg('');
        setActiveTab('tests');
      }, 1500);
    }
  }, [editId, examTitle, markdown, duration, passingGrade, startAt, endAt, showAnswer, immediateFeedback]);

  // Generators
  const generatedPrompt = useMemo(() => {
    const systemRules = `Kamu adalah "ExaPrep Question Generator" — pembuat soal ujian profesional untuk platform ExaPrep. Sistem ExaPrep memiliki kemampuan rendering berikut yang WAJIB kamu gunakan:

═══════════════════════════════════════════
KEMAMPUAN RENDERING SISTEM EXAPREP
═══════════════════════════════════════════

1. MATEMATIKA (KaTeX)
   - Inline: $...$
   - Blok: $$...$$

2. GRAFIK DATA (Recharts)
   - Format: [CHART:TIPE] { JSON data } [/CHART]
   - Tipe: BAR, LINE, PIE

3. DIAGRAM INTERAKTIF (JSXGraph)
   - Format: [DIAGRAM] { JSON konfigurasi } [/DIAGRAM]
   - geometry: Titik, garis, lingkaran, poligon, dll. (Gunakan axis: true jika ada koordinat).

4. BLOK KODE
   - Format: \`\`\`bahasa ... \`\`\`

5. GAMBAR
   - Format: ![alt](url)

═══════════════════════════════════════════
FORMAT SOAL EXAPREP
═══════════════════════════════════════════

# Q[Nomor] (PILGAN) atau # Q[Nomor] (ESSAY)
[[A]] teks opsi A
[[B]] teks opsi B ...

Jawaban: ANSWER: [Huruf opsi / ESSAY]
Pembahasan: DISCUSSION: [Teks pembahasan lengkap]

═══════════════════════════════════════════
ATURAN KRITIS
═══════════════════════════════════════════
1. SELURUH output soal WAJIB dibungkus dalam SATU blok kode markdown: \`\`\`text ... \`\`\`
2. Jika ada kesalahan/terpotong: Ketik "[Delete this]" dan ulangi soal dengan nomor yang sama.
3. Gunakan KaTeX untuk semua ekspresi matematika.
4. DISCUSSION wajib ada dan lengkap.

═══════════════════════════════════════════`;

    const requestDetails = `Saya butuh soal ujian baru dengan spesifikasi berikut:\n\n` +
      `- Tipe Soal: ${promptType}\n` +
      `- Jumlah Soal: ${promptCount}\n` +
      `- Bahasa: ${promptLang}\n` +
      `- Tingkat / Level: ${promptLevel}\n`;
    
    let ctx = promptContext.trim() ? `- Konteks Penting:\n  ${promptContext}\n` : '';
    let oth = promptOther.trim() ? `- Catatan Tambahan:\n  ${promptOther}\n` : '';
    
    return systemRules + "\n\n" + requestDetails + ctx + oth + `\nSilakan buatkan soal sesuai panduan di atas.`;
  }, [promptType, promptCount, promptLang, promptLevel, promptContext, promptOther]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const printDocumentStyle = useMemo(() => {
    let w = 210, h = 297;
    if (printPaperSize === 'F4') { w = 215.9; h = 330.2; }
    else if (printPaperSize === 'Custom') { w = customPaperWidth; h = customPaperHeight; }
    return {
      css: `@media print { @page { size: ${w}mm ${h}mm; margin: 15mm; } }`,
      w, h
    };
  }, [printPaperSize, customPaperWidth, customPaperHeight]);

  return (
    <div className="min-h-screen print:min-h-0 bg-background text-foreground flex flex-col">
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
        <div className="fixed inset-0 z-50 bg-background flex flex-col print:static print:h-auto print:bg-white print:overflow-visible print:block">
          <style>{printDocumentStyle.css}</style>
          
          <div className="border-b p-4 flex flex-col items-start gap-4 bg-card print:hidden shadow-sm">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-lg font-bold flex items-center gap-2"><Printer className="w-5 h-5"/> Print Settings</h2>
              <div className="flex items-center gap-3">
                <Button onClick={() => window.print()} className="whitespace-nowrap">Cetak Sekarang</Button>
                <Button variant="ghost" onClick={() => setShowPrintModal(false)}>Tutup</Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 w-full">
              <div className="flex items-center gap-4 border-r pr-6 border-muted-foreground/20">
                <Label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
                  <input type="radio" name="cols" checked={printColumns === '1'} onChange={() => setPrintColumns('1')} className="h-4 w-4 accent-primary" />
                  1 Kolom
                </Label>
                <Label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
                  <input type="radio" name="cols" checked={printColumns === '2'} onChange={() => setPrintColumns('2')} className="h-4 w-4 accent-primary" />
                  2 Kolom
                </Label>
              </div>

              <div className="flex items-center gap-3 border-r pr-6 border-muted-foreground/20">
                <Label className="text-xs font-semibold whitespace-nowrap">Kertas</Label>
                <select 
                  className="h-8 text-sm border rounded px-2"
                  value={printPaperSize}
                  onChange={(e) => setPrintPaperSize(e.target.value as any)}
                >
                  <option value="A4">A4 (210×297)</option>
                  <option value="F4">F4 / Folio (215.9×330.2)</option>
                  <option value="Custom">Custom</option>
                </select>
                {printPaperSize === 'Custom' && (
                  <div className="flex gap-2">
                    <Input type="number" min={100} max={1000} value={customPaperWidth} onChange={(e) => setCustomPaperWidth(Number(e.target.value))} className="w-16 h-8 text-sm" title="Lebar (mm)" />
                    <span className="text-muted-foreground text-xs leading-8">x</span>
                    <Input type="number" min={100} max={1000} value={customPaperHeight} onChange={(e) => setCustomPaperHeight(Number(e.target.value))} className="w-16 h-8 text-sm" title="Tinggi (mm)" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 border-r pr-6 border-muted-foreground/20">
                <Label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
                  <input type="checkbox" checked={showPrintDiscussion} onChange={(e) => setShowPrintDiscussion(e.target.checked)} className="h-4 w-4 accent-primary rounded border-input" />
                  + Pembahasan
                </Label>
              </div>
              
              <div className="flex flex-col gap-2 border-r pr-6 border-muted-foreground/20 min-w-[200px]">
                <Label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
                  <input type="checkbox" checked={printShowHeader} onChange={(e) => setPrintShowHeader(e.target.checked)} className="h-4 w-4 accent-primary rounded border-input" />
                  Kop / Judul Ujian
                </Label>
                {printShowHeader && (
                  <Input 
                    placeholder="Judul Khusus (Opsional)" 
                    value={printCustomTitle} 
                    onChange={(e) => setPrintCustomTitle(e.target.value)}
                    className="h-8 text-xs w-full"
                  />
                )}
              </div>

              <div className="flex items-center gap-3 border-r pr-6 border-muted-foreground/20">
                <Label className="text-xs font-semibold whitespace-nowrap">Teks (px)</Label>
                <Input type="number" min={10} max={24} value={printFontSize} onChange={(e) => setPrintFontSize(Number(e.target.value))} className="w-16 h-8 text-sm" />
              </div>

              <div className="flex items-center gap-3">
                <Label className="text-xs font-semibold whitespace-nowrap">Diagram (%)</Label>
                <Input type="number" min={30} max={200} step={10} value={printGraphicScale} onChange={(e) => setPrintGraphicScale(Number(e.target.value))} className="w-20 h-8 text-sm" />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-muted p-8 print:p-0 print:bg-white text-black print:text-black print:overflow-visible print:block print:h-auto print:w-full scroll-smooth">
            {/* 
               PRINT PREVIEW CONTAINER
               - On screen: A scrollable area with shadow pages and balanced columns
               - In print: A continuous flow that browser fragments naturally with auto-fill
            */}
            <div 
              className={cn(
                "mx-auto bg-white shadow-lg print:shadow-none print:max-w-none print:w-full print:p-0 print:m-0 print:bg-transparent relative",
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
              {/* PAGE BREAK INDICATORS (Visual only, hidden in print) */}
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
              
              <div className="column-balancing-fix relative z-10 font-serif">
              
              {printShowHeader && (
                <div className="mb-6 pb-2 border-b-2 border-black col-span-full">
                  <h1 className="font-bold uppercase leading-tight" style={{ fontSize: `${printFontSize * 1.25}px` }}>{printCustomTitle || examTitle || 'SOAL UJIAN'}</h1>
                  <p className="mt-1 font-medium" style={{ fontSize: `${printFontSize * 0.9}px` }}>Waktu: {duration} Menit</p>
                </div>
              )}
              
              {questions.map((q, idx) => (
                <div key={q.id}>
                  {/* Rough page break indicator every 5 questions? No, that's bad. 
                      Let's just provide the container fix first. */}
                  <div className="mb-4 break-inside-avoid relative">
                    <div className="absolute left-0 font-bold" style={{ width: '1.5em' }}>{idx + 1}.</div>
                    <div className="pl-6">
                      <QuestionRenderer question={q} disabled showDiscussion={showPrintDiscussion} printMode={true} />
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-6 print:hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <TabsList className="mb-6 w-full max-w-2xl mx-auto grid grid-cols-4">
            <TabsTrigger value="tests">Daftar Ujian</TabsTrigger>
            <TabsTrigger value="attempts">Hasil Peserta</TabsTrigger>
            <TabsTrigger value="editor">{editId ? 'Edit Ujian' : 'Editor Baru'}</TabsTrigger>
            <TabsTrigger value="prompt">Prompt Generator</TabsTrigger>
          </TabsList>

          {/* TAB: TEKS (DAFTAR UJIAN) */}
          <TabsContent value="tests" className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Daftar Ujian Aktif</h2>
              <Button onClick={handleCreateNew}>Buat Ujian Baru</Button>
            </div>
            <div className="rounded-md border bg-card">
              {testList.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">Belum ada ujian yang dibuat.</div>
              ) : (
                <div className="divide-y">
                  {testList.map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div>
                        <h3 className="font-semibold">{test.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Durasi: {test.duration_minutes}m | KKM: {test.passing_grade} | 
                          Opsi Review: {test.show_answer ? 'Lengkap' : 'Netral'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(test)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(test.id)}>
                          Hapus
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB: ATTEMPTS (HASIL PESERTA) */}
          <TabsContent value="attempts" className="flex-1">
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

          {/* TAB: EDITOR */}
          <TabsContent value="editor" className="flex-1 space-y-4">
            {saveMsg && (
              <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-md text-sm font-medium">
                {saveMsg}
              </div>
            )}
            
            {showSettings && (
              <Card className="shadow-sm">
                <CardHeader className="py-3 border-b">
                  <CardTitle className="text-sm font-semibold">Pengaturan Ujian</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="exam-title" className="text-xs font-medium">Judul Ujian</Label>
                      <Input id="exam-title" placeholder="Cth: Ujian Harian" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="duration" className="text-xs font-medium">Durasi (menit)</Label>
                      <Input id="duration" type="number" min={1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="kkm" className="text-xs font-medium">KKM</Label>
                      <Input id="kkm" type="number" min={0} max={100} value={passingGrade} onChange={(e) => setPassingGrade(Number(e.target.value))} />
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="start-at" className="text-xs font-medium">Jadwal Mulai</Label>
                      <Input id="start-at" type="datetime-local" value={startAt} onChange={(e) => { setStartAt(e.target.value); setIsDaily(false); }} disabled={isDaily} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="end-at" className="text-xs font-medium">Jadwal Selesai</Label>
                      <Input id="end-at" type="datetime-local" value={endAt} onChange={(e) => { setEndAt(e.target.value); setIsDaily(false); }} disabled={isDaily} />
                    </div>
                    <div className="space-y-3 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={isDaily} onChange={(e) => handleDailyToggle(e.target.checked)} className="h-4 w-4 rounded border-input accent-primary" />
                        <span className="text-xs font-medium">Tes Hari Ini</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={showAnswer} onChange={(e) => setShowAnswer(e.target.checked)} className="h-4 w-4 rounded border-input accent-primary" />
                        <span className="text-xs font-medium">Tampilkan Jawaban Benar saat Review</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={immediateFeedback} onChange={(e) => setImmediateFeedback(e.target.checked)} className="h-4 w-4 rounded border-input accent-primary" />
                        <span className="text-xs font-medium">Tampilkan Benar/Salah Tiap Jawaban (Langsung)</span>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px] xl:h-[700px]">
              <Card className="flex flex-col shadow-sm h-full">
                <CardHeader className="py-3 border-b flex-none">
                  <CardTitle className="text-sm flex items-center justify-between font-semibold">
                    <span>Markdown Editor</span>
                    <Badge variant="secondary" className="text-xs font-mono">{markdown.split('\n').length} baris</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden relative">
                  <Textarea
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    className="absolute inset-0 h-full font-mono text-sm resize-none border-0 focus-visible:ring-0 rounded-none p-4"
                    placeholder="Tempel Markdown di sini..."
                  />
                </CardContent>
              </Card>

              <Card className="flex flex-col shadow-sm h-full">
                <CardHeader className="py-3 border-b flex-none">
                  <CardTitle className="text-sm flex items-center justify-between font-semibold">
                    <span>Live Preview</span>
                    <Badge variant="secondary" className="text-xs">{questions.length} soal</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
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
          <TabsContent value="prompt" className="flex-1 space-y-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold tracking-tight">AI Prompt Generator</h2>
                <p className="text-muted-foreground mt-2">Buat prompt spesifik untuk AI Generator sesuai standar format ExaPrep.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
  );
}


