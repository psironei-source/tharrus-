export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { generateTrail } from '@/lib/trail-engine';

// POST: gerar trilha recomendada para um cliente
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const body = await request.json();
  const { clientId } = body ?? {};

  if (!clientId) {
    return NextResponse.json({ error: 'clientId é obrigatório.' }, { status: 400 });
  }

  // Buscar última avaliação do cliente
  const assessment = await prisma.assessment.findFirst({
    where: { userId: clientId },
    orderBy: { completedAt: 'desc' },
    include: { scores: true },
  });

  if (!assessment?.scores?.length) {
    return NextResponse.json({ error: 'O cliente ainda não realizou o diagnóstico.' }, { status: 404 });
  }

  const scores = assessment.scores.map((s: any) => ({
    travaKey: s.travaKey,
    normalized: s.normalized,
    band: s.band,
  }));

  const trail = generateTrail(scores);

  return NextResponse.json({ trail, scores });
}
