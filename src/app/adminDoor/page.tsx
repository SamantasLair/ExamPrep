'use client';

import { useState, FormEvent, useEffect } from 'react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginAdminAction, checkAdminAuthAction } from '@/app/actions';

export default function AdminDoorPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check session on mount
    checkAdminAuthAction().then((isAuth) => {
      if (isAuth) setIsAuthenticated(true);
    });
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await loginAdminAction(password);
    if (success) {
      setError(false);
      setIsAuthenticated(true);
      // Optional: keep it in storage if you want it to persist for other client stuff,
      // but cookies handle the main auth. We can store it temporarily for Supabase inserts later.
      localStorage.setItem('temp_admin_pass', password);
    } else {
      setError(true);
      setPassword('');
    }
    setLoading(false);
  };

  if (!isMounted) return null;

  if (isAuthenticated) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-md animate-fade-in">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-primary">Admin Access</CardTitle>
          <CardDescription>Masukkan sandi untuk mengakses dashboard ExaPrep.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Kata sandi..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {error && <p className="text-xs text-destructive">Kredensial tidak valid.</p>}
            </div>
            <Button type="submit" className="w-full font-medium" disabled={loading}>
              {loading ? 'Memeriksa...' : 'Masuk'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button variant="link" size="sm" onClick={() => window.location.href = '/'} className="text-xs text-muted-foreground">
              Kembali ke Beranda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
