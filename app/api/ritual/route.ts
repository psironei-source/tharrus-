export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  
  // Busca últimos 7 dias
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const entries = await prisma.ritualAtivacao.findMany({
    where: {
      userId: session.user.id,
      date: { gte: sevenDaysAgo },
    },
    orderBy: { date: 'desc' },
  });
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const body = await request.json();
  const { date, criacao, aprendizado, conquista, gratidao } = body;
  if (!date) return NextResponse.json({ error: 'Data obrigatória.' }, { status: 400 });

  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);

  const entry = await prisma.ritualAtivacao.upsert({
    where: {
      userId_date: {
        userId: session.user.id,
        date: dateObj,
      },
    },
    update: {
      criacao: criacao?.trim() || null,
      aprendizado: aprendizado?.trim() || null,
      conquista: conquista?.trim() || null,
      gratidao: gratidao?.trim() || null,
    },
    create: {
      userId: session.user.id,
      date: dateObj,
      criacao: criacao?.trim() || null,
      aprendizado: aprendizado?.trim() || null,
      conquista: conquista?.trim() || null,
      gratidao: gratidao?.trim() || null,
    },
  });
  return NextResponse.json(entry);
}
