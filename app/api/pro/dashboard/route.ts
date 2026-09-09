export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// Dashboard agregado do profissional
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const proId = session.user.id;

  // Contagem de clientes ativos
  const clientCount = await prisma.clientLink.count({
    where: { professionalId: proId, status: 'active' },
  });

  // Programas ativos
  const activePrograms = await prisma.program.count({
    where: { professionalId: proId, status: 'active' },
  });

  // Sessões agendadas
  const upcomingSessions = await prisma.clientSession.findMany({
    where: { professionalId: proId, status: 'scheduled' },
    orderBy: { scheduledAt: 'asc' },
    take: 5,
    include: {
      client: { select: { name: true } },
      program: { select: { name: true } },
    },
  });

  // Total de sessões completadas
  const completedSessions = await prisma.clientSession.count({
    where: { professionalId: proId, status: 'completed' },
  });

  // Trava mais recorrente entre clientes (agregado)
  const clientLinks = await prisma.clientLink.findMany({
    where: { professionalId: proId, status: 'active' },
    select: { clientId: true },
  });
  const clientIds = clientLinks.map((l: any) => l.clientId);

  let travaRecurrence: Record<string, { total: number; count: number }> = {};

  if (clientIds.length > 0) {
    // Pegar a última avaliação de cada cliente
    for (const cid of clientIds) {
      const latest = await prisma.assessment.findFirst({
        where: { userId: cid },
        orderBy: { completedAt: 'desc' },
        include: { scores: true },
      });
      if (latest?.scores) {
        for (const s of latest.scores) {
          if (!travaRecurrence[s.travaKey]) {
            travaRecurrence[s.travaKey] = { total: 0, count: 0 };
          }
          travaRecurrence[s.travaKey].total += s.normalized;
          travaRecurrence[s.travaKey].count += 1;
        }
      }
    }
  }

  const travaStats = Object.entries(travaRecurrence)
    .map(([key, val]) => ({ travaKey: key, avg: Math.round(val.total / val.count) }))
    .sort((a, b) => b.avg - a.avg);

  return NextResponse.json({
    clientCount,
    activePrograms,
    completedSessions,
    upcomingSessions,
    travaStats,
  });
}
