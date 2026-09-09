export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const results = await prisma.sDRResult.findMany({
      where: { userId: session.user.id },
      orderBy: { completedAt: 'desc' },
      take: 10,
    });

    const data = results.map((r: any) => ({
      id: r.id,
      completedAt: r.completedAt?.toISOString?.() ?? '',
      sociabilidade: r.sociabilidade,
      dominancia: r.dominancia,
      receptividade: r.receptividade,
    }));

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('SDR results error:', error);
    return NextResponse.json({ error: 'Erro ao buscar resultados.' }, { status: 500 });
  }
}
