export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;

    const news = await prisma.news.findUnique({
      where: { id: params?.id },
      include: {
        author: { select: { id: true, name: true, role: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        newsApprovals: userRole === 'ADMIN' || userRole === 'EDITOR' ? true : false,
      },
    });

    if (!news) {
      return NextResponse.json({ error: 'Haber bulunamadı' }, { status: 404 });
    }

    if (news.status !== 'PUBLISHED' && news.authorId !== userId && !['ADMIN', 'EDITOR'].includes(userRole)) {
      return NextResponse.json({ error: 'Bu haberi görüntüleme yetkiniz yok' }, { status: 403 });
    }

    return NextResponse.json(news);
  } catch (error: any) {
    return NextResponse.json({ error: 'Haber yüklenemedi' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;
    const userRole = (session.user as any)?.role;

    const existingNews = await prisma.news.findUnique({ where: { id: params?.id } });
    if (!existingNews) {
      return NextResponse.json({ error: 'Haber bulunamadı' }, { status: 404 });
    }

    if (existingNews.authorId !== userId && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Bu haberi düzenleme yetkiniz yok' }, { status: 403 });
    }

    if (!['DRAFT', 'REJECTED'].includes(existingNews.status)) {
      return NextResponse.json({ error: 'Sadece taslak veya reddedilen haberleri düzenleyebilirsiniz' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, summary, imageUrl } = body ?? {};

    const updated = await prisma.news.update({
      where: { id: params?.id },
      data: {
        ...(title ? { title } : {}),
        ...(content ? { content } : {}),
        summary: summary ?? existingNews.summary,
        imageUrl: imageUrl ?? existingNews.imageUrl,
      },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: 'Haber güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;
    const userRole = (session.user as any)?.role;

    const existingNews = await prisma.news.findUnique({ where: { id: params?.id } });
    if (!existingNews) {
      return NextResponse.json({ error: 'Haber bulunamadı' }, { status: 404 });
    }

    if (existingNews.authorId !== userId && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Bu haberi silme yetkiniz yok' }, { status: 403 });
    }

    if (!['DRAFT', 'REJECTED'].includes(existingNews.status)) {
      return NextResponse.json({ error: 'Sadece taslak veya reddedilen haberleri silebilirsiniz' }, { status: 403 });
    }

    await prisma.news.delete({ where: { id: params?.id } });
    return NextResponse.json({ message: 'Haber silindi' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Haber silinemedi' }, { status: 500 });
  }
}
