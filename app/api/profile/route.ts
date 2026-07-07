export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcryptjs from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    return NextResponse.json({ error: 'Profil yüklenemedi' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;
    const body = await request.json();
    const { name, organization, department, newPassword, currentPassword } = body ?? {};

    if (newPassword && !currentPassword) {
      return NextResponse.json(
        { error: 'Yeni şifre için mevcut şifrenizi girin' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    if (newPassword && currentPassword) {
      const passwordMatch = await bcryptjs.compare(currentPassword, user.password);
      if (!passwordMatch) {
        return NextResponse.json(
          { error: 'Mevcut şifre yanlış' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(organization && { organization }),
        ...(department && { department }),
        ...(newPassword && { password: await bcryptjs.hash(newPassword, 10) }),
      },
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

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    return NextResponse.json({ error: 'Profil güncellenemedi' }, { status: 500 });
  }
}
