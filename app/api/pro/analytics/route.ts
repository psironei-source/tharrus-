export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { calculateTravaCorrelations, analyzeTravasTrends, calculateChurnRisk, calculateAdherenceCorrelation } from '@/lib/analytics-engine';

// GET: analytics avançados de um cliente ou agregado
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  const type = searchParams.get('type') || 'overview'; // overview | correlations | trends | churn

  const proId = session.user.id;

  // Verificar vínculo
  if (clientId) {
    const link = await prisma.clientLink.findFirst({ where: { professionalId: proId, clientId, status: 'active' } });
    if (!link) return NextResponse.json({ error: 'Cliente não vinculado.' }, { status: 403 });
  }

  try {
    if (type === 'correlations') {
      // Correlações entre travas (de todos os clientes ou 1 específico)
      const where: any = {};
      if (clientId) {
        where.userId = clientId;
      } else {
        const links = await prisma.clientLink.findMany({ where: { professionalId: proId, status: 'active' }, select: { clientId: true } });
        where.userId = { in: links.map(l => l.clientId) };
      }

      const scores = await prisma.travaScore.findMany({
        where: { assessment: where },
        select: { assessmentId: true, travaKey: true, normalized: true },
      });

      const correlations = calculateTravaCorrelations(scores);
      return NextResponse.json({ correlations });
    }

    if (type === 'trends' && clientId) {
      const assessments = await prisma.assessment.findMany({
        where: { userId: clientId },
        orderBy: { completedAt: 'asc' },
        include: { scores: { select: { travaKey: true, normalized: true } } },
      });

      const trends = analyzeTravasTrends(
        assessments.map(a => ({ id: a.id, completedAt: a.completedAt.toISOString(), scores: a.scores }))
      );
      return NextResponse.json({ trends });
    }

    if (type === 'churn') {
      // Calcular risco de churn para todos os clientes
      const links = await prisma.clientLink.findMany({
        where: { professionalId: proId, status: 'active' },
        include: { client: { select: { id: true, name: true, email: true } } },
      });

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const results = [];

      for (const link of links) {
        const cId = link.clientId;

        // Última sessão
        const lastSession = await prisma.clientSession.findFirst({
          where: { clientId: cId, professionalId: proId, status: 'completed' },
          orderBy: { completedAt: 'desc' },
        });
        const daysSinceLastSession = lastSession?.completedAt
          ? Math.floor((Date.now() - lastSession.completedAt.getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        // Adesão às tarefas
        const tasks = await prisma.homeworkTask.findMany({ where: { clientId: cId, professionalId: proId } });
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const homeworkCompletionRate = tasks.length > 0 ? completedTasks / tasks.length : 1;

        // Diário
        const diaryCount = await prisma.diaryEntry.count({ where: { userId: cId, createdAt: { gte: thirtyDaysAgo } } });

        // Satisfação
        const feedbacks = await prisma.sessionFeedback.findMany({ where: { clientId: cId } });
        const avgRating = feedbacks.length > 0 ? feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length : 8;

        const churn = calculateChurnRisk({
          daysSinceLastSession,
          homeworkCompletionRate,
          diaryEntriesLast30Days: diaryCount,
          avgSatisfactionRating: avgRating,
        });

        results.push({
          clientId: cId,
          clientName: link.client.name || link.client.email,
          ...churn,
        });
      }

      results.sort((a, b) => b.riskScore - a.riskScore);
      return NextResponse.json({ clients: results });
    }

    if (type === 'adherence' && clientId) {
      // Correlação adesão x resultado
      const assessments = await prisma.assessment.findMany({
        where: { userId: clientId },
        orderBy: { completedAt: 'asc' },
        include: { scores: { select: { travaKey: true, normalized: true } } },
      });

      const tasks = await prisma.homeworkTask.findMany({
        where: { clientId, professionalId: proId },
        orderBy: { createdAt: 'asc' },
      });

      // Simplificado: taxa geral de adesão e média de mudança de score
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const rate = tasks.length > 0 ? completedTasks / tasks.length : 0;

      let avgScoreChange = 0;
      if (assessments.length >= 2) {
        const first = assessments[0].scores;
        const last = assessments[assessments.length - 1].scores;
        const firstAvg = first.reduce((s, x) => s + x.normalized, 0) / (first.length || 1);
        const lastAvg = last.reduce((s, x) => s + x.normalized, 0) / (last.length || 1);
        avgScoreChange = lastAvg - firstAvg;
      }

      return NextResponse.json({
        adherenceRate: Math.round(rate * 100),
        avgScoreChange: Math.round(avgScoreChange * 10) / 10,
        totalTasks: tasks.length,
        completedTasks,
        assessmentCount: assessments.length,
        insight: rate > 0.7 && avgScoreChange < -5
          ? 'Boa adesão com evolução positiva — o cliente está engajado e progredindo.'
          : rate < 0.4
          ? 'Baixa adesão às tarefas. Considere simplificar ou adaptar as atividades.'
          : 'Adesão moderada. Continue monitorando a relação entre comprometimento e resultados.',
      });
    }

    // Default overview
    return NextResponse.json({ message: 'Use type=correlations|trends|churn|adherence' });
  } catch (err) {
    console.error('Analytics error:', err);
    return NextResponse.json({ error: 'Erro ao processar análise.' }, { status: 500 });
  }
}
