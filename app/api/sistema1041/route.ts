export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const entries = await prisma.sistema1041.findMany({
    where: { userId: session.user.id, status: 'active' },
    orderBy: [{ nivel: 'asc' }, { priority: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const body = await request.json();
  const { objetivo, nivel, priority } = body;
  if (!objetivo?.trim()) return NextResponse.json({ error: 'Objetivo é obrigatório.' }, { status: 400 });

  const entry = await prisma.sistema1041.create({
    data: {
      userId: session.user.id,
      objetivo: objetivo.trim(),
      nivel: nivel || 'dez',
      priority: priority ?? 0,
    },
  });
  return NextResponse.json(entry);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 });

  const existing = await prisma.sistema1041.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
  }

  const updated = await prisma.sistema1041.update({
    where: { id },
    data: {
      ...(data.objetivo !== undefined && { objetivo: data.objetivo.trim() }),
      ...(data.nivel !== undefined && { nivel: data.nivel }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.planoAcao !== undefined && { planoAcao: data.planoAcao }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 });

  const existing = await prisma.sistema1041.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
  }

  await prisma.sistema1041.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
