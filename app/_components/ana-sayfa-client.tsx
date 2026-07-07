'use client';

import { useState, useEffect, useCallback } from 'react';
import { HaberKarti } from '@/components/haber-karti';
import { KategoriFiltre } from '@/components/kategori-filtre';
import { AramaCubugu } from '@/components/arama-cubugu';
import { FadeIn, SlideIn, Stagger, StaggerItem } from '@/components/ui/animate';
import { Landmark, Newspaper, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NewsItem {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  kategori: string;
  imageUrl: string | null;
  createdAt: string;
  author: { name: string; role: string };
  _count: { comments: number };
}

export function AnaSayfaClient() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [kategori, setKategori] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (kategori) params.set('kategori', kategori);
      if (search) params.set('search', search);
      params.set('page', String(page));
      params.set('limit', '12');

      const res = await fetch(`/api/haberler?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      setNews(data?.news ?? []);
      setTotalPages(data?.pages ?? 1);
    } catch (err: any) {
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, [kategori, search, page]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleKategoriChange = (k: string | null) => {
    setKategori(k);
    setPage(1);
  };

  const handleSearch = (q: string) => {
    setSearch(q);
    setPage(1);
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/20 dark:via-background dark:to-background py-16 sm:py-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 text-center">
          <FadeIn>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Landmark className="h-10 w-10 text-amber-600" />
              <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                Arkeo<span className="text-amber-600">Journal</span>
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Arkeoloji dünyasından en güncel haberler, kazı raporları ve müze haberleri.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Filters & Content */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
        <SlideIn from="top">
          <div className="mb-6 space-y-4">
            <AramaCubugu onSearch={handleSearch} />
            <KategoriFiltre selected={kategori} onSelect={handleKategoriChange} />
          </div>
        </SlideIn>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            <span className="ml-3 text-muted-foreground">Haberler yükleniyor...</span>
          </div>
        ) : (news ?? []).length === 0 ? (
          <FadeIn>
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">Haber bulunamadı</h3>
              <p className="text-sm text-muted-foreground">
                {search ? `"${search}" için sonuç bulunamadı.` : 'Henüz haber yayınlanmamış.'}
              </p>
            </div>
          </FadeIn>
        ) : (
          <>
            <Stagger staggerDelay={0.08}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(news ?? []).map((item: NewsItem) => (
                  <StaggerItem key={item?.id}>
                    <HaberKarti
                      id={item?.id}
                      title={item?.title}
                      summary={item?.summary}
                      content={item?.content}
                      kategori={item?.kategori}
                      imageUrl={item?.imageUrl}
                      createdAt={item?.createdAt}
                      author={item?.author}
                      commentCount={item?._count?.comments ?? 0}
                    />
                  </StaggerItem>
                ))}
              </div>
            </Stagger>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                >
                  Önceki
                </Button>
                <span className="text-sm text-muted-foreground">
                  Sayfa {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p: number) => p + 1)}
                >
                  Sonraki
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 py-8 mt-12">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Landmark className="h-5 w-5 text-amber-600" />
            <span className="font-display font-semibold">ArkeoJournal</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Arkeoloji dünyasının güvenilir haber kaynağı
          </p>
        </div>
      </footer>
    </main>
  );
}
