export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: { newsId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;

    if (!['ADMIN', 'EDITOR'].includes(userRole)) {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }

    const body = await request.json();
    const { status, comment } = body ?? {};

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Geçersiz durum' }, { status: 400 });
    }

    const news = await prisma.news.findUnique({
      where: { id: params.newsId },
      include: { newsApprovals: true },
    });

    if (!news) {
      return NextResponse.json({ error: 'Haber bulunamadı' }, { status: 404 });
    }

    if (!['SUBMITTED', 'UNDER_REVIEW'].includes(news.status)) {
      return NextResponse.json({ error: 'Bu haber artık onay aşamasında değil' }, { status: 400 });
    }

    let approval = news.newsApprovals.find(a => a.editorId === userId);

    if (!approval) {
      approval = await prisma.newsApproval.create({
        data: {
          newsId: params.newsId,
          editorId: userId,
          status,
          comment: comment ?? null,
        },
        include: {
          editor: { select: { id: true, name: true } },
        },
      });
    } else {
      approval = await prisma.newsApproval.update({
        where: { id: approval.id },
        data: {
          status,
          comment: comment ?? null,
        },
        include: {
          editor: { select: { id: true, name: true } },
        },
      });
    }

    if (status === 'APPROVED') {
      await prisma.news.update({
        where: { id: params.newsId },
        data: {
          status: 'APPROVED',
        },
      });
    } else if (status === 'REJECTED') {
      await prisma.news.update({
        where: { id: params.newsId },
        data: {
          status: 'REJECTED',
          rejectionReason: comment ?? null,
        },
      });
    }

    const updatedNews = await prisma.news.findUnique({
      where: { id: params.newsId },
      include: {
        author: { select: { id: true, name: true } },
        newsApprovals: {
          include: {
            editor: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json(updatedNews);
  } catch (error: any) {
    return NextResponse.json({ error: 'Onay işlemi başarısız oldu' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { newsId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;

    const news = await prisma.news.findUnique({
      where: { id: params.newsId },
      include: {
        author: { select: { id: true, name: true } },
        newsApprovals: {
          include: {
            editor: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!news) {
      return NextResponse.json({ error: 'Haber bulunamadı' }, { status: 404 });
    }

    if (news.authorId !== userId && !['ADMIN', 'EDITOR'].includes(userRole)) {
      return NextResponse.json({ error: 'Bu haberi görüntüleme yetkiniz yok' }, { status: 403 });
    }

    return NextResponse.json(news.newsApprovals);
  } catch (error: any) {
    return NextResponse.json({ error: 'Onay kayıtları yüklenemedi' }, { status: 500 });
  }
}
