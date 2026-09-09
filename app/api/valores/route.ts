export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const entry = await prisma.valoresEssenciais.findFirst({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json(entry);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const body = await request.json();
  const { valuesJson, islandText } = body;

  // Upsert: atualiza se existe, cria se não
  const existing = await prisma.valoresEssenciais.findFirst({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  });

  if (existing) {
    const updated = await prisma.valoresEssenciais.update({
      where: { id: existing.id },
      data: { valuesJson: JSON.stringify(valuesJson), islandText },
    });
    return NextResponse.json(updated);
  }

  const created = await prisma.valoresEssenciais.create({
    data: {
      userId: session.user.id,
      valuesJson: JSON.stringify(valuesJson),
      islandText,
    },
  });
  return NextResponse.json(created);
}
