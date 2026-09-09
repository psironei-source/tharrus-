export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { TRAVA_META } from '@/lib/questions';

const SYSTEM_PROMPT = `Você é um redator especialista em neurociência comportamental e autoconhecimento. 
Sua tarefa é gerar case studies profissionais e anonimizados a partir de dados reais de evolução de um cliente.

Regras estritas:
- NUNCA usar o nome real do cliente, apenas o nome fictício fornecido.
- NUNCA mencionar substâncias, drogas, álcool ou qualquer dependência química.
- Tom: profissional, inspirador, baseado em dados — nunca clínico/patologizante.
- Linguagem: português brasileiro, 2ª pessoa do plural para referir ao profissional ("nosso acompanhamento").
- O case study deve demonstrar a metodologia e os resultados, sem expor detalhes sensíveis.
- Responda APENAS em JSON válido.`;

// GET: listar case studies do profissional
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const studies = await prisma.caseStudy.findMany({
    where: { professionalId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { client: { select: { name: true, email: true } } },
  });

  return NextResponse.json(studies);
}

// POST: gerar novo case study a partir de dados do cliente
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { clientId } = await request.json();
  if (!clientId) return NextResponse.json({ error: 'clientId obrigatório.' }, { status: 400 });

  // Verificar vínculo ativo com consentimento
  const link = await prisma.clientLink.findFirst({
    where: { professionalId: session.user.id, clientId, status: 'active', consentGiven: true },
  });
  if (!link) {
    return NextResponse.json({ error: 'Cliente não vinculado ou sem consentimento.' }, { status: 403 });
  }

  // Buscar dados do cliente
  const client = await prisma.user.findUnique({ where: { id: clientId }, select: { name: true } });
  const assessments = await prisma.assessment.findMany({
    where: { userId: clientId },
    orderBy: { completedAt: 'asc' },
    include: { scores: true },
  });

  if (assessments.length < 2) {
    return NextResponse.json({ error: 'São necessárias pelo menos 2 avaliações para gerar um case study.' }, { status: 400 });
  }

  const goals = await prisma.therapeuticGoal.findMany({ where: { clientId, professionalId: session.user.id } });
  const completedSessions = await prisma.clientSession.count({ where: { clientId, professionalId: session.user.id, status: 'completed' } });

  // Anonimizar: gerar nome fictício
  const FICTIONAL_NAMES = ['Ana', 'Carlos', 'Maria', 'Pedro', 'Lúcia', 'Roberto', 'Julia', 'Felipe', 'Camila', 'Rafael', 'Fernanda', 'Bruno'];
  const anonymizedName = FICTIONAL_NAMES[Math.floor(Math.random() * FICTIONAL_NAMES.length)];

  // Montar dados para o LLM
  const firstScores = assessments[0].scores.reduce((acc: any, s: any) => {
    acc[s.travaKey] = { normalized: s.normalized, band: s.band };
    return acc;
  }, {});
  const lastScores = assessments[assessments.length - 1].scores.reduce((acc: any, s: any) => {
    acc[s.travaKey] = { normalized: s.normalized, band: s.band };
    return acc;
  }, {});

  const topTravas = assessments[0].scores
    .sort((a: any, b: any) => b.normalized - a.normalized)
    .slice(0, 3)
    .map((s: any) => s.travaKey);

  const improvements = Object.entries(firstScores).map(([key, first]: [string, any]) => {
    const last = lastScores[key];
    return {
      trava: TRAVA_META[key]?.name || key,
      key,
      initial: first.normalized,
      final: last?.normalized || first.normalized,
      change: last ? Math.round(first.normalized - last.normalized) : 0,
    };
  }).filter(i => i.change > 0).sort((a, b) => b.change - a.change);

  const goalsAchieved = goals.filter(g => g.status === 'achieved').length;

  const userPrompt = `Gere um case study profissional com as seguintes informações:

Nome fictício do cliente: ${anonymizedName}
Número de avaliações: ${assessments.length}
Período: ${assessments[0].completedAt.toLocaleDateString('pt-BR')} a ${assessments[assessments.length - 1].completedAt.toLocaleDateString('pt-BR')}
Sessões realizadas: ${completedSessions}
Metas definidas: ${goals.length} (${goalsAchieved} alcançadas)

Travas principais no início:
${topTravas.map(k => `- ${TRAVA_META[k]?.name || k}: ${firstScores[k]?.normalized}% (${firstScores[k]?.band})`).join('\n')}

Evolução registrada:
${improvements.slice(0, 5).map(i => `- ${i.trava}: ${i.initial}% → ${i.final}% (redução de ${i.change} pontos)`).join('\n')}

Responda em JSON com a estrutura:
{
  "summary": "Resumo executivo do case (2-3 frases)",
  "context": "Contexto anonimizado do cliente quando buscou ajuda (sem detalhes sensíveis)",
  "journey": "Narrativa da jornada de transformação",
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "outcome": "Resultados mensuráveis alcançados",
  "methodology": "Como a abordagem Tharrus foi aplicada",
  "suggestedTitle": "Título atraente para o case study"
}`;

  try {
    const llmResponse = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.4-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 2000,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!llmResponse.ok) {
      console.error('LLM error:', await llmResponse.text());
      return NextResponse.json({ error: 'Erro ao gerar case study.' }, { status: 500 });
    }

    const llmData = await llmResponse.json();
    const raw = llmData?.choices?.[0]?.message?.content ?? '{}';
    let narrative: any;
    try { narrative = JSON.parse(raw); } catch { narrative = { summary: raw }; }

    const caseStudy = await prisma.caseStudy.create({
      data: {
        professionalId: session.user.id,
        clientId,
        title: narrative.suggestedTitle || `Case Study — ${anonymizedName}`,
        narrativeJson: JSON.stringify(narrative),
        travasFocus: JSON.stringify(topTravas),
        anonymizedName,
        consentGiven: true,
        consentDate: new Date(),
        status: 'draft',
      },
    });

    return NextResponse.json(caseStudy);
  } catch (error: any) {
    console.error('Error generating case study:', error);
    return NextResponse.json({ error: 'Erro interno ao gerar case study.' }, { status: 500 });
  }
}

// PUT: atualizar status de um case study
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { id, status: newStatus } = await request.json();
  if (!id || !['draft', 'published', 'archived'].includes(newStatus)) {
    return NextResponse.json({ error: 'ID e status válido são obrigatórios.' }, { status: 400 });
  }

  const study = await prisma.caseStudy.findFirst({ where: { id, professionalId: session.user.id } });
  if (!study) return NextResponse.json({ error: 'Case study não encontrado.' }, { status: 404 });

  const updated = await prisma.caseStudy.update({ where: { id }, data: { status: newStatus } });
  return NextResponse.json(updated);
}
