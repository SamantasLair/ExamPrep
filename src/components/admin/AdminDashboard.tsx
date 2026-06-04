'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { parseMarkdown } from '@/lib/parser';
import { QuestionRenderer } from '@/components/exam/QuestionRenderer';
import { LabelSelector, type LabelTaxonomy } from '@/components/exam/LabelSelector';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { HelpCircle, Copy, Printer, CheckCircle2, Columns, FileText, Settings2, Calendar, Clock, User, Type } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { TestRow, StudentRow } from '@/lib/types';
import { motion } from 'framer-motion';

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
  const [studentList, setStudentList] = useState<StudentRow[]>([]);

  // Generator State
  const [stuPrefix, setStuPrefix] = useState('SMA-');
  const [stuCount, setStuCount] = useState('10');
  const [generatingStu, setGeneratingStu] = useState(false);
  const [stuMsg, setStuMsg] = useState('');

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
  const [enableTipPenalty, setEnableTipPenalty] = useState(false);
  const [penaltyTheoryConfig, setPenaltyTheoryConfig] = useState('10, 15, 20, 22, ...');
  const [penaltyPracticeConfig, setPenaltyPracticeConfig] = useState('15, 20, 25, 28, ...');
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
  const [printSideBySide, setPrintSideBySide] = useState(false);
  const [printAnswersAtEnd, setPrintAnswersAtEnd] = useState(false);
  const [printAnswerStyle, setPrintAnswerStyle] = useState<'solid' | 'outlined' | 'minimalist' | 'boxed' | 'bracket'>('solid');
  const [printCompactLayout, setPrintCompactLayout] = useState(false);

  // Prompt Generator State
  const [promptType, setPromptType] = useState('Pilihan Ganda (PILGAN)');
  const [promptCount, setPromptCount] = useState('10');
  const [promptLang, setPromptLang] = useState('Indonesia');
  const [promptLevel, setPromptLevel] = useState('SMA');
  const [promptContext, setPromptContext] = useState('');
  const [promptOther, setPromptOther] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [promptLabels, setPromptLabels] = useState<LabelTaxonomy>({ difficulty: [], ageRange: [], subject: [] });
  const [tipsRange, setTipsRange] = useState('0-1');

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

  const loadStudents = async () => {
    const { data } = await supabase.from('students').select('*').order('created_at', { ascending: false });
    if (data) setStudentList(data);
  };

  useEffect(() => {
    if (activeTab === 'tests') loadTests();
    if (activeTab === 'attempts') loadAttempts();
    if (activeTab === 'students') loadStudents();
  }, [activeTab]);

  const handleGenerateStudents = async () => {
    const count = parseInt(stuCount);
    if (isNaN(count) || count <= 0) return setStuMsg('Jumlah tidak valid');
    if (!stuPrefix.trim()) return setStuMsg('Prefix tidak boleh kosong');
    
    setGeneratingStu(true);
    setStuMsg('');
    const newStudents = [];
    const startIdx = studentList.length + 1;
    for (let i = 0; i < count; i++) {
      const num = String(startIdx + i).padStart(3, '0');
      const id = `${stuPrefix.trim()}${num}`;
      newStudents.push({
        id,
        name: id,
        birthday: null,
        avatar_url: null,
      });
    }

    const { error } = await supabase.from('students').insert(newStudents);
    setGeneratingStu(false);
    if (error) {
      setStuMsg(error.message);
    } else {
      setStuMsg(`Berhasil generate ${count} siswa.`);
      loadStudents();
    }
  };

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
    setEnableTipPenalty(false);
    setPenaltyTheoryConfig('10, 15, 20, 22, ...');
    setPenaltyPracticeConfig('15, 20, 25, 28, ...');
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
    setEnableTipPenalty(t.enable_tip_penalty ?? false);
    setPenaltyTheoryConfig(t.penalty_theory_config ?? '10, 15, 20, 22, ...');
    setPenaltyPracticeConfig(t.penalty_practice_config ?? '15, 20, 25, 28, ...');
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
      enable_tip_penalty: enableTipPenalty,
      penalty_theory_config: penaltyTheoryConfig,
      penalty_practice_config: penaltyPracticeConfig,
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
   - Inline: $...$  → contoh: $f(x) = 2x^2 + 3x$
   - Blok: $$...$$ → contoh: $$\\int_0^1 x^2 \\, dx = \\frac{1}{3}$$

