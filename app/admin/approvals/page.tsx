import { ApprovalQueueClient } from './_components/approval-queue';
import { Header } from '@/components/header';

export const metadata = {
  title: 'Onay Kuyruğu - ArkeoJournal',
  description: 'Yayın için beklayan haberleri inceleyin ve onaylayın',
};

export default function ApprovalQueuePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ApprovalQueueClient />
    </div>
  );
}
