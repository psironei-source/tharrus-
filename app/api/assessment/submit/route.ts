export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { ALL_QUESTIONS } from '@/lib/questions';
import { calculateScores, validateControlQuestions } from '@/lib/scoring';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const body = await request.json();
    const answers: Record<string, number> = body?.answers ?? {};

    // Validar perguntas de controle (Seção 13.9: 2+ erros = baixa confiabilidade, mas não bloqueia)
    const controlValidation = validateControlQuestions(answers, ALL_QUESTIONS);

    // Calcular pontuações
    const scores = calculateScores(answers, ALL_QUESTIONS);

    // Salvar assessment com flag de confiabilidade
    const assessment = await prisma.assessment.create({
      data: {
        userId: session.user.id,
        lowReliability: controlValidation.lowReliability,
        answers: {
          create: Object.entries(answers)
            .filter(([key]: [string, number]) => key !== undefined)
            .map(([questionId, value]: [string, number]) => ({
              questionId,
              value: Number(value),
            })),
        },
        scores: {
          create: scores.map((s: any) => ({
            travaKey: s.travaKey,
            rawAverage: s.rawAverage,
            normalized: s.normalized,
            band: s.band,
          })),
        },
      },
    });

    return NextResponse.json({
      assessmentId: assessment.id,
      scores,
      lowReliability: controlValidation.lowReliability,
    });
  } catch (error: any) {
    console.error('Assessment submit error:', error);
    return NextResponse.json({ error: 'Erro ao salvar avaliação.' }, { status: 500 });
  }
}
