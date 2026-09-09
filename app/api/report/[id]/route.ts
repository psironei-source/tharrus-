export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { ALL_QUESTIONS, TRAVA_META, normalizeAnswers } from '@/lib/questions';
import { calculateScores } from '@/lib/scoring';
import { getInterpretation, generateExecutiveSummary } from '@/lib/interpretations';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const { id } = await params;

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: { answers: true, scores: true },
    });

    if (!assessment || assessment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Relatório não encontrado.' }, { status: 404 });
    }

    // Reconstruir answers map (com normalização de IDs antigos)
    const rawAnswersMap: Record<string, number> = {};
    for (const a of assessment.answers ?? []) {
      rawAnswersMap[a.questionId] = a.value;
    }
    const answersMap = normalizeAnswers(rawAnswersMap);

    // Recalcular scores com top questions
    const scores = calculateScores(answersMap, ALL_QUESTIONS);

    // Gerar interpretações
    const travaCards = scores.map((score: any) => {
      const interp = getInterpretation(score, answersMap, ALL_QUESTIONS);
      const meta = TRAVA_META?.[score.travaKey];
      return {
        travaKey: score.travaKey,
        name: meta?.name ?? score.travaKey,
        shortName: meta?.shortName ?? score.travaKey,
        definition: meta?.definition ?? '',
        icon: meta?.icon ?? 'brain',
        normalized: score.normalized,
        band: score.band,
        mainText: interp.mainText,
        reflection: interp.reflection,
        exercise: interp.exercise,
        topResponses: interp.topResponses,
        professionalReferral: interp.professionalReferral,
      };
    });

    const executiveSummary = generateExecutiveSummary(scores);

    return NextResponse.json({
      id: assessment.id,
      completedAt: assessment.completedAt?.toISOString?.() ?? '',
      executiveSummary,
      scores: scores.map((s: any) => ({
        travaKey: s.travaKey,
        name: TRAVA_META?.[s.travaKey]?.shortName ?? s.travaKey,
        normalized: s.normalized,
        band: s.band,
      })),
      travaCards,
    });
  } catch (error: any) {
    console.error('Report error:', error);
    return NextResponse.json({ error: 'Erro ao gerar relatório.' }, { status: 500 });
  }
}
