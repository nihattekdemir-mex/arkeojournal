'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROLE_LABELS } from '@/lib/constants';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  department: string;
  createdAt: string;
  _count: {
    news: number;
    comments: number;
  };
}

export function ProfileClient() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    department: '',
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
      setFormData({
        name: data.name,
        organization: data.organization,
        department: data.department,
        currentPassword: '',
        newPassword: '',
        newPasswordConfirm: '',
      });
    } catch (error) {
      toast.error('Profil yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    if (formData.newPassword !== formData.newPasswordConfirm) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          organization: formData.organization,
          department: formData.department,
          ...(formData.newPassword && {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const updated = await response.json();
      setProfile(updated);
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        newPasswordConfirm: '',
      });
      setEditing(false);
      toast.success('Profil başarıyla güncellendi');
    } catch (error: any) {
      toast.error(error.message || 'Profil güncellenemedi');
    }
  }

  if (loading) {
    return <div className="text-center py-10">Yükleniyor...</div>;
  }

  if (!profile) {
    return <div className="text-center py-10">Profil yüklenemedi</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <label className="text-sm text-gray-500 dark:text-gray-400">İsim</label>
          {editing ? (
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-2"
            />
          ) : (
            <p className="mt-2 text-lg font-medium">{profile.name}</p>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
          <p className="mt-2 text-lg font-medium">{profile.email}</p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <label className="text-sm text-gray-500 dark:text-gray-400">Rol</label>
          <p className="mt-2 text-lg font-medium">
            {ROLE_LABELS[profile.role as keyof typeof ROLE_LABELS]}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <label className="text-sm text-gray-500 dark:text-gray-400">Kuruluş</label>
          {editing ? (
            <Input
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              className="mt-2"
            />
          ) : (
            <p className="mt-2 text-lg font-medium">{profile.organization}</p>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <label className="text-sm text-gray-500 dark:text-gray-400">Bölüm</label>
          {editing ? (
            <Input
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="mt-2"
            />
          ) : (
            <p className="mt-2 text-lg font-medium">{profile.department}</p>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <label className="text-sm text-gray-500 dark:text-gray-400">Üye Olunma Tarihi</label>
          <p className="mt-2 text-lg font-medium">
            {new Date(profile.createdAt).toLocaleDateString('tr-TR')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400">Yazılan Haberler</label>
          <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
            {profile._count.news}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400">Yapılan Yorumlar</label>
          <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
            {profile._count.comments}
          </p>
        </div>
      </div>

      {editing && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold">Şifre Değiştir (İsteğe Bağlı)</h3>
          <div>
            <label className="block text-sm font-medium mb-2">Mevcut Şifre</label>
            <Input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              placeholder="Şifre değiştirmek istiyorsanız girin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Yeni Şifre</label>
            <Input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              placeholder="Boş bırakın değiştirmek istemiyorsanız"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Yeni Şifre (Tekrar)</label>
            <Input
              type="password"
              value={formData.newPasswordConfirm}
              onChange={(e) => setFormData({ ...formData, newPasswordConfirm: e.target.value })}
              placeholder="Yeni şifreyi tekrar girin"
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        {editing ? (
          <>
            <Button
              variant="outline"
              onClick={() => {
                setEditing(false);
                fetchProfile();
              }}
            >
              İptal
            </Button>
            <Button onClick={updateProfile}>
              Kaydet
            </Button>
          </>
        ) : (
          <Button onClick={() => setEditing(true)}>
            Profili Düzenle
          </Button>
        )}
      </div>
    </div>
  );
}
