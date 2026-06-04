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
  ageRange: ['Kelas 1-3', 'Kelas 4-6', 'Kelas 7-9', 'SMA', 'S1'],
  subject: ['Matematika', 'Fisika', 'Biologi', 'Ekonomi Makro', 'Bahasa Inggris', 'Sejarah']
};

interface LabelSelectorProps {
  selectedLabels: LabelTaxonomy;
  onChange: (labels: LabelTaxonomy) => void;
  readOnly?: boolean;
}

export function LabelSelector({ selectedLabels, onChange, readOnly = false }: LabelSelectorProps) {
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

  const renderCategory = (category: keyof LabelTaxonomy, title: string, colorClass: string) => (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase">{title}</p>
      <div className="flex flex-wrap gap-2">
        {PREDEFINED_LABELS[category].map(label => {
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
        {renderCategory('difficulty', 'Tingkat Kesulitan', 'bg-red-500 hover:bg-red-600 text-white border-red-500')}
        {renderCategory('ageRange', 'Range Umur/Kelas', 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500')}
        {renderCategory('subject', 'Mata Pelajaran', 'bg-green-500 hover:bg-green-600 text-white border-green-500')}
      </CardContent>
    </Card>
  );
}
