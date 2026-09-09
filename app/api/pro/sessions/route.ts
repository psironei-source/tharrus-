export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { SUGGESTED_QUESTIONS } from '@/lib/pro-questions';

// GET: listar sessões do profissional
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const url = new URL(request.url);
  const clientId = url.searchParams.get('clientId');
  const programId = url.searchParams.get('programId');
  const status = url.searchParams.get('status');

  const where: any = { professionalId: session.user.id };
  if (clientId) where.clientId = clientId;
  if (programId) where.programId = programId;
  if (status) where.status = status;

  const sessions = await prisma.clientSession.findMany({
    where,
    orderBy: [{ scheduledAt: 'asc' }, { sessionNumber: 'asc' }],
    include: {
      client: { select: { id: true, name: true, email: true } },
      program: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(sessions);
}

// POST: criar sessão
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const body = await request.json();
  const { clientId, programId, title, objective, phase, toolUsed, scheduledAt, sessionNumber } = body ?? {};

  if (!clientId) {
    return NextResponse.json({ error: 'clientId é obrigatório.' }, { status: 400 });
  }

  // Gerar brief automático
  const lastSession = await prisma.clientSession.findFirst({
    where: { professionalId: session.user.id, clientId, status: 'completed' },
    orderBy: { completedAt: 'desc' },
  });

  const lastAssessment = await prisma.assessment.findFirst({
    where: { userId: clientId },
    orderBy: { completedAt: 'desc' },
    include: { scores: true },
  });

  const client = await prisma.user.findUnique({
    where: { id: clientId },
    select: { name: true },
  });

  const topTrava = lastAssessment?.scores?.sort((a: any, b: any) => b.normalized - a.normalized)?.[0];
  const travaKey = topTrava?.travaKey ?? 'crencas';
  const questions = SUGGESTED_QUESTIONS[travaKey] ?? [];

  const brief = {
    clientName: client?.name ?? 'Cliente',
    travaFoco: topTrava ? { key: topTrava.travaKey, normalized: topTrava.normalized, band: topTrava.band } : null,
    lastSessionSummary: lastSession?.reflectionNext ?? 'Primeira sessão',
    suggestedQuestions: questions.slice(0, 5),
  };

  const checklist = [
    { text: 'Reconectar com a meta da última sessão', done: false },
    { text: `Aplicar ferramenta: ${toolUsed ?? 'a definir'}`, done: false },
    { text: 'Fechar com pergunta de revisão', done: false },
  ];

  const newSession = await prisma.clientSession.create({
    data: {
      professionalId: session.user.id,
      clientId,
      programId: programId || null,
      title: title || `Sessão ${sessionNumber ?? 1}`,
      objective: objective || null,
      phase: phase || null,
      toolUsed: toolUsed || null,
      sessionNumber: sessionNumber ?? 1,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      briefJson: JSON.stringify(brief),
      checklistJson: JSON.stringify(checklist),
      suggestedQuestionsJson: JSON.stringify(questions),
    },
  });

  return NextResponse.json(newSession, { status: 201 });
}
