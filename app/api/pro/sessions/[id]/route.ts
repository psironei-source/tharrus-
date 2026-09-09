export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// GET: detalhe de uma sessão
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  const { id } = await params;

  const cs = await prisma.clientSession.findFirst({
    where: { id, professionalId: session.user.id },
    include: {
      client: { select: { id: true, name: true, email: true } },
      program: { select: { id: true, name: true } },
    },
  });

  if (!cs) {
    return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 404 });
  }

  return NextResponse.json(cs);
}

// PUT: atualizar sessão (notas, reflexão, status, checklist)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();

  const cs = await prisma.clientSession.findFirst({
    where: { id, professionalId: session.user.id },
  });
  if (!cs) {
    return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 404 });
  }

  const updateData: any = {};
  if (body.status !== undefined) {
    updateData.status = body.status;
    if (body.status === 'completed') updateData.completedAt = new Date();
    if (body.status === 'in_progress' && !cs.completedAt) updateData.status = 'in_progress';
  }
  if (body.sessionNotes !== undefined) updateData.sessionNotes = body.sessionNotes;
  if (body.reflectionWhat !== undefined) updateData.reflectionWhat = body.reflectionWhat;
  if (body.reflectionBlock !== undefined) updateData.reflectionBlock = body.reflectionBlock;
  if (body.reflectionNext !== undefined) updateData.reflectionNext = body.reflectionNext;
  if (body.checklistJson !== undefined) updateData.checklistJson = body.checklistJson;
  if (body.title !== undefined) updateData.title = body.title;
  if (body.objective !== undefined) updateData.objective = body.objective;
  if (body.toolUsed !== undefined) updateData.toolUsed = body.toolUsed;

  const updated = await prisma.clientSession.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updated);
}

// DELETE
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  const { id } = await params;

  await prisma.clientSession.deleteMany({
    where: { id, professionalId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
