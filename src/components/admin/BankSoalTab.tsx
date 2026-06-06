import { useBankSoalVM } from '@/viewmodels/useBankSoalVM';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LabelSelector } from '@/components/exam/LabelSelector';
import { useState } from 'react';
import { Search, Database, ShoppingCart, PlusCircle, CheckCircle2, X, ChevronLeft, ChevronRight, LayoutGrid, Filter, BarChart } from 'lucide-react';
import { createPortal } from 'react-dom';

export function BankSoalTab() {
  const {
    questionsList,
    loading,
    errorMsg, setErrorMsg,
    currentPage, totalQuestions, itemsPerPage, setItemsPerPage,
    handleNextPage, handlePrevPage,
    searchTerm, setSearchTerm,
    filterLabels, setFilterLabels,
    selectedIds, toggleSelection, selectAllVisible,
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

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  const removeFilterLabel = (category: string, value: string) => {
    setFilterLabels((prev: any) => ({
      ...prev,
      [category]: prev[category].filter((v: string) => v !== value)
    }));
  };

  const extractText = (bodyStr: string) => {
    try {
      const parsed = JSON.parse(bodyStr);
      if (Array.isArray(parsed)) {
        return parsed.map(p => p.content || '').join(' ').slice(0, 200) + '...';
      }
      return bodyStr.slice(0, 200) + '...';
    } catch {
      return bodyStr.slice(0, 200) + '...';
    }
  };

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

      {/* SPLIT PANE LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-6 h-[700px]">
        
        {/* LEFT PANE (60%): SOAL CARDS */}
        <div className="lg:w-[60%] flex flex-col border rounded-xl bg-card overflow-hidden shadow-sm">
          <div className="p-4 border-b bg-muted/20 flex gap-4 items-center">
            <div className="pt-1">
              <input 
                type="checkbox" 
                onChange={selectAllVisible}
                className="w-5 h-5 accent-primary cursor-pointer"
                title="Select All Visible"
              />
            </div>
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Cari teks soal (Server-side)..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Badge variant="secondary" className="text-xs px-3 py-1.5">{questionsList.length} di Halaman</Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {loading && questionsList.length === 0 ? (
               <div className="text-center p-8 text-muted-foreground animate-pulse">Memuat database...</div>
            ) : questionsList.length === 0 ? (
               <div className="text-center p-8 text-muted-foreground">Tidak ada soal yang ditemukan.</div>
            ) : (
              questionsList.map((q, idx) => (
                <div key={q.id} className={`flex gap-3 p-3 border rounded-lg transition-all ${selectedIds.includes(q.id) ? 'bg-primary/5 border-primary/40 shadow-sm' : 'hover:bg-muted/30'}`}>
                  <div className="pt-0.5">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(q.id)} 
                      onChange={() => toggleSelection(q.id)} 
                      className="w-4 h-4 accent-primary cursor-pointer"
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
                    <div className="text-xs font-serif text-muted-foreground bg-muted/10 p-2 rounded-md border border-dashed line-clamp-2">
                      {extractText(q.body)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t bg-muted/20 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Hal {currentPage} (Total {totalQuestions} soal)</span>
              <span className="text-muted/50">|</span>
              <label className="flex items-center gap-1">
                Tampilkan
                <select 
                  className="bg-background border rounded px-1 py-0.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </label>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4 mr-1"/> Prev</Button>
              <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage * itemsPerPage >= totalQuestions}>Next <ChevronRight className="w-4 h-4 ml-1"/></Button>
            </div>
          </div>
        </div>

        {/* RIGHT PANE (40%): CONTROL PANEL */}
        <div className="lg:w-[40%] flex flex-col gap-4">
          
          {/* STATISTICS */}
          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold flex items-center gap-2 mb-4"><BarChart className="w-5 h-5 text-primary"/> Statistik Kueri</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/20 p-4 rounded-lg border text-center">
                <span className="block text-3xl font-black text-primary">{totalQuestions}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1 block">Total Terfilter</span>
              </div>
              <div className="bg-primary/5 border-primary/20 p-4 rounded-lg border text-center">
                <span className="block text-3xl font-black text-primary">{selectedIds.length}</span>
                <span className="text-[10px] text-primary/70 uppercase tracking-widest font-bold mt-1 block">Soal Dipilih</span>
              </div>
            </div>
          </div>

          {/* FILTER DATABASE */}
          <div className="bg-card border rounded-xl p-5 shadow-sm flex flex-col gap-3">
            <h3 className="font-bold flex items-center gap-2"><Filter className="w-5 h-5 text-primary"/> Filter Taksonomi</h3>
            <Button variant="outline" className="w-full justify-between" onClick={() => setFilterModalOpen(true)}>
              <span>⚙️ Atur Filter Taksonomi</span>
              <ChevronRight className="w-4 h-4 opacity-50"/>
            </Button>
            
            {/* Active Pills */}
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(filterLabels).flatMap(([cat, vals]) => 
                (vals as string[]).map(val => (
                  <Badge key={`${cat}-${val}`} variant="secondary" className="flex items-center gap-1 text-[10px] pr-1 border-primary/20 bg-primary/5 text-primary">
                    <span className="capitalize">{val}</span>
                    <button onClick={() => removeFilterLabel(cat, val)} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3"/></button>
                  </Badge>
                ))
              )}
              {Object.values(filterLabels).every(arr => arr.length === 0) && (
                <span className="text-xs text-muted-foreground italic">Belum ada filter aktif.</span>
              )}
            </div>
          </div>

          {/* BULK ACTION */}
          <div className="bg-card border rounded-xl p-5 shadow-sm flex flex-col gap-3">
            <h3 className="font-bold flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary"/> Bulk Labeling</h3>
            <Button 
              className="w-full font-bold shadow-md shadow-primary/20 flex items-center justify-between" 
              disabled={selectedIds.length === 0}
              onClick={() => setBulkModalOpen(true)}
            >
              <span>🏷️ Injeksi Label Massal</span>
              <Badge variant="secondary" className="bg-white/20 text-white">{selectedIds.length} terpilih</Badge>
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">Menambahkan label ke seluruh soal yang Anda centang sekaligus.</p>
          </div>
        </div>
      </div>

      {/* FILTER MODAL */}
      {filterModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b bg-muted/20">
              <h3 className="font-bold flex items-center gap-2"><Filter className="w-4 h-4 text-primary"/> Atur Filter Database</h3>
              <Button variant="ghost" size="icon" onClick={() => setFilterModalOpen(false)}><X className="w-4 h-4"/></Button>
            </div>
            <div className="p-4 bg-background max-h-[60vh] overflow-y-auto custom-scrollbar">
              <LabelSelector selectedLabels={filterLabels as any} onChange={setFilterLabels as any} />
            </div>
            <div className="p-4 border-t bg-muted/10 flex justify-end">
              <Button onClick={() => setFilterModalOpen(false)} className="font-bold px-8">Terapkan Filter</Button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* BULK ACTION MODAL */}
      {bulkModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-primary/30 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b bg-primary/5">
              <h3 className="font-bold flex items-center gap-2 text-primary"><ShoppingCart className="w-4 h-4"/> Injeksi Label Massal</h3>
              <Button variant="ghost" size="icon" onClick={() => setBulkModalOpen(false)}><X className="w-4 h-4"/></Button>
            </div>
            <div className="p-4 bg-background max-h-[60vh] overflow-y-auto custom-scrollbar">
              <p className="text-sm font-medium mb-4 text-muted-foreground text-center">Pilih label yang ingin disuntikkan ke <strong className="text-primary">{selectedIds.length} soal</strong>.</p>
              <LabelSelector selectedLabels={bulkLabels as any} onChange={setBulkLabels as any} />
            </div>
            <div className="p-4 border-t bg-muted/10 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setBulkModalOpen(false)}>Batal</Button>
              <Button 
                className="font-bold px-8 shadow-md"
                disabled={loading || (bulkLabels.difficulty.length === 0 && bulkLabels.subject.length === 0 && bulkLabels.ageRange.length === 0)}
                onClick={() => {
                  handleBulkApplyLabels(bulkLabels as any);
                  setBulkModalOpen(false);
                }}
              >
                {loading ? 'Menyimpan...' : 'Eksekusi Injeksi'}
              </Button>
            </div>
          </div>
        </div>
      , document.body)}

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
