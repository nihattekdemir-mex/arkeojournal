'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Landmark, Menu, X, User, LogOut, PenSquare, Search } from 'lucide-react';
import { ROLE_LABELS } from '@/lib/constants';

export function Header() {
  const { data: session, status } = useSession() || {};
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userRole = (session?.user as any)?.role;
  const canPost = userRole && userRole !== 'KULLANICI';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <Landmark className="h-6 w-6 text-amber-600" />
          <span className="text-foreground">Arkeo<span className="text-amber-600">Journal</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/">
            <Button variant={pathname === '/' ? 'secondary' : 'ghost'} size="sm">
              Ana Sayfa
            </Button>
          </Link>
          {canPost && (
            <Link href="/haber/yeni">
              <Button variant={pathname === '/haber/yeni' ? 'secondary' : 'ghost'} size="sm">
                <PenSquare className="mr-1.5 h-4 w-4" />
                Haber Ekle
              </Button>
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {status === 'loading' ? (
            <div className="h-8 w-20 animate-pulse rounded bg-muted" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="max-w-[120px] truncate">{session.user?.name ?? 'Kullanıcı'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{session.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                  <p className="mt-1 text-xs font-medium text-amber-600">
                    {ROLE_LABELS[userRole as keyof typeof ROLE_LABELS] ?? 'Kullanıcı'}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut?.({ callbackUrl: '/' })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Link href="/giris">
                <Button variant="ghost" size="sm">Giriş Yap</Button>
              </Link>
              <Link href="/kayit">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">Kayıt Ol</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menü"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Ana Sayfa</Button>
            </Link>
            {canPost && (
              <Link href="/haber/yeni" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <PenSquare className="mr-2 h-4 w-4" /> Haber Ekle
                </Button>
              </Link>
            )}
            {session?.user ? (
              <>
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  {session.user?.name} • {ROLE_LABELS[userRole as keyof typeof ROLE_LABELS] ?? 'Kullanıcı'}
                </div>
                <Button variant="ghost" className="w-full justify-start" onClick={() => signOut?.({ callbackUrl: '/' })}>
                  <LogOut className="mr-2 h-4 w-4" /> Çıkış Yap
                </Button>
              </>
            ) : (
              <>
                <Link href="/giris" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Giriş Yap</Button>
                </Link>
                <Link href="/kayit" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">Kayıt Ol</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
