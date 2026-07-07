'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/animate';
import { ArrowLeft, AlertCircle, Edit, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export function HaberDuzenleClient({ id }: { id: string }) {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`/api/haberler/${id}`);
        const data = await res.json().catch(() => null);
        if (data && !data?.error) {
          setTitle(data?.title ?? '');
          setContent(data?.content ?? '');
          setSummary(data?.summary ?? '');
          setImageUrl(data?.imageUrl ?? '');
        }
      } catch (err: any) {
        setError('Haber yüklenemedi');
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchNews();
  }, [id]);

  if (status === 'loading' || fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/haberler/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          summary: summary.trim() || null,
          imageUrl: imageUrl.trim() || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? 'Haber güncellenemedi');
        return;
      }

      toast.success('Haber güncellendi');
      router.replace(`/haber/${id}`);
    } catch (err: any) {
      setError('Haber güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[800px] px-4 sm:px-6 py-8">
      <FadeIn>
        <Link href={`/haber/${id}`}>
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Geri
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Edit className="h-5 w-5 text-amber-600" />
              Haberi Düzenle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Başlık</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e?.target?.value ?? '')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Özet</Label>
                <Input
                  id="summary"
                  value={summary}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSummary(e?.target?.value ?? '')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Görsel URL</Label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageUrl(e?.target?.value ?? '')}
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
                  {loading ? 'Güncelleniyor...' : 'Güncelle'}
                </Button>
                <Link href={`/haber/${id}`}>
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
