export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// GET: listar alertas do profissional
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const alerts = await prisma.riskAlert.findMany({
    where: { professionalId: session.user.id, dismissed: false },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { client: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(alerts);
}

// PUT: dispensar alerta
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 });

  const alert = await prisma.riskAlert.findFirst({ where: { id, professionalId: session.user.id } });
  if (!alert) return NextResponse.json({ error: 'Alerta não encontrado.' }, { status: 404 });

  await prisma.riskAlert.update({ where: { id }, data: { dismissed: true } });
  return NextResponse.json({ ok: true });
}
