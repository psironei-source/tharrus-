import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ReportClient } from './report-client';

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id } = await params;

  return <ReportClient assessmentId={id} />;
}
