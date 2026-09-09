export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// GET: listar entradas do diário do usuário logado
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

  const entries = await prisma.diaryEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json(entries);
}

// POST: criar entrada no diário
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

  const body = await request.json();
  const { content, mood, tags } = body;
  if (!content?.trim()) return NextResponse.json({ error: 'Conteúdo obrigatório.' }, { status: 400 });

  const entry = await prisma.diaryEntry.create({
    data: {
      userId: session.user.id,
      content: content.trim(),
      mood: mood || null,
      tags: tags ? JSON.stringify(tags) : null,
    },
  });
  return NextResponse.json(entry, { status: 201 });
}
