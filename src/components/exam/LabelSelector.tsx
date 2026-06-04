import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface LabelTaxonomy {
  difficulty: string[];
  ageRange: string[];
  subject: string[];
}

export const PREDEFINED_LABELS: Record<keyof LabelTaxonomy, string[]> = {
  difficulty: ['Olimpiade Internasional', 'OSN', 'Sulit', 'Sedang', 'Mudah'],
  ageRange: ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6', 'Kelas 7', 'Kelas 8', 'Kelas 9', 'Kelas 10', 'Kelas 11', 'Kelas 12', 'S1'],
  subject: [
    'Matematika', 'Fisika', 'Biologi', 'Kimia', 'Ekonomi Makro', 'Ekonomi Mikro',
    'Bahasa Inggris', 'Bahasa Indonesia', 'Sejarah', 'Geografi', 'Sosiologi', 
    'TIK', 'Kewarganegaraan', 'Agama'
  ]
};

interface LabelSelectorProps {
  selectedLabels: LabelTaxonomy;
  onChange: (labels: LabelTaxonomy) => void;
  readOnly?: boolean;
}

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

export function LabelSelector({ selectedLabels, onChange, readOnly = false }: LabelSelectorProps) {
  const [customSubjects, setCustomSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');

  // Load custom subjects from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('exaprep_custom_subjects');
      if (saved) {
        setCustomSubjects(JSON.parse(saved));
      }
    } catch { /* ignore */ }
  }, []);

  const handleAddCustomSubject = (e?: React.FormEvent) => {
    e?.preventDefault();
    const val = newSubject.trim();
    if (!val) return;
    if (PREDEFINED_LABELS.subject.includes(val) || customSubjects.includes(val)) {
       setNewSubject('');
       return;
    }
    const updated = [...customSubjects, val];
    setCustomSubjects(updated);
    localStorage.setItem('exaprep_custom_subjects', JSON.stringify(updated));
    setNewSubject('');
    
    // Automatically select the newly added subject
    toggleLabel('subject', val);
  };

  const toggleLabel = (category: keyof LabelTaxonomy, value: string) => {
    if (readOnly) return;
    
    const current = selectedLabels[category] || [];
    const updated = current.includes(value)
      ? current.filter(l => l !== value)
      : [...current, value];
      
    onChange({
      ...selectedLabels,
      [category]: updated
    });
  };

  const renderCategory = (category: keyof LabelTaxonomy, title: string, colorClass: string, options: string[]) => (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(label => {
          const isSelected = (selectedLabels[category] || []).includes(label);
          return (
            <Badge 
              key={label}
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                "transition-all cursor-pointer",
                !readOnly && "hover:opacity-80",
                isSelected && colorClass,
                readOnly && !isSelected && "hidden" // Only show selected in readonly
              )}
              onClick={() => toggleLabel(category, label)}
            >
              {label}
            </Badge>
          );
        })}
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      {!readOnly && (
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Taxonomi Soal</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn("space-y-4", !readOnly && "pt-0", readOnly && "py-3")}>
        {renderCategory('difficulty', 'Tingkat Kesulitan', 'bg-red-500 hover:bg-red-600 text-white border-red-500', PREDEFINED_LABELS.difficulty)}
        {renderCategory('ageRange', 'Range Umur/Kelas', 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500', PREDEFINED_LABELS.ageRange)}
        {renderCategory('subject', 'Mata Pelajaran', 'bg-green-500 hover:bg-green-600 text-white border-green-500', [...PREDEFINED_LABELS.subject, ...customSubjects])}
        
        {!readOnly && (
           <form onSubmit={handleAddCustomSubject} className="flex items-center gap-2 mt-2 pt-2 border-t border-border/40">
             <Input 
               value={newSubject}
               onChange={(e) => setNewSubject(e.target.value)}
               placeholder="Tambah kustom materi..."
               className="h-7 text-xs bg-muted/20"
             />
             <Button type="submit" size="sm" variant="secondary" className="h-7 px-3 text-xs gap-1 shrink-0">
               <Plus className="w-3 h-3" /> Tambah
             </Button>
           </form>
        )}
      </CardContent>
    </Card>
  );
}
