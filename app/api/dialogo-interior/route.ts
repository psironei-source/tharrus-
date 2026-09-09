export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const entries = await prisma.dialogoInterior.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const body = await request.json();
  const { palavra, significado, sentimento, comportamento, resultado, novaVersao } = body;
  if (!palavra?.trim()) return NextResponse.json({ error: 'Palavra/frase é obrigatória.' }, { status: 400 });

  const entry = await prisma.dialogoInterior.create({
    data: {
      userId: session.user.id,
      palavra: palavra.trim(),
      significado: significado?.trim() || null,
      sentimento: sentimento?.trim() || null,
      comportamento: comportamento?.trim() || null,
      resultado: resultado?.trim() || null,
      novaVersao: novaVersao?.trim() || null,
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

  const existing = await prisma.dialogoInterior.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
  }

  const updated = await prisma.dialogoInterior.update({
    where: { id },
    data: {
      palavra: data.palavra?.trim() ?? existing.palavra,
      significado: data.significado?.trim() ?? existing.significado,
      sentimento: data.sentimento?.trim() ?? existing.sentimento,
      comportamento: data.comportamento?.trim() ?? existing.comportamento,
      resultado: data.resultado?.trim() ?? existing.resultado,
      novaVersao: data.novaVersao?.trim() ?? existing.novaVersao,
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

  const existing = await prisma.dialogoInterior.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
  }

  await prisma.dialogoInterior.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
