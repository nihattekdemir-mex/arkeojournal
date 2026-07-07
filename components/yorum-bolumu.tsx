'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, User, Calendar, Trash2, AlertCircle } from 'lucide-react';
import { ROLE_LABELS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Link from 'next/link';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; role: string };
}

interface YorumBolumuProps {
  newsId: string;
  initialComments: Comment[];
}

export function YorumBolumu({ newsId, initialComments }: YorumBolumuProps) {
  const { data: session } = useSession() || {};
  const [comments, setComments] = useState<Comment[]>(initialComments ?? []);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const userId = (session?.user as any)?.id;
  const userRole = (session?.user as any)?.role;

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    if (!(newComment ?? '').trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/yorumlar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim(), newsId }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error ?? 'Yorum eklenemedi');
        return;
      }

      setComments((prev: Comment[]) => [data, ...(prev ?? [])]);
      setNewComment('');
      toast.success('Yorumunuz eklendi');
    } catch (err: any) {
      setError('Yorum eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const res = await fetch(`/api/yorumlar?id=${commentId}`, { method: 'DELETE' });
      if (res.ok) {
        setComments((prev: Comment[]) => (prev ?? []).filter((c: Comment) => c?.id !== commentId));
        toast.success('Yorum silindi');
      }
    } catch (err: any) {
      toast.error('Yorum silinemedi');
    }
  };

  return (
    <div className="mt-8">
      <h3 className="flex items-center gap-2 font-display text-xl font-semibold mb-6">
        <MessageCircle className="h-5 w-5 text-amber-600" />
        Yorumlar ({(comments ?? []).length})
      </h3>

      {/* Comment Form */}
      {session?.user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <Textarea
            value={newComment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e?.target?.value ?? '')}
            placeholder="Yorumunuzu yazın..."
            className="mb-3 min-h-[100px]"
          />
          {error && (
            <div className="mb-3 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          <Button
            type="submit"
            disabled={loading || !(newComment ?? '').trim()}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {loading ? 'Gönderiliyor...' : 'Yorum Yap'}
          </Button>
        </form>
      ) : (
        <div className="mb-8 rounded-lg border border-border bg-muted/30 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Yorum yapmak için{' '}
            <Link href="/giris" className="text-amber-600 hover:underline font-medium">
              giriş yapın
            </Link>
            {' '}veya{' '}
            <Link href="/kayit" className="text-amber-600 hover:underline font-medium">
              kayıt olun
            </Link>.
          </p>
        </div>
      )}

      {/* Comment List */}
      <div className="space-y-4">
        {(comments ?? []).length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Henüz yorum yapılmamış. İlk yorumu siz yapın!
          </p>
        ) : (
          (comments ?? []).map((comment: Comment) => (
            <div key={comment?.id} className="rounded-lg border border-border/50 bg-card p-4 transition-all hover:shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <User className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <span className="text-sm font-medium">{comment?.author?.name ?? 'Anonim'}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {ROLE_LABELS[comment?.author?.role as keyof typeof ROLE_LABELS] ?? 'Kullanıcı'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(comment?.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}
                  </span>
                  {(userId === comment?.author?.id || userRole === 'ADMIN') && (
                    <button
                      onClick={() => handleDelete(comment?.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      title="Yorumu sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-foreground/90 pl-10">{comment?.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
