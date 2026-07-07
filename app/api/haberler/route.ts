export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Kategori, NewsStatus } from '@prisma/client';
import { ROLE_KATEGORI_MAP } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get('kategori');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '12');
    const status = searchParams.get('status');

    const where: any = { status: 'PUBLISHED' };

    if (kategori && Object.values(Kategori).includes(kategori as Kategori)) {
      where.kategori = kategori;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (status && userRole === 'ADMIN') {
      where.status = status;
    }

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, role: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { publishedAt: { sort: 'desc', nulls: 'last' } },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.news.count({ where }),
    ]);

    return NextResponse.json({
      news,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Haberler yüklenemedi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;

    const allowedRoles = ['ADMIN', 'CORRESPONDENT_ACADEMIC', 'CORRESPONDENT_MUSEUM', 'CORRESPONDENT_EXPERT', 'EDITOR'];
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Haber ekleme yetkiniz bulunmamaktadır' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, summary, imageUrl, kategori } = body ?? {};

    if (!title || !content || !kategori) {
      return NextResponse.json({ error: 'Başlık, içerik ve kategori zorunludur' }, { status: 400 });
    }

    const allowedKategoris = ROLE_KATEGORI_MAP[userRole] || [];
    if (userRole !== 'ADMIN' && !allowedKategoris.includes(kategori as Kategori)) {
      return NextResponse.json(
        { error: 'Sadece kendi kategorinize haber ekleyebilirsiniz' },
        { status: 403 }
      );
    }

    const news = await prisma.news.create({
      data: {
        title,
        content,
        summary: summary ?? null,
        imageUrl: imageUrl ?? null,
        kategori,
        status: 'DRAFT',
        authorId: userId,
        submittedAt: null,
      },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json(news, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Haber eklenemedi' }, { status: 500 });
  }
}
