import { HaberDuzenleClient } from './_components/haber-duzenle-client';
import { Header } from '@/components/header';

export default function HaberDuzenlePage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HaberDuzenleClient id={params?.id} />
    </div>
  );
}
