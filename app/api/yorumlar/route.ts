export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { containsProfanity, getProfanityMessage } from '@/lib/profanity-filter';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Yorum yapmak için giriş yapmanız gerekmektedir' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;
    const body = await request.json();
    const { content, newsId } = body ?? {};

    if (!content || !newsId) {
      return NextResponse.json({ error: 'Yorum içeriği ve haber ID gereklidir' }, { status: 400 });
    }

    if (containsProfanity(content)) {
      return NextResponse.json({ error: getProfanityMessage() }, { status: 400 });
    }

    const news = await prisma.news.findUnique({ where: { id: newsId } });
    if (!news) {
      return NextResponse.json({ error: 'Haber bulunamadı' }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: userId,
        newsId,
      },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Yorum eklenemedi' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;
    const userRole = (session.user as any)?.role;
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id');

    if (!commentId) {
      return NextResponse.json({ error: 'Yorum ID gereklidir' }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 });
    }

    if (comment.authorId !== userId && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Bu yorumu silme yetkiniz yok' }, { status: 403 });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    return NextResponse.json({ message: 'Yorum silindi' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Yorum silinemedi' }, { status: 500 });
  }
}
