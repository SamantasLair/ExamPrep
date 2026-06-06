import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useBankSoalVM } from '@/viewmodels/useBankSoalVM';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LabelSelector } from '@/components/exam/LabelSelector';
import { Label } from '@/components/ui/label';
import { Search, Database, CheckCircle2, X, ChevronLeft, ChevronRight, Filter, Shuffle } from 'lucide-react';
import type { QuestionRow } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface BankSoalPickerModalProps {
  onClose: () => void;
  onAddSelected: (questions: QuestionRow[]) => void;
}

export function BankSoalPickerModal({ onClose, onAddSelected }: BankSoalPickerModalProps) {
  const {
    questionsList,
    loading,
    errorMsg,
    currentPage, totalQuestions, itemsPerPage,
    handleNextPage, handlePrevPage,
    searchTerm, setSearchTerm,
    filterDate, setFilterDate,
    filterLabels, setFilterLabels,
    selectedIds, toggleSelection, selectAllVisible,
  } = useBankSoalVM();

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [randomCount, setRandomCount] = useState<string>('10');
  const [isRandomizing, setIsRandomizing] = useState(false);

  const handleRandomInject = async () => {
    const count = parseInt(randomCount);
    if (isNaN(count) || count <= 0) return alert('Jumlah soal tidak valid.');
    
    setIsRandomizing(true);
    let query = supabase.from('questions').select('*');

    if (searchTerm.trim()) {
      query = query.ilike('body', `%${searchTerm.trim()}%`);
    }
    if (filterLabels.difficulty.length > 0) {
      query = query.contains('labels', { difficulty: filterLabels.difficulty });
    }
    if (filterLabels.ageRange.length > 0) {
      query = query.contains('labels', { ageRange: filterLabels.ageRange });
    }
    if (filterLabels.subject.length > 0) {
      query = query.contains('labels', { subject: filterLabels.subject });
    }
    if (filterDate) {
      const startOfDay = new Date(`${filterDate}T00:00:00`).toISOString();
      const endOfDay = new Date(`${filterDate}T23:59:59.999`).toISOString();
      query = query.gte('created_at', startOfDay).lte('created_at', endOfDay);
    }

    const { data, error } = await query;
    setIsRandomizing(false);
    
    if (error) {
      return alert('Gagal menarik data untuk acak: ' + error.message);
    }
    if (!data || data.length === 0) {
      return alert('Tidak ada soal yang cocok dengan filter aktif saat ini.');
    }

    const shuffled = [...data].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    onAddSelected(selected);
  };

  const extractText = (bodyStr: string) => {
    try {
      const parsed = JSON.parse(bodyStr);
      if (Array.isArray(parsed)) {
        return parsed.map(p => p.content || '').join(' ').slice(0, 150) + '...';
      }
      return bodyStr.slice(0, 150) + '...';
    } catch {
      return bodyStr.slice(0, 150) + '...';
    }
  };

  const handleAdd = () => {
    const selectedRows = questionsList.filter(q => selectedIds.includes(q.id));
    onAddSelected(selectedRows);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card border shadow-2xl rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 border-b bg-muted/20 gap-4">
          <div>
            <h3 className="font-black text-xl flex items-center gap-2"><Database className="w-5 h-5 text-primary"/> Exam Builder: Bank Soal</h3>
            <p className="text-sm text-muted-foreground mt-1">Pilih soal untuk disuntikkan ke dalam editor ujian Anda.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5"/></Button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b bg-background flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 flex-1 w-full">
            <div className="pt-1">
              <input 
                type="checkbox" 
                onChange={selectAllVisible}
                checked={questionsList.length > 0 && questionsList.every(q => selectedIds.includes(q.id))}
                className="w-5 h-5 accent-primary cursor-pointer"
                title="Select All Visible"
              />
            </div>
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Cari teks soal (Server-side)..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-9 h-10 w-full bg-muted/20 border-border/50 focus-visible:ring-primary/50 transition-all rounded-xl"
              />
            </div>
            <Button variant="outline" onClick={() => setFilterModalOpen(true)} className="h-10 rounded-xl gap-2 font-semibold">
              <Filter className="w-4 h-4" /> 
              Filter
              {(filterLabels.difficulty.length > 0 || filterLabels.ageRange.length > 0 || filterLabels.subject.length > 0 || filterDate) && (
                <Badge variant="default" className="ml-1 px-1.5 h-5 min-w-[20px] rounded-full flex items-center justify-center text-[10px]">Aktif</Badge>
              )}
            </Button>
          </div>
          <div className="flex gap-2 w-full sm:w-auto items-center border-l pl-4 border-border/50">
            <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-xl border border-border/50">
              <Input 
                type="number" 
                value={randomCount} 
                onChange={(e) => setRandomCount(e.target.value)} 
                className="w-16 h-8 text-center font-bold bg-background"
                title="Jumlah soal yang ingin diacak"
              />
              <Button 
                onClick={handleRandomInject} 
                disabled={isRandomizing || totalQuestions === 0} 
                variant="secondary"
                className="h-8 px-4 font-bold text-xs gap-1.5"
              >
                <Shuffle className={`w-3.5 h-3.5 ${isRandomizing ? 'animate-spin' : ''}`} /> 
                {isRandomizing ? 'Mengacak...' : 'Auto-Acak'}
              </Button>
            </div>
            <Button 
              onClick={handleAdd} 
              disabled={selectedIds.length === 0} 
              className="w-full sm:w-auto h-10 px-6 font-black rounded-xl shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90 gap-2 ml-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Masukkan ({selectedIds.length})
            </Button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-muted/5 relative">
          {loading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 font-semibold text-muted-foreground animate-pulse">Menarik Data...</p>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 mb-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl font-medium text-sm">
              Error: {errorMsg}
            </div>
          )}

          {!loading && questionsList.length === 0 && !errorMsg ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Database className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-semibold">Tidak ada soal yang ditemukan.</p>
              <p className="text-sm opacity-70">Ubah filter atau kata kunci pencarian Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questionsList.map(q => {
                const isSelected = selectedIds.includes(q.id);
                return (
                  <div 
                    key={q.id} 
                    className={`flex gap-4 p-4 border rounded-2xl transition-all cursor-pointer hover:shadow-md ${isSelected ? 'bg-primary/5 border-primary/50 ring-1 ring-primary/20' : 'bg-card border-border/50 hover:border-primary/30'}`}
                    onClick={() => toggleSelection(q.id)}
                  >
                    <div className="pt-1">
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        readOnly 
                        className="w-5 h-5 accent-primary pointer-events-none"
                      />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-[10px] font-mono bg-background">{q.type}</Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">{new Date(q.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                      <p className="text-xs text-foreground/80 font-medium leading-relaxed line-clamp-3 mb-3">
                        {extractText(q.body)}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mt-auto">
                        {Object.entries(q.labels || {}).map(([category, values]) => (
                          Array.isArray(values) && values.map(v => (
                            <Badge key={`${category}-${v}`} variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-muted text-muted-foreground">
                              {v}
                            </Badge>
                          ))
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t bg-card flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground font-medium">
          <div className="bg-muted/30 px-3 py-1.5 rounded-lg border border-border/50">
            Menampilkan <strong className="text-foreground">{(currentPage - 1) * itemsPerPage + (questionsList.length > 0 ? 1 : 0)}</strong> - <strong className="text-foreground">{Math.min(currentPage * itemsPerPage, totalQuestions)}</strong> dari <strong className="text-foreground">{totalQuestions}</strong> soal
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1 || loading} className="gap-1 rounded-xl">
              <ChevronLeft className="w-4 h-4"/> Prev
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage * itemsPerPage >= totalQuestions || loading} className="gap-1 rounded-xl">
              Next <ChevronRight className="w-4 h-4"/>
            </Button>
          </div>
        </div>

      </div>

      {/* Filter Modal Sub-Portal */}
      {filterModalOpen && (
        <div className="fixed inset-0 z-[110] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b bg-muted/20">
              <h3 className="font-bold flex items-center gap-2"><Filter className="w-4 h-4 text-primary"/> Atur Filter Bank Soal</h3>
              <Button variant="ghost" size="icon" onClick={() => setFilterModalOpen(false)}><X className="w-4 h-4"/></Button>
            </div>
            <div className="p-4 bg-background max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
              <div className="space-y-2 border-b pb-4">
                <Label className="font-bold text-sm">Filter Tanggal Pembuatan</Label>
                <div className="flex gap-2">
                  <Input 
                    type="date" 
                    value={filterDate} 
                    onChange={(e) => setFilterDate(e.target.value)} 
                    className="w-full bg-muted/20"
                  />
                  {filterDate && (
                    <Button variant="outline" size="icon" onClick={() => setFilterDate('')}>
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
              <LabelSelector selectedLabels={filterLabels as any} onChange={setFilterLabels as any} />
            </div>
            <div className="p-4 border-t bg-muted/10 flex justify-end">
              <Button onClick={() => setFilterModalOpen(false)} className="font-bold px-8">Terapkan Filter</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  , document.body);
}
