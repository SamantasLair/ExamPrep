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

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

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

    let errorObj;
    if (editId) {
      const { error } = await supabase.from('tests').update(payload).eq('id', editId);
      errorObj = error;
    } else {
      const { error } = await supabase.from('tests').insert(payload);
      errorObj = error;
    }

    setSaving(false);
    if (errorObj) {
      setSaveMsg(errorObj.message);
    } else {
      setSaveMsg('Ujian berhasil disimpan.');
      setTimeout(() => {
        setSaveMsg('');
        setActiveTab('tests');
      }, 1500);
    }
  }, [editId, examTitle, markdown, duration, passingGrade, startAt, endAt, showAnswer, immediateFeedback]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10 flex-none">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold">ExaPrep Admin</h1>
            <Badge variant="outline">Dashboard</Badge>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'editor' && (
              <Button size="sm" variant="outline" onClick={() => setShowSettings((v) => !v)}>
                {showSettings ? 'Tutup Pengaturan' : 'Pengaturan'}
              </Button>
            )}
            {activeTab === 'editor' && (
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Ujian'}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => window.location.href = '/'}>
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <TabsList className="mb-6 w-full max-w-md mx-auto grid grid-cols-3">
            <TabsTrigger value="tests">Daftar Ujian</TabsTrigger>
            <TabsTrigger value="attempts">Hasil Peserta</TabsTrigger>
            <TabsTrigger value="editor">{editId ? 'Edit Ujian' : 'Editor Baru'}</TabsTrigger>
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
        </Tabs>
      </main>
    </div>
  );
}


