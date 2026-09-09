export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// GET: listar tarefas de um cliente
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  // Profissional vê tarefas do cliente; cliente vê suas próprias
  const where: any = {};
  if (session.user.role === 'professional') {
    where.professionalId = session.user.id;
    if (clientId) where.clientId = clientId;
  } else {
    where.clientId = session.user.id;
  }

  const tasks = await prisma.homeworkTask.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { client: { select: { name: true, email: true } } },
  });
  return NextResponse.json(tasks);
}

// POST: criar tarefa (só profissional)
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  const body = await request.json();
  const { clientId, sessionId, title, description, dueDate } = body;
  if (!clientId || !title?.trim()) {
    return NextResponse.json({ error: 'Cliente e título são obrigatórios.' }, { status: 400 });
  }

  const task = await prisma.homeworkTask.create({
    data: {
      professionalId: session.user.id,
      clientId,
      sessionId: sessionId || null,
      title: title.trim(),
      description: description || null,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });
  return NextResponse.json(task, { status: 201 });
}

// PUT: atualizar tarefa (profissional atualiza; cliente marca como feita)
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

  const body = await request.json();
  const { id, status: newStatus, ...rest } = body;
  if (!id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 });

  // Verificar acesso
  const task = await prisma.homeworkTask.findFirst({
    where: { id, OR: [{ professionalId: session.user.id }, { clientId: session.user.id }] },
  });
  if (!task) return NextResponse.json({ error: 'Tarefa não encontrada.' }, { status: 404 });

  const updated: any = {};
  if (newStatus) {
    updated.status = newStatus;
    if (newStatus === 'completed') updated.completedAt = new Date();
  }
  if (rest.title) updated.title = rest.title;
  if (rest.description !== undefined) updated.description = rest.description;
  if (rest.dueDate !== undefined) updated.dueDate = rest.dueDate ? new Date(rest.dueDate) : null;

  const result = await prisma.homeworkTask.update({ where: { id }, data: updated });
  return NextResponse.json(result);
}
