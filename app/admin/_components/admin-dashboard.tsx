'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/animate';
import { AlertCircle, CheckCircle, Clock, XCircle, Users, FileText } from 'lucide-react';

interface DashboardStats {
  pendingApprovals: number;
  approvedToday: number;
  totalUsers: number;
  publishedNews: number;
}

export function AdminDashboardClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    pendingApprovals: 0,
    approvedToday: 0,
    totalUsers: 0,
    publishedNews: 0,
  });
  const [loading, setLoading] = useState(true);

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      router.push('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const [approvalsRes, newsRes, usersRes] = await Promise.all([
          fetch('/api/approvals'),
          fetch('/api/haberler?status=PUBLISHED'),
          fetch('/api/users'),
        ]);

        const approvalsData = await approvalsRes.json().catch(() => ({ total: 0 }));
        const newsData = await newsRes.json().catch(() => ({ total: 0 }));
        const usersData = await usersRes.json().catch(() => ({ total: 0 }));

        setStats({
          pendingApprovals: approvalsData?.total || 0,
          approvedToday: 0,
          totalUsers: usersData?.total || 0,
          publishedNews: newsData?.total || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userRole, router]);

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Yükleniyor...</div>;
  }

  if (!session?.user || !['ADMIN', 'EDITOR'].includes(userRole)) {
    return (
      <div className="mx-auto max-w-[600px] px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h2 className="font-display text-xl font-semibold mb-2">Erişim Reddedildi</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Bu sayfaya erişim için yönetici veya editör rolüne sahip olmanız gerekmektedir.
        </p>
        <Link href="/">
          <Button>Ana Sayfa</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
      <FadeIn>
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold tracking-tight">Yönetici Paneli</h1>
          <p className="text-muted-foreground mt-2">Sistem yönetimi ve haber onay işlemleri</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Beklemede
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingApprovals}</div>
              <p className="text-xs text-muted-foreground mt-1">Onay bekleyen haber</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Yayında
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.publishedNews}</div>
              <p className="text-xs text-muted-foreground mt-1">Yayınlanan haber</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Kullanıcılar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Toplam kullanıcı</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Yapı Sürümü
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2.0</div>
              <p className="text-xs text-muted-foreground mt-1">Editorial Workflow</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                Haber Onay Sistemi
              </CardTitle>
              <CardDescription>Gönderilen haberleri inceleyip onaylayın</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Muhabirler tarafından gönderilen haberleri inceleyip onaylayabilir, gerekirse reddetebilirsiniz.
              </p>
              <Link href="/admin/approvals">
                <Button className="w-full">Onay Kuyruğuna Git</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Kullanıcı Yönetimi
              </CardTitle>
              <CardDescription>Sistem kullanıcılarını yönetin</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Kullanıcı rollerini atayın, kuruluş bilgilerini güncelleyin, erişim kontrol edin.
              </p>
              <Link href="/admin/users">
                <Button className="w-full">Kullanıcıları Yönet</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </FadeIn>
    </div>
  );
}
