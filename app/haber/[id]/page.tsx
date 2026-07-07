import { HaberDetayClient } from './_components/haber-detay-client';
import { Header } from '@/components/header';

export default function HaberDetayPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HaberDetayClient id={params?.id} />
    </div>
  );
}
