export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const entries = await prisma.cicloPensarSentir.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const body = await request.json();
  const { situacao, pensamentoAuto, emocao, intensidade, reacao, resultadoReal, pensamentoAlt } = body;
  if (!situacao?.trim()) return NextResponse.json({ error: 'Situação é obrigatória.' }, { status: 400 });

  const entry = await prisma.cicloPensarSentir.create({
    data: {
      userId: session.user.id,
      situacao: situacao.trim(),
      pensamentoAuto: pensamentoAuto?.trim() || null,
      emocao: emocao?.trim() || null,
      intensidade: intensidade ? Math.min(10, Math.max(1, Number(intensidade))) : null,
      reacao: reacao?.trim() || null,
      resultadoReal: resultadoReal?.trim() || null,
      pensamentoAlt: pensamentoAlt?.trim() || null,
    },
  });
  return NextResponse.json(entry);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 });

  const existing = await prisma.cicloPensarSentir.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
  }

  await prisma.cicloPensarSentir.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
