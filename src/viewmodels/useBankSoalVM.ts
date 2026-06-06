import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { QuestionRow } from '@/lib/types';
import { parseMarkdown } from '@/lib/parser';
import type { Question } from '@/lib/types';

export function useBankSoalVM() {
  const [questionsList, setQuestionsList] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const ITEMS_PER_PAGE = 20;

  // Filtering (Server-Side)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLabels, setFilterLabels] = useState<{ difficulty: string[], ageRange: string[], subject: string[] }>({
    difficulty: [],
    ageRange: [],
    subject: []
  });
  
  // Selection Cart
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Import Flow
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [parsedImport, setParsedImport] = useState<Question[]>([]);
  const [activeImportIdx, setActiveImportIdx] = useState<number | null>(null);

  const loadQuestions = useCallback(async (page: number = 1) => {
    setLoading(true);
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from('questions')
      .select('*', { count: 'exact' });

    // Apply Filters
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

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;
      
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      if (data) setQuestionsList(data);
      if (count !== null) setTotalQuestions(count);
      setCurrentPage(page);
    }
  }, []);

  useEffect(() => {
    loadQuestions(1);
  }, [loadQuestions, searchTerm, filterLabels]);

  const handleNextPage = () => {
    if (currentPage * ITEMS_PER_PAGE < totalQuestions) loadQuestions(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) loadQuestions(currentPage - 1);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = questionsList.map(q => q.id);
    const allSelected = visibleIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => {
        const newSet = new Set([...prev, ...visibleIds]);
        return Array.from(newSet);
      });
    }
  };

  const handleParseImport = () => {
    try {
      const q = parseMarkdown(importText);
      setParsedImport(q);
    } catch (e: any) {
      setErrorMsg('Gagal parsing markdown: ' + e.message);
    }
  };

  const handleCommitImport = async () => {
    if (parsedImport.length === 0) return;
    setLoading(true);
    
    const rowsToInsert = parsedImport.map(q => {
      const labelObj: Record<string, string[]> = {};
      if (q.labels) {
        q.labels.forEach(l => {
          const parts = l.split('=');
          if (parts.length === 2) {
            const key = parts[0].trim();
            const val = parts[1].trim();
            if (!labelObj[key]) labelObj[key] = [];
            if (!labelObj[key].includes(val)) labelObj[key].push(val);
          }
        });
      }
      
      // Need to stringify the markdown body
      // We will just store the original markdown for the body part? 
      // The parser extracts contentblocks. To store as string we can JSON stringify the ContentBlocks.
      // But type QuestionRow says `body: string; // Markdown specific to this question`.
      // Actually let's store it as JSON stringified blocks since our UI renderer consumes ContentBlocks.
      return {
        body: JSON.stringify(q.body),
        type: q.type,
        labels: labelObj,
      };
    });

    const { error } = await supabase.from('questions').insert(rowsToInsert);
    setLoading(false);
    
    if (error) {
      setErrorMsg(error.message);
    } else {
      setImportModalOpen(false);
      setImportText('');
      setParsedImport([]);
      setActiveImportIdx(null);
      loadQuestions(1);
    }
  };

  const handleUpdateImportLabel = (idx: number, newLabels: any) => {
    setParsedImport(prev => {
      const copy = [...prev];
      const flatLabels: string[] = [];
      Object.entries(newLabels).forEach(([key, arr]) => {
        (arr as string[]).forEach(val => flatLabels.push(`${key}=${val}`));
      });
      copy[idx] = { ...copy[idx], labels: flatLabels };
      return copy;
    });
  };

  const handleBulkApplyLabels = async (labelObj: Record<string, string[]>) => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    
    // Simplistic bulk update: we update the 'labels' field for all selected IDs
    // Since Supabase doesn't easily support bulk jsonb merge in js client without RPC, 
    // we'll fetch them, merge locally, and update one by one or in a batch if supported.
    const toUpdate = questionsList.filter(q => selectedIds.includes(q.id));
    
    for (const q of toUpdate) {
      const newLabels = { ...q.labels };
      for (const [key, vals] of Object.entries(labelObj)) {
        if (!newLabels[key]) newLabels[key] = [];
        vals.forEach(v => {
          if (!newLabels[key].includes(v)) newLabels[key].push(v);
        });
      }
      await supabase.from('questions').update({ labels: newLabels }).eq('id', q.id);
    }
    
    setLoading(false);
    setSelectedIds([]); // Clear cart
    loadQuestions(currentPage);
  };

  return {
    questionsList,
    loading,
    errorMsg, setErrorMsg,
    currentPage, totalQuestions, ITEMS_PER_PAGE,
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
  };
}
