import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { parseMarkdown } from '@/lib/parser';
import type { LabelTaxonomy } from '@/components/exam/LabelSelector';
import { supabase } from '@/lib/supabase';
import type { TestRow, StudentRow } from '@/lib/types';
import { useDebounce } from '@/hooks/useDebounce';

export const SAMPLE_MARKDOWN = ``;

function getTodayRange() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return { start: `${y}-${m}-${d}T00:00`, end: `${y}-${m}-${d}T23:59` };
}

export function useAdminDashboardVM() {
  const [activeTab, setActiveTab] = useState('tests'); // 'tests' | 'attempts' | 'editor'
  
  const [testList, setTestList] = useState<TestRow[]>([]);
  const [attemptList, setAttemptList] = useState<any[]>([]);
  const [studentList, setStudentList] = useState<StudentRow[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  // Generator State
  const [stuPrefix, setStuPrefix] = useState('SMA-');
  const [stuCount, setStuCount] = useState('10');
  const [generatingStu, setGeneratingStu] = useState(false);
  const [stuMsg, setStuMsg] = useState('');

  // Editor State
  const [editId, setEditId] = useState<string | null>(null);
  const [rawMarkdown, setRawMarkdown] = useState(SAMPLE_MARKDOWN);
  const debouncedMarkdown = useDebounce(rawMarkdown, 500);
  const [examTitle, setExamTitle] = useState('');
  const [examDescription, setExamDescription] = useState('');
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
  const previousMarkdownRef = useRef(debouncedMarkdown);

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
  const [isCustomTips, setIsCustomTips] = useState(false);

  const questions = useMemo(() => {
    try {
      return parseMarkdown(debouncedMarkdown);
    } catch {
      return [];
    }
  }, [debouncedMarkdown]);

  useEffect(() => {
    if (questions.length !== prevQuestionsLen.current) {
      setCurrentPreviewIdx(0);
      prevQuestionsLen.current = questions.length;
    }
  }, [questions]);

  // Auto-Delete Watcher
  useEffect(() => {
    if (debouncedMarkdown.includes('[Delete this]') && !previousMarkdownRef.current.includes('[Delete this]')) {
      setTimeout(() => {
        const ok = window.confirm('Sistem mendeteksi tag "[Delete this]" (Kesalahan AI) di teks.\\n\\nApakah Anda ingin sistem menghapus otomatis soal-soal tersebut tanpa mengubah soal lainnya?');
        if (ok) {
          const parts = debouncedMarkdown.split(/(?=#\\s*Q\\d+\\s*\\((?:PILGAN|ESSAY)\\)\\s*)/i);
          const cleanedParts = parts.filter(part => !part.includes('[Delete this]'));
          setRawMarkdown(cleanedParts.join('').trimStart());
        }
      }, 50);
    }
    previousMarkdownRef.current = debouncedMarkdown;
  }, [debouncedMarkdown]);

  const loadTests = async () => {
    const { data } = await supabase.from('tests').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) setTestList(data as TestRow[]);
  };

  const loadAttempts = async () => {
    const { data } = await supabase
      .from('attempts')
      .select('id, test_id, student_id, score, status, finished_at, tests(title)')
      .order('finished_at', { ascending: false })
      .limit(50);
    if (data) setAttemptList(data);
  };

  const loadStudents = async () => {
    const { data } = await supabase.from('students').select('*').order('created_at', { ascending: false }).limit(50);
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
    setExamDescription('');
    setRawMarkdown(SAMPLE_MARKDOWN);
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
    setExamDescription(t.description || '');
    setRawMarkdown(t.raw_markdown);
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

  const handleAnalytics = (id: string) => {
    setSelectedTestId(id);
    setActiveTab('analytics');
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
    
    // Extract correct answers for BIG DATA Doctrine (IRT Analytics)
    const correctAnswers: Record<string, string> = {};
    questions.forEach(q => {
      if (q.type === 'MCQ' && q.correctAnswer) {
        correctAnswers[q.id.toString()] = q.correctAnswer;
      }
    });

    const payload = {
      title: examTitle.trim(),
      description: examDescription.trim() || null,
      raw_markdown: rawMarkdown,
      duration_minutes: duration,
      passing_grade: passingGrade,
      start_at: startAt || null,
      end_at: endAt || null,
      show_answer: showAnswer,
      immediate_feedback: immediateFeedback,
      enable_tip_penalty: enableTipPenalty,
      penalty_theory_config: penaltyTheoryConfig,
      penalty_practice_config: penaltyPracticeConfig,
      correct_answers: correctAnswers
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
  }, [editId, examTitle, examDescription, rawMarkdown, questions, duration, passingGrade, startAt, endAt, showAnswer, immediateFeedback, enableTipPenalty, penaltyTheoryConfig, penaltyPracticeConfig]);

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

    const requestDetails = `Saya butuh soal ujian baru dengan spesifikasi berikut:\\n\\n` +
      `- Tipe Soal: ${promptType}\\n` +
      `- Jumlah Soal: ${promptCount}\\n` +
      `- Bahasa: ${promptLang}\\n` +
      `- Tingkat / Level: ${promptLevel}\\n`;
    
    let ctx = promptContext.trim() ? `- Konteks Penting:\\n  ${promptContext}\\n` : '';
    let oth = promptOther.trim() ? `- Catatan Tambahan:\\n  ${promptOther}\\n` : '';
    
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

    const ageStr = promptLabels.ageRange.length > 0 ? `RangeUmur=${formatAgeRange(promptLabels.ageRange)}` : '';
    const subjectStr = promptLabels.subject.length > 0 ? `Subject=${promptLabels.subject.join(', ')}` : '';
    const diffStr = promptLabels.difficulty.length > 0 ? `Difficulty=${promptLabels.difficulty.join(', ')}` : 'Difficulty=Sedang';
    
    const requiredLabels = [diffStr, ageStr, subjectStr].filter(Boolean).join(', ');

    const criticalDirective = `
<CRITICAL_DIRECTIVE>
WARNING: KEGAGALAN MENYERTAKAN LABEL AKAN MENYEBABKAN SISTEM GAGAL MEMBACA SOAL ANDA.
PADA SETIAP SOAL YANG ANDA BUAT, SETELAH BARIS \`DISCUSSION:\` (ATAU SETELAH TIPS JIKA ADA), ANDA **WAJIB SECARA ABSOLUT** MENAMBAHKAN SATU BARIS BARU DENGAN FORMAT BERIKUT:
LABELS: ${requiredLabels ? requiredLabels : 'Subject=General, Difficulty=Medium'}

JANGAN MENGUBAH NAMA KEY LABEL. GUNAKAN FORMAT EXACT SEPERTI CONTOH DI ATAS.
</CRITICAL_DIRECTIVE>
`;
    
    return systemRules + "\\n\\n" + requestDetails + ctx + oth + criticalDirective + `\\nSilakan buatkan soal sesuai panduan di atas.`;
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

  return {
    // State
    activeTab, setActiveTab,
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
    examDescription, setExamDescription,
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
    // Computed & Methods
    questions,
    generatedPrompt,
    printDocumentStyle,
    selectedTestId, setSelectedTestId,
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
  };
}
