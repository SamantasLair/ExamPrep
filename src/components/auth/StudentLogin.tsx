'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { StudentRow } from '@/lib/types';
import { User } from 'lucide-react';

interface StudentLoginProps {
  onLogin: (student: StudentRow) => void;
}

export function StudentLogin({ onLogin }: StudentLoginProps) {
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) return;
    setLoading(true);
    setError('');

    const { data, error: dbErr } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId.trim())
      .single();

    if (dbErr || !data) {
      setError('ID Siswa tidak ditemukan atau belum terdaftar.');
      setLoading(false);
      return;
    }

    onLogin(data as StudentRow);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4 relative overflow-hidden">
      {/* Decorative blobs following Disney's anticipation principle */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }} 
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 0] }} 
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-20 -right-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" 
      />

      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-full max-w-sm bg-card p-8 rounded-3xl shadow-xl border text-center z-10"
      >
        <motion.div 
          initial={{ y: -20, scale: 0 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
          whileHover={{ scale: 1.1, rotate: 10 }}
          className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary cursor-default"
        >
          <User className="w-10 h-10" />
        </motion.div>
        
        <h1 className="text-2xl font-black mb-2 tracking-tight">Portal Siswa</h1>
        <p className="text-sm text-muted-foreground mb-8 font-medium">Masukkan ID Siswa Anda untuk memulai sesi.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Input 
              placeholder="Contoh: EXA-001" 
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.toUpperCase())}
              className="text-center font-mono text-xl uppercase h-14 rounded-2xl border-2 focus-visible:ring-offset-2 transition-all"
              disabled={loading}
              autoComplete="off"
            />
            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="text-xs text-destructive mt-2 font-bold"
              >
                {error}
              </motion.p>
            )}
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
            <Button type="submit" className="w-full h-14 text-lg rounded-2xl font-bold" disabled={loading}>
              {loading ? 'Mencocokkan...' : 'Masuk Sekarang'}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
