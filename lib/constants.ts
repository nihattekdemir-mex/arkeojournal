import { Kategori, Role, NewsStatus, ApprovalStatus } from '@prisma/client';

export const KATEGORI_LABELS: Record<Kategori, string> = {
  KAZIDAN_HABERLER: 'Kazıdan Haberler',
  OKULDAN_HABERLER: 'Okuldan Haberler',
  MUZEDEN_HABERLER: 'Müzeden Haberler',
};

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Yönetici',
  EDITOR: 'Editör',
  CORRESPONDENT_ACADEMIC: 'Akademik Muhabir',
  CORRESPONDENT_MUSEUM: 'Müze Muhabiri',
  CORRESPONDENT_EXPERT: 'Uzman Muhabiri',
  STUDENT: 'Öğrenci',
  GUEST: 'Misafir',
};

export const NEWS_STATUS_LABELS: Record<NewsStatus, string> = {
  DRAFT: 'Taslak',
  SUBMITTED: 'Gönderildi',
  UNDER_REVIEW: 'İnceleniyor',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  PUBLISHED: 'Yayında',
  ARCHIVED: 'Arşivlendi',
};

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  PENDING: 'Beklemede',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
};

export const ROLE_KATEGORI_MAP: Record<Role, Kategori[]> = {
  ADMIN: ['KAZIDAN_HABERLER', 'OKULDAN_HABERLER', 'MUZEDEN_HABERLER'],
  EDITOR: [],
  CORRESPONDENT_ACADEMIC: ['OKULDAN_HABERLER'],
  CORRESPONDENT_MUSEUM: ['MUZEDEN_HABERLER'],
  CORRESPONDENT_EXPERT: ['KAZIDAN_HABERLER'],
  STUDENT: [],
  GUEST: [],
};

export const KATEGORI_COLORS: Record<Kategori, { bg: string; text: string; border: string }> = {
  KAZIDAN_HABERLER: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  OKULDAN_HABERLER: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  MUZEDEN_HABERLER: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
};

export const NEWS_STATUS_COLORS: Record<NewsStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  SUBMITTED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200',
  APPROVED: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200',
  PUBLISHED: 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-200',
  ARCHIVED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};
