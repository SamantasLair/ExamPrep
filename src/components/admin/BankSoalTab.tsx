'use client';

import { useBankSoalVM } from '@/viewmodels/useBankSoalVM';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LabelSelector } from '@/components/exam/LabelSelector';
import { useState } from 'react';
import { Search, Database, Trash2, ShoppingCart, PlusCircle, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { QuestionRenderer } from '@/components/exam/QuestionRenderer';

export function BankSoalTab() {
  const {
    questionsList,
    loading,
    errorMsg, setErrorMsg,
    searchTerm, setSearchTerm,
    selectedIds, toggleSelection,
    importModalOpen, setImportModalOpen,
    importText, setImportText,
    parsedImport,
    handleParseImport,
    handleCommitImport,
    dangerAction, setDangerAction,
    dangerConfirmText, setDangerConfirmText,
    executeWipe,
    handleBulkApplyLabels,
  } = useBankSoalVM();

  const [bulkLabels, setBulkLabels] = useState({ difficulty: [], ageRange: [], subject: [] });

  const filteredQuestions = questionsList.filter(q => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const bodyStr = q.body.toLowerCase();
    const labelStr = JSON.stringify(q.labels).toLowerCase();
    return bodyStr.includes(term) || labelStr.includes(term);
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6 text-primary" /> Bank Soal Terpusat
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola ribuan soal dengan metadata label cerdas. Mendukung Bulk Labeling dan M2M Verification.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportModalOpen(true)} className="gap-2 font-bold">
            <PlusCircle className="w-4 h-4" /> Import Markdown (M2M)
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium">{errorMsg}</span>
          <Button variant="ghost" size="sm" onClick={() => setErrorMsg('')}><X className="w-4 h-4"/></Button>
        </div>
      )}

      {/* DANGER ZONE */}
      <details className="group border border-destructive/30 rounded-xl bg-destructive/5 overflow-hidden shadow-sm [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex cursor-pointer items-center justify-between p-4 hover:bg-destructive/10 transition-colors font-bold text-sm text-destructive">
          <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> DANGER ZONE (Area Berbahaya)</div>
          <span className="text-xs group-open:hidden">Klik untuk melihat opsi Wipe Clean...</span>
        </summary>
        <div className="p-6 border-t border-destructive/20 space-y-6 bg-background">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-white" onClick={() => { setDangerAction('WIPE_QUESTIONS'); setDangerConfirmText(''); }}>Kosongkan Bank Soal</Button>
            <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-white" onClick={() => { setDangerAction('WIPE_TESTS'); setDangerConfirmText(''); }}>Kosongkan Daftar Ujian</Button>
            <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-white" onClick={() => { setDangerAction('WIPE_ATTEMPTS'); setDangerConfirmText(''); }}>Hapus Riwayat Nilai</Button>
            <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-white" onClick={() => { setDangerAction('WIPE_STUDENTS'); setDangerConfirmText(''); }}>Hapus Semua Siswa</Button>
            <Button variant="destructive" className="ml-auto font-black shadow-lg shadow-destructive/20" onClick={() => { setDangerAction('WIPE_ALL'); setDangerConfirmText(''); }}>WIPE CLEAN ALL DATA</Button>
          </div>

          {dangerAction && (
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30 animate-in zoom-in-95">
              <Label className="text-destructive font-bold mb-2 block">
                Anda akan mengeksekusi: {dangerAction}. <br/>
                Ketik <span className="font-mono bg-destructive text-white px-2 py-0.5 rounded mx-1">WIPE CLEAN</span> untuk melanjutkan.
              </Label>
              <div className="flex gap-2 max-w-md">
                <Input value={dangerConfirmText} onChange={e => setDangerConfirmText(e.target.value)} placeholder="Ketik WIPE CLEAN di sini..." className="border-destructive/50 focus-visible:ring-destructive" />
                <Button variant="destructive" disabled={dangerConfirmText !== 'WIPE CLEAN' || loading} onClick={() => executeWipe(dangerAction)}>
                  {loading ? 'Memproses...' : 'Eksekusi Destruktif'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </details>

      {/* MAIN DATA TABLE */}
      <div className="border rounded-xl bg-card overflow-hidden shadow-sm flex flex-col h-[600px]">
        <div className="p-4 border-b bg-muted/20 flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Cari teks soal atau label (contoh: NLP, Matematika, Sulit)..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Badge variant="secondary" className="text-xs px-3 py-1.5">{filteredQuestions.length} Soal</Badge>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading && questionsList.length === 0 ? (
             <div className="text-center p-8 text-muted-foreground animate-pulse">Memuat database...</div>
          ) : filteredQuestions.length === 0 ? (
             <div className="text-center p-8 text-muted-foreground">Tidak ada soal yang ditemukan.</div>
          ) : (
            filteredQuestions.map((q, idx) => (
              <div key={q.id} className={`flex gap-4 p-4 border rounded-lg transition-all ${selectedIds.includes(q.id) ? 'bg-primary/5 border-primary/40 shadow-sm' : 'hover:bg-muted/30'}`}>
                <div className="pt-1">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(q.id)} 
                    onChange={() => toggleSelection(q.id)} 
                    className="w-5 h-5 accent-primary cursor-pointer"
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="bg-background text-xs font-mono">{q.type}</Badge>
                    {q.labels && Object.entries(q.labels).map(([k, vals]) => 
                      vals.map(v => (
                        <Badge key={`${k}-${v}`} variant="secondary" className="text-xs capitalize">{v}</Badge>
                      ))
                    )}
                  </div>
                  {/* Note: In a real app we'd parse q.body to ContentBlock if it's stringified JSON, but for minimal UI we'll just show raw text preview */}
                  <div className="text-sm font-serif line-clamp-3 text-muted-foreground bg-muted/10 p-3 rounded-md border border-dashed">
                    {q.body.slice(0, 300)}...
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PERSISTENT CART (Floating Bottom Right) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-card border-2 border-primary/20 shadow-2xl rounded-2xl p-5 w-80 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary"/> Keranjang Seleksi</h3>
              <Badge variant="default" className="text-sm px-2">{selectedIds.length}</Badge>
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground">Terapkan Label Massal (Bulk Action):</Label>
              <div className="bg-background border rounded-lg p-3 max-h-48 overflow-y-auto custom-scrollbar">
                <LabelSelector selectedLabels={bulkLabels as any} onChange={setBulkLabels as any} />
              </div>
              <Button 
                className="w-full font-bold shadow-md shadow-primary/20" 
                disabled={loading || (bulkLabels.difficulty.length === 0 && bulkLabels.subject.length === 0 && bulkLabels.ageRange.length === 0)}
                onClick={() => handleBulkApplyLabels(bulkLabels as any)}
              >
                {loading ? 'Menyimpan...' : 'Inject Label ke Database'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT M2M MODAL */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border shadow-2xl rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b bg-muted/20">
              <div>
                <h3 className="font-bold text-lg">Verifikator Pra-Simpan M2M</h3>
                <p className="text-xs text-muted-foreground">Paste hasil markdown AI di sini untuk diverifikasi sebelum masuk database.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setImportModalOpen(false)}><X className="w-5 h-5"/></Button>
            </div>
            <div className="flex-1 flex overflow-hidden">
              {/* Left: Input */}
              <div className="w-1/2 flex flex-col border-r">
                <Textarea 
                  value={importText} 
                  onChange={e => setImportText(e.target.value)} 
                  placeholder="Paste 50 soal Anda di sini..." 
                  className="flex-1 resize-none border-0 focus-visible:ring-0 rounded-none p-4 font-mono text-xs"
                />
                <div className="p-3 border-t bg-muted/10">
                  <Button className="w-full" onClick={handleParseImport}>Ekstrak & Validasi Teks</Button>
                </div>
              </div>
              {/* Right: Verification */}
              <div className="w-1/2 flex flex-col bg-muted/5">
                <div className="p-3 border-b flex items-center justify-between bg-primary/5">
                  <span className="text-sm font-bold text-primary">Hasil Ekstraksi: {parsedImport.length} Soal</span>
                  {parsedImport.length > 0 && <Badge variant="default" className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1"/> Siap Simpan</Badge>}
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {parsedImport.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm mt-10">Belum ada data terekstrak.</div>
                  ) : (
                    parsedImport.map((q, i) => {
                      const hasLabels = q.labels && q.labels.length > 0;
                      return (
                        <div key={i} className={`p-3 border rounded-lg text-sm ${hasLabels ? 'bg-background' : 'bg-destructive/5 border-destructive/30'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold">Q{q.id || i+1}</span>
                            <Badge variant={hasLabels ? 'secondary' : 'destructive'} className="text-[10px]">
                              {hasLabels ? `${q.labels?.length} Label Terdeteksi` : 'Nir-Label (AI Gagal)'}
                            </Badge>
                          </div>
                          {hasLabels && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {q.labels?.map((l, lIdx) => <Badge key={lIdx} variant="outline" className="text-[10px]">{l}</Badge>)}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
                {parsedImport.length > 0 && (
                  <div className="p-4 border-t bg-background">
                    <Button className="w-full font-bold shadow-lg" onClick={handleCommitImport} disabled={loading}>
                      {loading ? 'Menyimpan...' : `Commit ${parsedImport.length} Soal ke Bank`}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
