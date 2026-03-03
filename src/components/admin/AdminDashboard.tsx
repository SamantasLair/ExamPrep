'use client';

import { useState, useCallback, useMemo } from 'react';
import { parseMarkdown } from '@/lib/parser';
import { QuestionRenderer } from '@/components/exam/QuestionRenderer';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';

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
Jelaskan konsep turunan fungsi dan berikan contoh penerapannya dalam kehidupan sehari-hari.

Gunakan rumus berikut sebagai dasar:
$$f'(x) = \\\\lim_{h \\\\to 0} \\\\frac{f(x+h) - f(x)}{h}$$

ANSWER: ESSAY
DISCUSSION: Turunan fungsi menggambarkan laju perubahan suatu fungsi. Dalam kehidupan sehari-hari, contohnya adalah kecepatan sebagai turunan dari posisi terhadap waktu.
`;

function getTodayRange() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return { start: `${y}-${m}-${d}T00:00`, end: `${y}-${m}-${d}T23:59` };
}

export function AdminDashboard() {
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const [examTitle, setExamTitle] = useState('');
  const [duration, setDuration] = useState(60);
  const [passingGrade, setPassingGrade] = useState(70);
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [isDaily, setIsDaily] = useState(false);
  const [showAnswer, setShowAnswer] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const questions = useMemo(() => {
    try {
      return parseMarkdown(markdown);
    } catch {
      return [];
    }
  }, [markdown]);

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

  const handleSave = useCallback(async () => {
    if (!examTitle.trim()) { setSaveMsg('Judul ujian wajib diisi.'); return; }
    setSaving(true);
    setSaveMsg('');
    const { error } = await supabase.from('tests').insert({
      title: examTitle.trim(),
      raw_markdown: markdown,
      duration_minutes: duration,
      passing_grade: passingGrade,
      start_at: startAt || null,
      end_at: endAt || null,
      show_answer: showAnswer,
    });
    setSaving(false);
    setSaveMsg(error ? error.message : 'Ujian berhasil disimpan.');
  }, [examTitle, markdown, duration, passingGrade, startAt, endAt, showAnswer]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold">ExaPrep Admin</h1>
            <Badge variant="outline">Smart-Parser</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowSettings((v) => !v)}>
              {showSettings ? 'Tutup Pengaturan' : 'Pengaturan'}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan Ujian'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => window.location.href = '/'}>
              Keluar
            </Button>
          </div>
        </div>
        {saveMsg && (
          <div className="container mx-auto px-4 pb-2">
            <p className="text-sm text-primary font-medium">{saveMsg}</p>
          </div>
        )}
      </header>

      <div className="container mx-auto px-4 py-4">
        {/* Settings Panel */}
        {showSettings && (
          <Card className="mb-4 shadow-sm">
            <CardHeader className="py-3 border-b">
              <CardTitle className="text-sm font-semibold">Pengaturan Ujian</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Judul */}
                <div className="space-y-1.5">
                  <Label htmlFor="exam-title" className="text-xs font-medium">Judul Ujian</Label>
                  <Input
                    id="exam-title"
                    placeholder="Contoh: Ujian Matematika Kelas 10"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                  />
                </div>
                {/* Durasi */}
                <div className="space-y-1.5">
                  <Label htmlFor="duration" className="text-xs font-medium">Durasi (menit)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                  />
                </div>
                {/* KKM */}
                <div className="space-y-1.5">
                  <Label htmlFor="kkm" className="text-xs font-medium">KKM (Nilai Minimum Lulus)</Label>
                  <Input
                    id="kkm"
                    type="number"
                    min={0}
                    max={100}
                    value={passingGrade}
                    onChange={(e) => setPassingGrade(Number(e.target.value))}
                  />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Jadwal Mulai */}
                <div className="space-y-1.5">
                  <Label htmlFor="start-at" className="text-xs font-medium">Jadwal Mulai</Label>
                  <Input
                    id="start-at"
                    type="datetime-local"
                    value={startAt}
                    onChange={(e) => { setStartAt(e.target.value); setIsDaily(false); }}
                    disabled={isDaily}
                  />
                </div>
                {/* Jadwal Selesai */}
                <div className="space-y-1.5">
                  <Label htmlFor="end-at" className="text-xs font-medium">Jadwal Selesai</Label>
                  <Input
                    id="end-at"
                    type="datetime-local"
                    value={endAt}
                    onChange={(e) => { setEndAt(e.target.value); setIsDaily(false); }}
                    disabled={isDaily}
                  />
                </div>
                {/* Toggles */}
                <div className="space-y-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDaily}
                      onChange={(e) => handleDailyToggle(e.target.checked)}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    <span className="text-xs font-medium">Tes Hari Ini</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAnswer}
                      onChange={(e) => setShowAnswer(e.target.checked)}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    <span className="text-xs font-medium">Tampilkan Benar/Salah saat Review</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Editor + Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          {/* Editor Panel */}
          <Card className="flex flex-col shadow-sm">
            <CardHeader className="py-3 border-b">
              <CardTitle className="text-sm flex items-center justify-between font-semibold">
                <span>Markdown Editor</span>
                <Badge variant="secondary" className="text-xs font-mono">
                  {markdown.split('\n').length} baris
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <Textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="h-full min-h-[500px] font-mono text-sm resize-none border-0 focus-visible:ring-0 rounded-none p-4"
                placeholder="Tempel Markdown di sini..."
              />
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card className="flex flex-col shadow-sm">
            <CardHeader className="py-3 border-b">
              <CardTitle className="text-sm flex items-center justify-between font-semibold">
                <span>Live Preview</span>
                <Badge variant="secondary" className="text-xs">
                  {questions.length} soal
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full max-h-[calc(100vh-220px)] p-4">
                {questions.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                    Belum ada soal terdeteksi. Pastikan format markdown benar.
                  </div>
                ) : (
                  <div className="space-y-4 pr-3">
                    {questions.map((q) => (
                      <QuestionRenderer
                        key={q.id}
                        question={q}
                        showDiscussion
                        disabled
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

