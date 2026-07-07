import { HaberYeniClient } from './_components/haber-yeni-client';
import { Header } from '@/components/header';

export default function HaberYeniPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HaberYeniClient />
    </div>
  );
}
