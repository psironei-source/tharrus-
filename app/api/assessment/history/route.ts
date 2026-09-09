export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const assessments = await prisma.assessment.findMany({
      where: { userId: session.user.id },
      include: { scores: true },
      orderBy: { completedAt: 'desc' },
      take: 20,
    });

    const data = assessments.map((a: any) => ({
      id: a.id,
      completedAt: a.completedAt?.toISOString?.() ?? '',
      scores: (a.scores ?? []).map((s: any) => ({
        travaKey: s.travaKey,
        normalized: s.normalized,
        band: s.band,
      })),
    }));

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('History error:', error);
    return NextResponse.json({ error: 'Erro ao buscar histórico.' }, { status: 500 });
  }
}
