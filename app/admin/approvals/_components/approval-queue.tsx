'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate';
import { KATEGORI_LABELS, NEWS_STATUS_LABELS } from '@/lib/constants';
import { ArrowLeft, AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ApprovalItem {
  id: string;
  title: string;
  content: string;
  kategori: string;
  status: string;
  author: { name: string; organization?: string };
  _count: { comments: number };
}

export function ApprovalQueueClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [approveComment, setApproveComment] = useState('');
  const [rejectComment, setRejectComment] = useState('');

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (userRole && !['ADMIN', 'EDITOR'].includes(userRole)) {
      router.push('/');
      return;
    }
  }, [userRole, router]);

  const fetchApprovals = useCallback(async () => {
    if (!session?.user) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/approvals');
      const data = await res.json().catch(() => ({ news: [] }));
      setApprovals(data?.news || []);
    } catch (err: any) {
      setError('Haberler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    if (session?.user) {
      fetchApprovals();
    }
  }, [session?.user, fetchApprovals]);

  const handleApprove = async (newsId: string) => {
    try {
      const res = await fetch(`/api/approvals/${newsId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED', comment: approveComment }),
      });

      if (res.ok) {
        toast.success('Haber onaylandı');
        setApproveComment('');
        setSelectedId(null);
        fetchApprovals();
      } else {
        toast.error('Onay işlemi başarısız oldu');
      }
    } catch {
      toast.error('Hata oluştu');
    }
  };

  const handleReject = async (newsId: string) => {
    try {
      const res = await fetch(`/api/approvals/${newsId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', comment: rejectComment }),
      });

      if (res.ok) {
        toast.success('Haber reddedildi');
        setRejectComment('');
        setSelectedId(null);
        fetchApprovals();
      } else {
        toast.error('Reddetme işlemi başarısız oldu');
      }
    } catch {
      toast.error('Hata oluştu');
    }
  };

  if (status === 'loading') {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Yükleniyor...</div>;
  }

  if (!session?.user || !['ADMIN', 'EDITOR'].includes(userRole)) {
    return (
      <div className="mx-auto max-w-[600px] px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h2 className="font-display text-xl font-semibold mb-2">Erişim Reddedildi</h2>
        <Link href="/">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Ana Sayfa</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px] px-4 sm:px-6 py-8">
      <FadeIn>
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Panele Dön
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold tracking-tight">Onay Kuyruğu</h1>
          <p className="text-muted-foreground mt-2">Yayın için beklayan haberleri inceleyin ve onaylayın</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            <span className="ml-3 text-muted-foreground">Haberler yükleniyor...</span>
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
        ) : approvals.length === 0 ? (
          <FadeIn>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600/50 mb-4" />
                  <h3 className="font-display text-lg font-semibold mb-2">Tüm Haberler Onaylandı</h3>
                  <p className="text-sm text-muted-foreground">
                    Şu anda onay bekleyen haber bulunmamaktadır.
                  </p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ) : (
          <Stagger staggerDelay={0.05}>
            <div className="space-y-4">
              {approvals.map((item) => (
                <StaggerItem key={item.id}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="line-clamp-2 text-lg">{item.title}</CardTitle>
                          <CardDescription className="mt-2">
                            <div className="space-y-1">
                              <p><strong>Kategori:</strong> {KATEGORI_LABELS[item.kategori as keyof typeof KATEGORI_LABELS]}</p>
                              <p><strong>Muhabir:</strong> {item.author.name} {item.author.organization && `(${item.author.organization})`}</p>
                            </div>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm line-clamp-3">{item.content}</p>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Dialog open={selectedId === `${item.id}-approve`} onOpenChange={(open) => {
                          if (!open) setSelectedId(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => setSelectedId(`${item.id}-approve`)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" /> Onayla
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Haberi Onayla</DialogTitle>
                              <DialogDescription>
                                Bu haberi onaylamak üzeresiniz. İsteğe bağlı olarak bir not ekleyebilirsiniz.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Not (opsiyonel)"
                                value={approveComment}
                                onChange={(e) => setApproveComment(e.target.value)}
                                className="min-h-[100px]"
                              />
                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setSelectedId(null)}>
                                  İptal
                                </Button>
                                <Button
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleApprove(item.id)}
                                >
                                  Onayla
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog open={selectedId === `${item.id}-reject`} onOpenChange={(open) => {
                          if (!open) setSelectedId(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setSelectedId(`${item.id}-reject`)}
                            >
                              <XCircle className="h-4 w-4 mr-2" /> Reddet
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Haberi Reddet</DialogTitle>
                              <DialogDescription>
                                Haberi reddetmek için lütfen nedeni belirtin.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Reddetme nedeni (zorunlu)"
                                value={rejectComment}
                                onChange={(e) => setRejectComment(e.target.value)}
                                className="min-h-[100px]"
                                required
                              />
                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setSelectedId(null)}>
                                  İptal
                                </Button>
                                <Button
                                  className="bg-destructive hover:bg-destructive/90 text-white"
                                  onClick={() => handleReject(item.id)}
                                  disabled={!rejectComment.trim()}
                                >
                                  Reddet
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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
