'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/animate';
import { Landmark, Mail, Lock, User, AlertCircle, Info } from 'lucide-react';
import { ROLE_LABELS } from '@/lib/constants';

const ROLES = [
  { value: 'KULLANICI', label: 'Normal Kullanıcı / Öğrenci', requiresEduGov: false },
  { value: 'KAZI_BASKANI', label: 'Kazı Başkanı', requiresEduGov: true },
  { value: 'OGRETIM_GOREVLISI', label: 'Öğretim Görevlisi', requiresEduGov: true },
  { value: 'MUZE_MUDURU', label: 'Müze Müdürü', requiresEduGov: true },
];

function isEduOrGovEmail(email: string): boolean {
  const domain = (email ?? '').split('@')[1] ?? '';
  const parts = domain.split('.');
  return parts.some((p: string) => p === 'edu' || p === 'gov');
}

export function KayitClient() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('KULLANICI');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedRole = ROLES.find((r: any) => r?.value === role);
  const needsEduGov = selectedRole?.requiresEduGov ?? false;
  const emailValid = !needsEduGov || isEduOrGovEmail(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    setError('');

    if (needsEduGov && !isEduOrGovEmail(email)) {
      setError('Bu rol için .edu veya .gov uzantılı e-posta adresi gereklidir');
      return;
    }

    if ((password ?? '').length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error ?? 'Kayıt işlemi başarısız');
        return;
      }

      // Auto login after signup
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError('Kayıt başarılı ancak giriş yapılamadı. Lütfen giriş sayfasından deneyin.');
      } else {
        router.replace('/');
      }
    } catch (err: any) {
      setError('Kayıt işlemi sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <FadeIn>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Landmark className="h-7 w-7 text-amber-600" />
              <span className="font-display text-2xl font-bold tracking-tight">Arkeo<span className="text-amber-600">Journal</span></span>
            </div>
            <CardTitle className="font-display text-xl">Kayıt Ol</CardTitle>
            <CardDescription>Yeni hesap oluşturun</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e?.target?.value ?? '')}
                    placeholder="Adınız Soyadınız"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e?.target?.value ?? 'KULLANICI')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {ROLES.map((r: any) => (
                    <option key={r?.value} value={r?.value}>{r?.label}</option>
                  ))}
                </select>
                {needsEduGov && (
                  <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 text-xs text-blue-700 dark:text-blue-400">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>Bu rol için .edu veya .gov uzantılı kurumsal e-posta adresi gereklidir.</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e?.target?.value ?? '')}
                    placeholder={needsEduGov ? 'ornek@universite.edu.tr' : 'ornek@email.com'}
                    className={`pl-10 ${needsEduGov && email && !emailValid ? 'border-destructive' : ''}`}
                    required
                  />
                </div>
                {needsEduGov && email && !emailValid && (
                  <p className="text-xs text-destructive">.edu veya .gov uzantılı e-posta adresi gereklidir</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e?.target?.value ?? '')}
                    placeholder="En az 6 karakter"
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                disabled={loading || (needsEduGov && !emailValid)}
              >
                {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Zaten hesabınız var mı?{' '}
                <Link href="/giris" className="text-amber-600 hover:underline font-medium">Giriş yapın</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
