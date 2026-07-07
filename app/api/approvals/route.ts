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

    const userRole = (session.user as any)?.role;
    
    if (!['ADMIN', 'EDITOR'].includes(userRole)) {
      return NextResponse.json({ error: 'Bu sayfaya erişim yetkiniz yok' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '20');

    const where: any = { newsApprovals: { some: {} } };
    if (status) {
      where.newsApprovals.some.status = status;
    }

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where: {
          status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
        },
        include: {
          author: { select: { id: true, name: true, organization: true } },
          newsApprovals: {
            include: {
              editor: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.news.count({
        where: {
          status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
        },
      }),
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
