export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }

    const body = await request.json();
    const { role, organization, department } = body ?? {};

    const validRoles = ['ADMIN', 'EDITOR', 'CORRESPONDENT_ACADEMIC', 'CORRESPONDENT_MUSEUM', 'CORRESPONDENT_EXPERT', 'STUDENT', 'GUEST'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Geçersiz rol' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(role && { role }),
        ...(organization && { organization }),
        ...(department && { department }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organization: true,
        department: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Kullanıcı güncellenemiyor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;

    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }

    if (userId === params.id) {
      return NextResponse.json({ error: 'Kendi hesabınızı silemezsiniz' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Kullanıcı başarıyla silindi' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Kullanıcı silinemedi' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;

    if (userRole !== 'ADMIN' && userId !== params.id) {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organization: true,
        department: true,
        createdAt: true,
        _count: {
          select: { news: true, comments: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: 'Kullanıcı bilgileri yüklenemedi' }, { status: 500 });
  }
}
