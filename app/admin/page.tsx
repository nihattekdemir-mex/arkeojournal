import { AdminDashboardClient } from './_components/admin-dashboard';
import { Header } from '@/components/header';

export const metadata = {
  title: 'Yönetici Paneli - ArkeoJournal',
  description: 'Sistem yönetimi ve haber onay işlemleri',
};

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AdminDashboardClient />
    </div>
  );
}
