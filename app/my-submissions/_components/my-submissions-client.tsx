'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate';
import { KATEGORI_LABELS, NEWS_STATUS_LABELS, NEWS_STATUS_COLORS } from '@/lib/constants';
import { ArrowLeft, AlertCircle, Loader2, Edit2, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface SubmissionItem {
  id: string;
  title: string;
  kategori: string;
  status: string;
  rejectionReason?: string;
  createdAt: string;
  submittedAt?: string;
  author: { name: string };
  _count: { comments: number };
}

export function MySubmissionsClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userRole = (session?.user as any)?.role;

  const fetchSubmissions = useCallback(async () => {
    if (!session?.user) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/my-submissions');
      const data = await res.json().catch(() => []);
      setSubmissions(data || []);
    } catch (err: any) {
      setError('Gönderimler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    if (session?.user) {
      fetchSubmissions();
    }
  }, [session?.user, fetchSubmissions]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Yükleniyor...</div>;
  }

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-[600px] px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h2 className="font-display text-xl font-semibold mb-2">Giriş Gerekli</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Gönderimlerinizi görüntülemek için giriş yapmanız gerekmektedir.
        </p>
        <Link href="/giris">
          <Button>Giriş Yap</Button>
        </Link>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu haberi silmek istediğinize emin misiniz?')) return;

    try {
      const res = await fetch(`/api/haberler/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Haber silindi');
        fetchSubmissions();
      } else {
        toast.error('Silme işlemi başarısız oldu');
      }
    } catch {
      toast.error('Hata oluştu');
    }
  };

  return (
    <div className="mx-auto max-w-[1000px] px-4 sm:px-6 py-8">
      <FadeIn>
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Geri
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold tracking-tight">Gönderimlerim</h1>
          <p className="text-muted-foreground mt-2">Gönderdiğim haberler ve durumları</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            <span className="ml-3 text-muted-foreground">Gönderimler yükleniyor...</span>
          </div>
        ) : error ? (
          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            </CardContent>
          </Card>
        ) : submissions.length === 0 ? (
          <FadeIn>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-display text-lg font-semibold mb-2">Henüz haber göndermediniz</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    İlk haberinizi göndermek için "Yeni Haber Ekle" butonunu kullanın.
                  </p>
                  <Link href="/haber/yeni">
                    <Button>Yeni Haber Ekle</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ) : (
          <Stagger staggerDelay={0.05}>
            <div className="space-y-4">
              {submissions.map((item) => (
                <StaggerItem key={item.id}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="line-clamp-2 text-lg">{item.title}</CardTitle>
                          <CardDescription className="mt-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted">
                                {KATEGORI_LABELS[item.kategori as keyof typeof KATEGORI_LABELS]}
                              </span>
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${NEWS_STATUS_COLORS[item.status as keyof typeof NEWS_STATUS_COLORS]}`}>
                                {NEWS_STATUS_LABELS[item.status as keyof typeof NEWS_STATUS_LABELS]}
                              </span>
                            </div>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {item.rejectionReason && (
                        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                          <p className="text-sm font-medium text-destructive mb-1">Reddetme Nedeni:</p>
                          <p className="text-sm text-destructive">{item.rejectionReason}</p>
                        </div>
                      )}
                      
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <p>Gönderildi: {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('tr-TR') : 'Taslak'}</p>
                        <p>Yorum: {item._count.comments}</p>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/haber/${item.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" /> Görüntüle
                          </Button>
                        </Link>
                        {['DRAFT', 'REJECTED'].includes(item.status) && (
                          <>
                            <Link href={`/haber/duzenle/${item.id}`}>
                              <Button size="sm" variant="outline">
                                <Edit2 className="h-4 w-4 mr-2" /> Düzenle
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Sil
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </div>
          </Stagger>
        )}
      </FadeIn>
    </div>
  );
}
