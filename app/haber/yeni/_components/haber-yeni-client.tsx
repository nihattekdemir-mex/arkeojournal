'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/animate';
import { KATEGORI_LABELS, ROLE_KATEGORI_MAP, NEWS_STATUS_LABELS } from '@/lib/constants';
import { PenSquare, ArrowLeft, AlertCircle, ImageIcon, Info } from 'lucide-react';
import { toast } from 'sonner';

export function HaberYeniClient() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [kategori, setKategori] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const userRole = (session?.user as any)?.role;

  if (status === 'loading') {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Yükleniyor...</div>;
  }

  if (!session?.user || !['CORRESPONDENT_ACADEMIC', 'CORRESPONDENT_MUSEUM', 'CORRESPONDENT_EXPERT', 'ADMIN', 'EDITOR'].includes(userRole)) {
    return (
      <div className="mx-auto max-w-[600px] px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h2 className="font-display text-xl font-semibold mb-2">Yetki Gerekli</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Haber eklemek için muhabir rolüne sahip olmanız gerekmektedir.
        </p>
        <Link href="/">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Ana Sayfa</Button>
        </Link>
      </div>
    );
  }

  const allowedKategoris = ROLE_KATEGORI_MAP[userRole] || [];
  const availableKategoriler = Object.fromEntries(
    Object.entries(KATEGORI_LABELS).filter(([key]) => allowedKategoris.length === 0 || allowedKategoris.includes(key as any))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    setError('');

    if (!title.trim() || !content.trim() || !kategori) {
      setError('Başlık, içerik ve kategori zorunludur');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/haberler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          summary: summary.trim() || null,
          imageUrl: imageUrl.trim() || null,
          kategori,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error ?? 'Haber eklenemedi');
        return;
      }

      toast.success('Haber taslak olarak kaydedildi. Yayın sorumlusunun onayı bekleniyor.');
      router.replace(`/my-submissions`);
    } catch (err: any) {
      setError('Haber eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[800px] px-4 sm:px-6 py-8">
      <FadeIn>
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Geri
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <PenSquare className="h-5 w-5 text-amber-600" />
              Yeni Haber Ekle
            </CardTitle>
            <CardDescription>Haberiniz taslak olarak kaydedilir ve yayın sorumlusunun onayı için gönderilir</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Gönderdiğiniz haber {NEWS_STATUS_LABELS['SUBMITTED']} durumunda tutulacak ve yayın sorumlusu tarafından incelenecektir.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="kategori">Kategori</Label>
                <select
                  id="kategori"
                  value={kategori}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setKategori(e?.target?.value ?? '')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="">Kategori seçin</option>
                  {Object.entries(availableKategoriler).map(([key, label]: [string, string]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Başlık</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e?.target?.value ?? '')}
                  placeholder="Haber başlığı"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Özet (opsiyonel)</Label>
                <Input
                  id="summary"
                  value={summary}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSummary(e?.target?.value ?? '')}
                  placeholder="Haberin kısa özeti"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Görsel URL (opsiyonel)</Label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageUrl(e?.target?.value ?? '')}
                    placeholder="https://example.com/image.jpg"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">İçerik</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e?.target?.value ?? '')}
                  placeholder="Haber içeriğini yazın..."
                  className="min-h-[250px]"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  disabled={loading}
                >
                  {loading ? 'Gönderiliyor...' : 'Haberi Gönder'}
                </Button>
                <Link href="/">
                  <Button variant="outline" type="button">İptal</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
