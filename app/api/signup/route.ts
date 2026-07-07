export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

const PRIVILEGED_ROLES = ['KAZI_BASKANI', 'OGRETIM_GOREVLISI', 'MUZE_MUDURU'];

function isEduOrGovEmail(email: string): boolean {
  const domain = (email ?? '').split('@')[1] ?? '';
  const parts = domain.split('.');
  return parts.some((part: string) => part === 'edu' || part === 'gov');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body ?? {};

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur' }, { status: 400 });
    }

    if ((password ?? '').length < 6) {
      return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 });
    }

    if (PRIVILEGED_ROLES.includes(role) && !isEduOrGovEmail(email)) {
      return NextResponse.json(
        { error: 'Bu rol için .edu veya .gov uzantılı e-posta adresi gereklidir' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Bu e-posta adresi zaten kayıtlı' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Kayıt işlemi başarısız' }, { status: 500 });
  }
}
