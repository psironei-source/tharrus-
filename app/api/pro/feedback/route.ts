export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// GET: listar feedbacks de sessões de um cliente
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  const where: any = {};
  if (session.user.role === 'professional' && clientId) {
    where.clientId = clientId;
  } else {
    where.clientId = session.user.id;
  }

  const feedbacks = await prisma.sessionFeedback.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json(feedbacks);
}

// POST: cliente envia feedback de uma sessão
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

  const body = await request.json();
  const { sessionId, rating, comment } = body;
  if (!sessionId || rating === undefined || rating === null) {
    return NextResponse.json({ error: 'Sessão e avaliação são obrigatórios.' }, { status: 400 });
  }

  // Verificar se já existe feedback
  const existing = await prisma.sessionFeedback.findUnique({ where: { sessionId } });
  if (existing) return NextResponse.json({ error: 'Feedback já enviado para esta sessão.' }, { status: 409 });

  const feedback = await prisma.sessionFeedback.create({
    data: {
      sessionId,
      clientId: session.user.id,
      rating: Math.max(0, Math.min(10, Math.round(rating))),
      comment: comment || null,
    },
  });
  return NextResponse.json(feedback, { status: 201 });
}