2. GRAFIK DATA (Recharts)
   - Format: [CHART:TIPE] { JSON data } [/CHART]
   - Tipe: BAR, LINE, PIE
   - Contoh: [CHART:BAR] {"labels":["Jan","Feb","Mar"],"data":[10,25,15]} [/CHART]

3. DIAGRAM INTERAKTIF (JSXGraph) ← SUPER MODE
   - Format: [DIAGRAM] { JSON konfigurasi } [/DIAGRAM]
   - Gunakan \`type: "geometry"\` untuk kebutuhan apapun (Aljabar, Geometri, Kalkulus).
   - Elemen: \`point\`, \`line\`, \`circle\`, \`polygon\`, \`angle\`, \`text\`, \`functionGraph\` (grafik f(x)), \`integral\` (arsiran area).
   - Aturan Penting:
     * Berikan properti \`name\` pada elemen agar bisa direferensikan oleh elemen lain (misal: \`integral\` butuh \`curve1\`).
     * Gunakan \`axis: true\` dan \`grid: true\` untuk grafik fungsi/koordinat.
     * \`boundingBox\`: \`[xMin, yMax, xMax, yMin]\` krusial agar diagram tidak terpotong.
   - Contoh Kalkulus (Luas Daerah):
     [DIAGRAM] {
       "type": "geometry",
       "axis": true, "grid": true, "boundingBox": [-1, 5, 4, -1],
       "elements": [
         { "type": "functionGraph", "name": "f", "fn": "x*x", "strokeColor": "blue" },
         { "type": "functionGraph", "name": "g", "fn": "2*x", "strokeColor": "red" },
         { "type": "integral", "curve1": "f", "curve2": "g", "range": [0, 2], "fillColor": "purple", "fillOpacity": 0.3 },
         { "type": "text", "coords": [1, 2.5], "text": "Luas L", "color": "purple" }
       ]
     } [/DIAGRAM]

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
ATURAN KRITIS (TIDAK BOLEH DILANGGAR)
═══════════════════════════════════════════
1. SELURUH output soal WAJIB dibungkus dalam SATU blok kode markdown: \`\`\`text ... \`\`\`
2. Jika perlu ilustrasi grafis/geometri: WAJIB gunakan tag [DIAGRAM] dengan konfigurasi JSON.
3. Gunakan KaTeX ($...$ dan $$...$$) untuk semua ekspresi matematika secara disiplin.
4. HASILKAN DISCUSSION YANG LENGKAP & PROFESIONAL.
5. JIKA TERJADI KESALAHAN/TERPOTONG: Ketik tag "[Delete this]" pada soal tersebut, lalu ulangi pembuatan soal dengan nomor yang sama di bawahnya.
7. SISTEM TIPS (TIPS BANTUAN)
   - Rentang Bantuan Tips yang diminta: ${tipsRange} tips per soal.
   - JIKA 0-0, JANGAN BUAT TIPS SAMA SEKALI. JIKA > 0, WAJIB BERIKAN TIPS YANG BENAR-BENAR MEMBANTU.
   - Bedakan tipe tips dengan format di BAWAH baris DISCUSSION:
     TIPS_THEORY: [Berisi rumus yang dipakai, konsep dasar, atau ide krusial]
     TIPS_PRACTICE: [Berisi bocoran langkah pengerjaan, substitusi angka, atau clue praktis]
   - Contoh: Jika rentang 0-1, buatkan maksimal 1 TIPS_THEORY. Jika 2-4, buatkan kombinasi THEORY dan PRACTICE. Pastikan tidak terlalu ambigu.
   
═══════════════════════════════════════════`;

    const requestDetails = `Saya butuh soal ujian baru dengan spesifikasi berikut:\n\n` +
      `- Tipe Soal: ${promptType}\n` +
      `- Jumlah Soal: ${promptCount}\n` +
      `- Bahasa: ${promptLang}\n` +
      `- Tingkat / Level: ${promptLevel}\n`;
    
    let ctx = promptContext.trim() ? `- Konteks Penting:\n  ${promptContext}\n` : '';
    let oth = promptOther.trim() ? `- Catatan Tambahan:\n  ${promptOther}\n` : '';
    
    const difficultyStr = promptLabels.difficulty.length > 0 ? `[Tingkat Kesulitan: ${promptLabels.difficulty.join(', ')}]` : '';
    
    // Group consecutive "Kelas X"
    const formatAgeRange = (selected: string[]) => {
       const nums: number[] = [];
       const others: string[] = [];
       for (const val of selected) {
          if (val.startsWith("Kelas ")) {
             const n = parseInt(val.replace("Kelas ", ""), 10);
             if (!isNaN(n)) nums.push(n);
             else others.push(val);
          } else {
             others.push(val);
          }
       }
       nums.sort((a,b) => a-b);
       const ranges: string[] = [];
       if (nums.length > 0) {
          let start = nums[0];
          let prev = nums[0];
          for (let i = 1; i <= nums.length; i++) {
             if (nums[i] === prev + 1) {
                prev = nums[i];
             } else {
                if (start === prev) ranges.push(`Kelas ${start}`);
                else ranges.push(`Kelas ${start}-${prev}`);
                if (i < nums.length) { start = nums[i]; prev = nums[i]; }
             }
          }
       }
       return [...ranges, ...others].join(', ');
    };

    const ageStr = promptLabels.ageRange.length > 0 ? `[Range Umur/Kelas: ${formatAgeRange(promptLabels.ageRange)}]` : '';
    const subjectStr = promptLabels.subject.length > 0 ? `[Topik: ${promptLabels.subject.join(', ')}]` : '';
    const labelContext = (difficultyStr || ageStr || subjectStr) 
      ? `- Label Prioritas (Sertakan di output JSON/Markdown):\n  ${[difficultyStr, ageStr, subjectStr].filter(Boolean).join(' ')}\n` 
      : '';
    
    return systemRules + "\n\n" + requestDetails + labelContext + ctx + oth + `\nSilakan buatkan soal sesuai panduan di atas.`;
  }, [promptType, promptCount, promptLang, promptLevel, promptContext, promptOther, promptLabels, tipsRange]);

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
      css: `@media print { 
        @page { size: ${w}mm ${h}mm; margin: 15mm; } 
        html, body { height: auto !important; min-height: 0 !important; overflow: visible !important; }
        .print-container-root { min-height: 0 !important; height: auto !important; overflow: visible !important; }
        .print-main-parent { height: auto !important; position: static !important; display: block !important; }
      }`,
      w, h
    };
  }, [printPaperSize, customPaperWidth, customPaperHeight]);

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
            {/* 
               PRINT PREVIEW CONTAINER
               - On screen: A scrollable area with shadow pages and balanced columns
               - In print: A continuous flow that browser fragments naturally with auto-fill
            */}
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
                  /* NORMAL OR SIDE-BY-SIDE MODE */
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
                  /* ANSWERS AT THE END MODE */
                  <>
                    {/* Part 1: All Questions */}
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
  
                    {/* Part 2: Page Break & Answers List */}
                    <div className={cn(
                      "pt-10 break-before-page",
                      printColumns === '2' ? 'column-balancing-fix columns-2 gap-10' : ''
                    )}>
                      {/* Removed Answer Key Header as requested */}
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
             <Button variant={activeTab === 'attempts' ? 'default' : 'ghost'} onClick={() => setActiveTab('attempts')} className="w-full justify-start overflow-hidden transition-all active:scale-[0.98]">
               <CheckCircle2 className="w-4 h-4 md:mr-2 shrink-0" /> <span className="hidden md:inline truncate">Hasil Peserta</span>
             </Button>
             <Button variant={activeTab === 'students' ? 'default' : 'ghost'} onClick={() => setActiveTab('students')} className="w-full justify-start overflow-hidden transition-all active:scale-[0.98]">
               <User className="w-4 h-4 md:mr-2 shrink-0" /> <span className="hidden md:inline truncate">Data Siswa</span>
             </Button>
             <Button variant={activeTab === 'editor' ? 'default' : 'ghost'} onClick={() => setActiveTab('editor')} className="w-full justify-start overflow-hidden transition-all active:scale-[0.98]">
               <Settings2 className="w-4 h-4 md:mr-2 shrink-0" /> <span className="hidden md:inline truncate">{editId ? 'Edit Ujian' : 'Editor Baru'}</span>
             </Button>
             <Button variant={activeTab === 'prompt' ? 'default' : 'ghost'} onClick={() => setActiveTab('prompt')} className="w-full justify-start overflow-hidden transition-all active:scale-[0.98]">
               <Type className="w-4 h-4 md:mr-2 shrink-0" /> <span className="hidden md:inline truncate">Prompt Generator</span>
             </Button>
           </nav>
        </aside>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-muted/10 custom-scrollbar relative z-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="hidden">
              <TabsTrigger value="tests">1</TabsTrigger>
              <TabsTrigger value="attempts">2</TabsTrigger>
              <TabsTrigger value="students">3</TabsTrigger>
              <TabsTrigger value="editor">4</TabsTrigger>
              <TabsTrigger value="prompt">5</TabsTrigger>
            </TabsList>

          {/* TAB: TEKS (DAFTAR UJIAN) */}
          <TabsContent value="tests" className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

          {/* TAB: EDITOR */}
          <TabsContent value="editor" className="flex-1 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {saveMsg && (
              <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-md text-sm font-medium">
                {saveMsg}
              </div>
            )}
            
            {showSettings && (
              <details className="group border border-border/80 rounded-2xl bg-muted/10 overflow-hidden shadow-sm mb-6 animate-in fade-in slide-in-from-top-4 duration-500 [&_summary::-webkit-details-marker]:hidden" open>
                <summary className="flex cursor-pointer items-center justify-between p-4 bg-muted/40 hover:bg-muted/60 transition-colors font-bold text-sm">
                  <div className="flex items-center gap-2"><Settings2 className="w-4 h-4 text-primary" /> Pengaturan Ujian Lanjutan</div>
                  <span className="text-xs text-muted-foreground group-open:hidden">Klik untuk melihat pengaturan...</span>
                </summary>
                <div className="p-6 border-t border-border/40 space-y-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-background/50">
                  {/* Card 1: Identitas Ujian */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wide flex items-center gap-2 text-primary border-b pb-2"><FileText className="w-3.5 h-3.5" /> Identitas</h3>
                    <div className="space-y-1.5">
                      <Label htmlFor="exam-title" className="text-[11px] font-semibold">Judul Ujian</Label>
                      <Input id="exam-title" placeholder="Cth: Ujian Harian" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} className="h-8 text-xs bg-background" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="duration" className="text-[11px] font-semibold">Durasi (m)</Label>
                        <Input id="duration" type="number" min={1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="h-8 text-xs bg-background" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="kkm" className="text-[11px] font-semibold">KKM</Label>
                        <Input id="kkm" type="number" min={0} max={100} value={passingGrade} onChange={(e) => setPassingGrade(Number(e.target.value))} className="h-8 text-xs bg-background" />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Akses & Penjadwalan */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wide flex items-center gap-2 text-primary border-b pb-2"><Calendar className="w-3.5 h-3.5" /> Penjadwalan</h3>
                    <div className="space-y-1.5">
                      <Label htmlFor="start-at" className="text-[11px] font-semibold">Waktu Mulai</Label>
                      <Input id="start-at" type="datetime-local" value={startAt} onChange={(e) => { setStartAt(e.target.value); setIsDaily(false); }} disabled={isDaily} className="h-8 text-xs bg-background" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="end-at" className="text-[11px] font-semibold">Waktu Selesai</Label>
                      <Input id="end-at" type="datetime-local" value={endAt} onChange={(e) => { setEndAt(e.target.value); setIsDaily(false); }} disabled={isDaily} className="h-8 text-xs bg-background" />
                    </div>
                    <label className="flex items-center gap-2 p-2 bg-background/50 rounded-lg border border-dashed border-border cursor-pointer hover:bg-muted/50 transition-colors mt-2">
                      <input type="checkbox" checked={isDaily} onChange={(e) => handleDailyToggle(e.target.checked)} className="h-3.5 w-3.5 rounded border-input accent-primary" />
                      <span className="text-[11px] font-bold">Setel Hari Ini Otomatis</span>
                    </label>
                  </div>

                  {/* Card 3: Jawaban & Feedback */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wide flex items-center gap-2 text-primary border-b pb-2"><CheckCircle2 className="w-3.5 h-3.5" /> Feedback Ujian</h3>
                    <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg border bg-background hover:bg-muted/50 transition-all">
                      <input type="checkbox" checked={showAnswer} onChange={(e) => setShowAnswer(e.target.checked)} className="h-4 w-4 rounded border-input accent-primary" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">Kunci Jawaban</span>
                        <span className="text-[10px] text-muted-foreground leading-tight">Tampilkan di akhir ujian.</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg border bg-background hover:bg-muted/50 transition-all">
                      <input type="checkbox" checked={immediateFeedback} onChange={(e) => setImmediateFeedback(e.target.checked)} className="h-4 w-4 rounded border-input accent-primary" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">Feedback Instan</span>
                        <span className="text-[10px] text-muted-foreground leading-tight">Langsung cek benar/salah.</span>
                      </div>
                    </label>
                  </div>

                  {/* Card 4: Pengaturan Bantuan Tips (AI) */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wide flex items-center gap-2 text-primary border-b pb-2"><HelpCircle className="w-3.5 h-3.5" /> Bantuan Tips AI</h3>
                    <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg border bg-background hover:bg-muted/50 transition-all">
                      <input type="checkbox" checked={enableTipPenalty} onChange={(e) => setEnableTipPenalty(e.target.checked)} className="h-4 w-4 rounded border-input accent-primary" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">Kurangi Nilai</span>
                        <span className="text-[10px] text-muted-foreground leading-tight">Berikan penalti jika tips dipakai.</span>
                      </div>
                    </label>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-semibold text-muted-foreground">Teori (%)</Label>
                      <Input value={penaltyTheoryConfig} onChange={(e) => setPenaltyTheoryConfig(e.target.value)} placeholder="10, 15, ..." className="h-7 text-xs bg-background" disabled={!enableTipPenalty}/>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-semibold text-muted-foreground">Praktik (%)</Label>
                      <Input value={penaltyPracticeConfig} onChange={(e) => setPenaltyPracticeConfig(e.target.value)} placeholder="15, 20, ..." className="h-7 text-xs bg-background" disabled={!enableTipPenalty}/>
                    </div>
                  </div>
                </div>
              </details>
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
                        value={tipsRange} onChange={(e) => setTipsRange(e.target.value)}
                      >
                        <option value="0-0">0-0 (Tanpa Tips)</option>
                        <option value="0-1">0-1 (Sedikit Bantuan)</option>
                        <option value="1-2">1-2 (Bantuan Menengah)</option>
                        <option value="2-4">2-4 (Banyak Bantuan)</option>
                      </select>
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


