import { AnaSayfaClient } from './_components/ana-sayfa-client';
import { Header } from '@/components/header';

export default function AnaSayfa() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AnaSayfaClient />
    </div>
  );
}
