export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;

    const news = await prisma.news.findMany({
      where: {
        authorId: userId,
      },
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(news);
  } catch (error: any) {
    return NextResponse.json({ error: 'Gönderimler yüklenemedi' }, { status: 500 });
  }
}
