import { useBankSoalVM } from '@/viewmodels/useBankSoalVM';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LabelSelector } from '@/components/exam/LabelSelector';
import { useState } from 'react';
import { Search, Database, ShoppingCart, PlusCircle, CheckCircle2, X, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { createPortal } from 'react-dom';

export function BankSoalTab() {
  const {
    questionsList,
    loading,
    errorMsg, setErrorMsg,
    currentPage, totalQuestions, ITEMS_PER_PAGE,
    handleNextPage, handlePrevPage,
    searchTerm, setSearchTerm,
    selectedIds, toggleSelection,
    importModalOpen, setImportModalOpen,
    importText, setImportText,
    parsedImport,
    activeImportIdx, setActiveImportIdx,
    handleParseImport,
    handleCommitImport,
    handleUpdateImportLabel,
    handleBulkApplyLabels,
  } = useBankSoalVM();

  const [bulkLabels, setBulkLabels] = useState({ difficulty: [], ageRange: [], subject: [] });
  const [activeImportLabels, setActiveImportLabels] = useState({ difficulty: [], ageRange: [], subject: [] });

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
        <div className="p-4 border-t bg-muted/20 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Menampilkan halaman {currentPage} (Total {totalQuestions} soal)
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4 mr-1"/> Prev</Button>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage * ITEMS_PER_PAGE >= totalQuestions}>Next <ChevronRight className="w-4 h-4 ml-1"/></Button>
          </div>
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

      {/* IMPORT M2M MODAL (Using Portal to bypass z-index issues) */}
      {importModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border shadow-2xl rounded-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b bg-muted/20">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2"><LayoutGrid className="w-5 h-5 text-primary"/> Verifikator Pra-Simpan M2M</h3>
                <p className="text-xs text-muted-foreground">Paste markdown soal di sini. Pastikan format mengandung # Q1...</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setImportModalOpen(false)}><X className="w-5 h-5"/></Button>
            </div>
            <div className="flex-1 flex overflow-hidden">
              {/* Panel 1: Input Markdown */}
              <div className="w-1/3 flex flex-col border-r bg-muted/5">
                <Textarea 
                  value={importText} 
                  onChange={e => setImportText(e.target.value)} 
                  placeholder="Paste markdown soal di sini. Pastikan format mengandung # Q1..." 
                  className="flex-1 resize-none border-0 focus-visible:ring-0 rounded-none p-4 font-mono text-xs custom-scrollbar"
                />
                <div className="p-3 border-t bg-background">
                  <Button className="w-full font-bold shadow-md shadow-primary/20" onClick={handleParseImport}>Ekstrak & Validasi Teks</Button>
                </div>
              </div>
              
              {/* Panel 2: Grid Navigasi Soal */}
              <div className="w-1/3 flex flex-col border-r bg-background">
                <div className="p-3 border-b flex items-center justify-between bg-muted/20">
                  <span className="text-sm font-bold">Navigasi ({parsedImport.length} Soal)</span>
                  {parsedImport.length > 0 && <Badge variant="default" className="bg-green-600">Siap</Badge>}
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {parsedImport.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm mt-10">Belum ada data.</div>
                  ) : (
                    <div className="grid grid-cols-5 gap-2">
                      {parsedImport.map((q, i) => {
                        const hasLabels = q.labels && q.labels.length > 0;
                        const isActive = activeImportIdx === i;
                        return (
                          <button
                            key={i}
                            onClick={() => setActiveImportIdx(i)}
                            className={`aspect-square rounded-md flex items-center justify-center font-bold text-xs border-2 transition-all hover:scale-105 ${
                              isActive ? 'ring-2 ring-primary ring-offset-1 border-primary bg-primary/10' :
                              hasLabels ? 'border-green-500/50 text-green-600 bg-green-50' : 'border-destructive/50 text-destructive bg-destructive/10'
                            }`}
                          >
                            {i + 1}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {parsedImport.length > 0 && (
                  <div className="p-4 border-t bg-muted/10">
                    <Button className="w-full font-bold bg-green-600 hover:bg-green-700 shadow-lg text-white" onClick={handleCommitImport} disabled={loading}>
                      {loading ? 'Menyimpan...' : `Commit ${parsedImport.length} Soal`}
                    </Button>
                  </div>
                )}
              </div>

              {/* Panel 3: Detail & Label Injector */}
              <div className="w-1/3 flex flex-col bg-muted/5">
                {activeImportIdx !== null && parsedImport[activeImportIdx] ? (
                  <>
                    <div className="p-3 border-b bg-muted/20 font-bold text-sm">
                      Detail Soal #{activeImportIdx + 1}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                      <div className="text-xs bg-background p-3 rounded border font-serif line-clamp-6 text-muted-foreground">
                        {JSON.stringify(parsedImport[activeImportIdx].body)}
                      </div>
                      <div className="space-y-2 border-t pt-4">
                        <Label className="text-xs font-bold text-primary">Injeksi Label Manual</Label>
                        <p className="text-[10px] text-muted-foreground mb-2">Gunakan ini jika AI gagal melabeli soal (merah).</p>
                        <div className="bg-background rounded border p-2 max-h-40 overflow-y-auto custom-scrollbar">
                          <LabelSelector selectedLabels={activeImportLabels as any} onChange={setActiveImportLabels as any} />
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full font-bold mt-2" 
                          onClick={() => handleUpdateImportLabel(activeImportIdx, activeImportLabels)}
                        >
                          Simpan Label ke Soal #{activeImportIdx + 1}
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold">Label Saat Ini:</Label>
                        <div className="flex flex-wrap gap-1">
                          {parsedImport[activeImportIdx].labels?.length ? 
                            parsedImport[activeImportIdx].labels?.map(l => <Badge key={l} variant="secondary" className="text-[10px]">{l}</Badge>) 
                            : <Badge variant="destructive" className="text-[10px]">Kosong</Badge>
                          }
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-6 text-center">
                    Klik salah satu kotak navigasi soal untuk melihat detail dan mengatur label.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
