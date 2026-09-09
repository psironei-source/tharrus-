export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { SDR_QUESTIONS } from '@/lib/sdr-questions';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const body = await request.json();
    const answers: Record<string, number> = body?.answers ?? {};

    const dimensions = ['sociabilidade', 'dominancia', 'receptividade'] as const;
    const results: Record<string, number> = {};

    for (const dim of dimensions) {
      const dimQuestions = SDR_QUESTIONS.filter((q: any) => q.dimension === dim);
      const values = dimQuestions.map((q: any) => answers?.[q.id] ?? 0).filter((v: number) => v > 0);
      if (values.length === 0) {
        results[dim] = 0;
      } else {
        const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length;
        results[dim] = Math.round(((avg - 1) / 4) * 100);
      }
    }

    const sdrResult = await prisma.sDRResult.create({
      data: {
        userId: session.user.id,
        sociabilidade: results.sociabilidade ?? 0,
        dominancia: results.dominancia ?? 0,
        receptividade: results.receptividade ?? 0,
        answersJson: JSON.stringify(answers),
      },
    });

    return NextResponse.json({
      id: sdrResult.id,
      sociabilidade: results.sociabilidade,
      dominancia: results.dominancia,
      receptividade: results.receptividade,
    });
  } catch (error: any) {
    console.error('SDR submit error:', error);
    return NextResponse.json({ error: 'Erro ao salvar SDR.' }, { status: 500 });
  }
}
