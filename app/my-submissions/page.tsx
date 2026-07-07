import { MySubmissionsClient } from './_components/my-submissions-client';
import { Header } from '@/components/header';

export const metadata = {
  title: 'Gönderimlerim - ArkeoJournal',
  description: 'Gönderdiğiniz haberleri ve durumlarını görüntüleyin',
};

export default function MySubmissionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MySubmissionsClient />
    </div>
  );
}
