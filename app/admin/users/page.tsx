import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { UserManagementClient } from './_components/user-management-client';

export const metadata = {
  title: 'Kullanıcı Yönetimi - ArkeoJournal',
  description: 'Tüm kullanıcıları yönet',
};

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/');
  }

  const userRole = (session.user as any)?.role;
  if (userRole !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Kullanıcı Yönetimi
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tüm kullanıcıları görüntüleyin, düzenleyin ve yönetin
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
          <UserManagementClient />
        </div>
      </div>
    </div>
  );
}
