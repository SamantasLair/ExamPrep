import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { QuestionRow } from '@/lib/types';
import { parseMarkdown } from '@/lib/parser';
import type { Question } from '@/lib/types';

export function useBankSoalVM() {
  const [questionsList, setQuestionsList] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Filtering
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection Cart
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Import Flow
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [parsedImport, setParsedImport] = useState<Question[]>([]);
  
  // Danger Zone
  const [dangerAction, setDangerAction] = useState<string | null>(null);
  const [dangerConfirmText, setDangerConfirmText] = useState('');

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('questions').select('*').order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else if (data) {
      setQuestionsList(data);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
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
      loadQuestions();
    }
  };

  const executeWipe = async (action: string) => {
    setLoading(true);
    let err = null;
    if (action === 'WIPE_QUESTIONS') {
      const { error } = await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      err = error;
    } else if (action === 'WIPE_TESTS') {
      const { error } = await supabase.from('tests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      err = error;
    } else if (action === 'WIPE_ATTEMPTS') {
      const { error } = await supabase.from('attempts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      err = error;
    } else if (action === 'WIPE_STUDENTS') {
      const { error } = await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      err = error;
    } else if (action === 'WIPE_ALL') {
      await supabase.from('attempts').delete().neq('id', '0');
      await supabase.from('tests').delete().neq('id', '0');
      await supabase.from('questions').delete().neq('id', '0');
      await supabase.from('students').delete().neq('id', '0');
    }

    setLoading(false);
    if (err) {
      setErrorMsg(err.message);
    } else {
      setDangerAction(null);
      setDangerConfirmText('');
      loadQuestions();
    }
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
    loadQuestions();
  };

  return {
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
  };
}
