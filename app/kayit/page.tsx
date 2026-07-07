import { KayitClient } from './_components/kayit-client';
import { Header } from '@/components/header';

export default function KayitPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <KayitClient />
    </div>
  );
}
