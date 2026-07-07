'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ROLE_LABELS } from '@/lib/constants';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  department: string;
  createdAt: string;
}

const ROLES = ['ADMIN', 'EDITOR', 'CORRESPONDENT_ACADEMIC', 'CORRESPONDENT_MUSEUM', 'CORRESPONDENT_EXPERT', 'STUDENT', 'GUEST'];

export function UserManagementClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editOrg, setEditOrg] = useState('');
  const [editDept, setEditDept] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter]);

  async function fetchUsers() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } catch (error) {
      toast.error('Kullanıcılar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function updateUser() {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: editRole,
          organization: editOrg,
          department: editDept,
        }),
      });

      if (!response.ok) throw new Error('Failed to update user');

      toast.success('Kullanıcı başarıyla güncellendi');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error('Kullanıcı güncellenemedi');
    }
  }

  async function deleteUser() {
    if (!deletingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');

      toast.success('Kullanıcı başarıyla silindi');
      setDeletingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error('Kullanıcı silinemedi');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 flex-col sm:flex-row">
        <Input
          placeholder="İsim veya email ara..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1"
        />
        <Select value={roleFilter} onValueChange={(v) => {
          setRoleFilter(v);
          setPage(1);
        }}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Rol filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tüm Roller</SelectItem>
            {ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {ROLE_LABELS[role as keyof typeof ROLE_LABELS]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-10">Yükleniyor...</div>
      ) : (
        <>
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="text-left p-4 font-semibold">İsim</th>
                  <th className="text-left p-4 font-semibold">Email</th>
                  <th className="text-left p-4 font-semibold">Rol</th>
                  <th className="text-left p-4 font-semibold">Kuruluş</th>
                  <th className="text-left p-4 font-semibold">Bölüm</th>
                  <th className="text-right p-4 font-semibold">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="p-4">{user.name}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                    <td className="p-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{user.organization}</td>
                    <td className="p-4 text-sm">{user.department}</td>
                    <td className="p-4 text-right space-x-2">
                      <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => !open && setEditingUser(null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setEditRole(user.role);
                              setEditOrg(user.organization);
                              setEditDept(user.department);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Kullanıcıyı Düzenle</DialogTitle>
                            <DialogDescription>
                              {user.name} - {user.email}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Rol</label>
                              <Select value={editRole} onValueChange={setEditRole}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ROLES.map((role) => (
                                    <SelectItem key={role} value={role}>
                                      {ROLE_LABELS[role as keyof typeof ROLE_LABELS]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Kuruluş</label>
                              <Input
                                value={editOrg}
                                onChange={(e) => setEditOrg(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Bölüm</label>
                              <Input
                                value={editDept}
                                onChange={(e) => setEditDept(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end pt-4">
                            <Button variant="outline" onClick={() => setEditingUser(null)}>
                              İptal
                            </Button>
                            <Button onClick={updateUser}>
                              Kaydet
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog open={deletingUser?.id === user.id} onOpenChange={(open) => !open && setDeletingUser(null)}>
                        <AlertDialogAction asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeletingUser(user)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogAction>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
                            <AlertDialogDescription>
                              {user.name} ({user.email}) silinecek. Bu işlem geri alınamaz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="flex gap-2 justify-end">
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction onClick={deleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Sil
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              Hiç kullanıcı bulunamadı
            </div>
          )}

          {pages > 1 && (
            <div className="flex justify-center gap-2 items-center">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                Sayfa {page} / {pages} ({total} kullanıcı)
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
