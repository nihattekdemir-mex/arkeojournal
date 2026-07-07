'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MessageCircle, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KATEGORI_LABELS, KATEGORI_COLORS, ROLE_LABELS } from '@/lib/constants';
import { HoverLift } from '@/components/ui/animate';

interface HaberKartiProps {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  kategori: string;
  imageUrl: string | null;
  createdAt: string;
  author: { name: string; role: string };
  commentCount: number;
}

export function HaberKarti({ id, title, summary, content, kategori, imageUrl, createdAt, author, commentCount }: HaberKartiProps) {
  const kategoriKey = kategori as keyof typeof KATEGORI_LABELS;
  const colors = KATEGORI_COLORS[kategoriKey] ?? { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  const displayDate = new Date(createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const truncatedContent = (summary ?? content ?? '').slice(0, 150) + ((summary ?? content ?? '').length > 150 ? '...' : '');

  return (
    <HoverLift>
      <Link href={`/haber/${id}`}>
        <Card className="group overflow-hidden border border-border/50 transition-all duration-300 hover:shadow-lg h-full">
          {imageUrl && (
            <div className="relative aspect-video bg-muted overflow-hidden">
              <Image
                src={imageUrl}
                alt={title ?? 'Haber görseli'}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e: any) => { if (e?.target) e.target.style.display = 'none'; }}
              />
            </div>
          )}
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="outline" className={`${colors.bg} ${colors.text} ${colors.border} text-xs`}>
                {KATEGORI_LABELS[kategoriKey] ?? kategori}
              </Badge>
            </div>
            <h3 className="mb-2 font-display text-lg font-semibold tracking-tight text-foreground line-clamp-2 group-hover:text-amber-600 transition-colors">
              {title}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground line-clamp-3">{truncatedContent}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {author?.name ?? 'Anonim'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {displayDate}
                </span>
              </div>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                {commentCount ?? 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </HoverLift>
  );
}
