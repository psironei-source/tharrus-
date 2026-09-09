export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// GET: listar metas de um cliente
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  if (!clientId) return NextResponse.json({ error: 'clientId obrigatório.' }, { status: 400 });

  const goals = await prisma.therapeuticGoal.findMany({
    where: { professionalId: session.user.id, clientId },
    orderBy: { createdAt: 'desc' },
    include: { client: { select: { name: true, email: true } } },
  });
  return NextResponse.json(goals);
}

// POST: criar meta SMART
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  const body = await request.json();
  const { clientId, travaKey, title, description, measurable, deadline } = body;
  if (!clientId || !travaKey || !title?.trim()) {
    return NextResponse.json({ error: 'Cliente, trava e título são obrigatórios.' }, { status: 400 });
  }

  const goal = await prisma.therapeuticGoal.create({
    data: {
      professionalId: session.user.id,
      clientId,
      travaKey,
      title: title.trim(),
      description: description || null,
      measurable: measurable || null,
      deadline: deadline ? new Date(deadline) : null,
    },
  });
  return NextResponse.json(goal, { status: 201 });
}

// PUT: atualizar meta (via body.id)
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 });

  const existing = await prisma.therapeuticGoal.findFirst({ where: { id, professionalId: session.user.id } });
  if (!existing) return NextResponse.json({ error: 'Meta não encontrada.' }, { status: 404 });

  const updated: any = {};
  if (data.title) updated.title = data.title;
  if (data.description !== undefined) updated.description = data.description;
  if (data.measurable !== undefined) updated.measurable = data.measurable;
  if (data.status) updated.status = data.status;
  if (data.deadline !== undefined) updated.deadline = data.deadline ? new Date(data.deadline) : null;

  const goal = await prisma.therapeuticGoal.update({ where: { id }, data: updated });
  return NextResponse.json(goal);
}
