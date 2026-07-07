import { GirisClient } from './_components/giris-client';
import { Header } from '@/components/header';

export default function GirisPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <GirisClient />
    </div>
  );
}
