'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { YorumBolumu } from '@/components/yorum-bolumu';
import { FadeIn, SlideIn } from '@/components/ui/animate';
import { KATEGORI_LABELS, KATEGORI_COLORS, ROLE_LABELS } from '@/lib/constants';
import {
  ArrowLeft, Calendar, User, Loader2, AlertCircle,
  Trash2, Edit, Share2
} from 'lucide-react';
import { toast } from 'sonner';

interface NewsDetail {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  imageUrl: string | null;
  kategori: string;
  createdAt: string;
  author: { id: string; name: string; role: string };
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: { id: string; name: string; role: string };
  }>;
}

export function HaberDetayClient({ id }: { id: string }) {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = (session?.user as any)?.id;
  const userRole = (session?.user as any)?.role;
  const isAuthor = userId === news?.author?.id;
  const isAdmin = userRole === 'ADMIN';

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`/api/haberler/${id}`);
        if (!res.ok) {
          setError('Haber bulunamadı');
          return;
        }
        const data = await res.json().catch(() => null);
        setNews(data);
      } catch (err: any) {
        setError('Haber yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchNews();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Bu haberi silmek istediğinizden emin misiniz?')) return;
    try {
      const res = await fetch(`/api/haberler/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Haber silindi');
        router.replace('/');
      } else {
        toast.error('Haber silinemedi');
      }
    } catch (err: any) {
      toast.error('Haber silinirken bir hata oluştu');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator?.share) {
        await navigator.share({
          title: news?.title ?? 'ArkeoJournal',
          url: window?.location?.href,
        });
      } else {
        await navigator?.clipboard?.writeText?.(window?.location?.href);
        toast.success('Bağlantı kopyalandı');
      }
    } catch (err: any) {
      // User cancelled sharing
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        <span className="ml-3 text-muted-foreground">Yükleniyor...</span>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="mx-auto max-w-[800px] px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h2 className="font-display text-xl font-semibold mb-2">{error || 'Haber bulunamadı'}</h2>
        <Link href="/">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Ana Sayfaya Dön
          </Button>
        </Link>
      </div>
    );
  }

  const kategoriKey = news.kategori as keyof typeof KATEGORI_LABELS;
  const colors = KATEGORI_COLORS[kategoriKey] ?? { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };

  return (
    <article className="mx-auto max-w-[800px] px-4 sm:px-6 py-8">
      <FadeIn>
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Tüm Haberler
          </Button>
        </Link>

        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={`${colors.bg} ${colors.text} ${colors.border}`}>
            {KATEGORI_LABELS[kategoriKey] ?? news.kategori}
          </Badge>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(news.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          {news.title}
        </h1>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <User className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{news.author?.name}</p>
              <p className="text-xs text-muted-foreground">
                {ROLE_LABELS[news.author?.role as keyof typeof ROLE_LABELS] ?? 'Kullanıcı'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleShare} title="Paylaş">
              <Share2 className="h-4 w-4" />
            </Button>
            {(isAuthor || isAdmin) && (
              <>
                <Link href={`/haber/duzenle/${news.id}`}>
                  <Button variant="outline" size="icon" title="Düzenle">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="icon" onClick={handleDelete} title="Sil" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {news.imageUrl && (
          <div className="relative aspect-video mb-8 rounded-lg overflow-hidden bg-muted">
            <Image
              src={news.imageUrl}
              alt={news.title ?? 'Haber görseli'}
              fill
              className="object-cover"
              onError={(e: any) => { if (e?.target) e.target.style.display = 'none'; }}
            />
          </div>
        )}
      </FadeIn>

      <SlideIn from="bottom">
        <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
          {(news.content ?? '').split('\n').map((paragraph: string, i: number) => (
            <p key={i} className="text-foreground/90 leading-relaxed mb-4">{paragraph}</p>
          ))}
        </div>
      </SlideIn>

      <SlideIn from="bottom" delay={0.2}>
        <YorumBolumu newsId={news.id} initialComments={news.comments ?? []} />
      </SlideIn>
    </article>
  );
}
