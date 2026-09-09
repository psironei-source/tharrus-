import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { DashboardClient } from './dashboard-client';

export default async function DashboardPage() {
  const session = await auth();
  if (session?.user?.role === 'professional') {
    redirect('/pro');
  }
  const userId = session?.user?.id ?? '';

  const assessments = await prisma.assessment.findMany({
    where: { userId },
    include: { scores: true },
    orderBy: { completedAt: 'desc' },
    take: 10,
  });

  const lastAssessment = assessments?.[0] ?? null;
  const assessmentCount = assessments?.length ?? 0;

  const sdrCount = await prisma.sDRResult.count({ where: { userId } });
  const bussolaCount = await prisma.bussolaItem.count({ where: { userId } });

  const data = {
    userName: session?.user?.name ?? '',
    assessmentCount,
    lastAssessmentId: lastAssessment?.id ?? null,
    lastAssessmentDate: lastAssessment?.completedAt?.toISOString?.() ?? null,
    lastScores: (lastAssessment?.scores ?? []).map((s: any) => ({
      travaKey: s.travaKey,
      normalized: s.normalized,
      band: s.band,
    })),
    sdrCount,
    bussolaCount,
  };

  return <DashboardClient data={data} />;
}
