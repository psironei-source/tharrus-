export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

const SYSTEM_PROMPT = `Você é um especialista em reprogramação de crenças e autoconhecimento, usando a metodologia Tharrus.
Sua tarefa é gerar um manifesto pessoal de crenças fortalecedoras a partir do mapeamento de crenças limitantes do usuário.

Regras:
- Tom: acolhedor, empoderador, direto — NUNCA clínico ou patologizante.
- Linguagem: português brasileiro, 2ª pessoa do singular ("você").
- Cada crença fortalecedora deve ser uma reformulação realista e acionável, nunca superficialmente positiva.
- O manifesto final deve ser um texto fluido que o usuário possa ler diariamente como ritual de reprogramação.
- Responda APENAS em JSON válido.`;

// GET: listar manifestos do usuário
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const manifestos = await prisma.beliefManifesto.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(manifestos);
}

// POST: criar/gerar manifesto
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const body = await request.json();
  const { beliefs, travaKey = 'crencas', assessmentId, generateManifesto } = body;

  // beliefs: [{ limiting, origin, reinforcement, cost, empowering? }]
  if (!beliefs || !Array.isArray(beliefs) || beliefs.length === 0) {
    return NextResponse.json({ error: 'É necessário pelo menos uma crença mapeada.' }, { status: 400 });
  }

  // Salvar ou atualizar o mapeamento
  if (generateManifesto) {
    // Gerar manifesto narrativo via LLM
    const beliefsText = beliefs.map((b: any, i: number) => {
      return `Crença ${i + 1}:
- Limitante: ${b.limiting}
- Origem: ${b.origin}
- Como se reforça: ${b.reinforcement}
- Custo no dia a dia: ${b.cost}
- Substituição proposta: ${b.empowering || '(gere uma sugestão)'}`;
    }).join('\n\n');

    const userPrompt = `Com base no mapeamento de crenças abaixo, gere:
1. Uma crença fortalecedora para cada limitante (se não fornecida)
2. Um manifesto pessoal fluido que integre todas as crenças fortalecedoras

Mapeamento:
${beliefsText}

Responda em JSON:
{
  "beliefs": [
    {
      "limiting": "...",
      "origin": "...",
      "reinforcement": "...",
      "cost": "...",
      "empowering": "crença fortalecedora substituta"
    }
  ],
  "manifesto": "Texto fluido do manifesto pessoal (3-5 parágrafos, em 1ª pessoa do singular, que o usuário possa ler diariamente)"
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
        return NextResponse.json({ error: 'Erro ao gerar manifesto.' }, { status: 500 });
      }

      const llmData = await llmResponse.json();
      const raw = llmData?.choices?.[0]?.message?.content ?? '{}';
      let result: any;
      try { result = JSON.parse(raw); } catch { result = { manifesto: raw }; }

      const enrichedBeliefs = result.beliefs || beliefs;
      const manifesto = await prisma.beliefManifesto.create({
        data: {
          userId: session.user.id,
          assessmentId: assessmentId || null,
          travaKey,
          beliefsJson: JSON.stringify(enrichedBeliefs),
          manifestoText: result.manifesto || null,
          status: 'finalized',
        },
      });

      return NextResponse.json(manifesto);
    } catch (error: any) {
      console.error('Error generating manifesto:', error);
      return NextResponse.json({ error: 'Erro interno ao gerar manifesto.' }, { status: 500 });
    }
  }

  // Salvar como rascunho (sem gerar manifesto)
  const manifesto = await prisma.beliefManifesto.create({
    data: {
      userId: session.user.id,
      assessmentId: assessmentId || null,
      travaKey,
      beliefsJson: JSON.stringify(beliefs),
      status: 'draft',
    },
  });

  return NextResponse.json(manifesto);
}

// PUT: atualizar um manifesto existente
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { id, beliefs, generateManifesto } = await request.json();
  if (!id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 });

  const existing = await prisma.beliefManifesto.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: 'Manifesto não encontrado.' }, { status: 404 });

  if (generateManifesto && beliefs) {
    // Re-gerar manifesto
    const beliefsText = beliefs.map((b: any, i: number) => {
      return `Crença ${i + 1}:\n- Limitante: ${b.limiting}\n- Fortalecedora: ${b.empowering}`;
    }).join('\n\n');

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
            { role: 'user', content: `Gere um manifesto pessoal fluido integrando estas crenças fortalecedoras:\n${beliefsText}\n\nResponda em JSON: { "manifesto": "texto em 1ª pessoa do singular, 3-5 parágrafos" }` },
          ],
          max_tokens: 1500,
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
      });

      if (llmResponse.ok) {
        const llmData = await llmResponse.json();
        const raw = llmData?.choices?.[0]?.message?.content ?? '{}';
        let result: any;
        try { result = JSON.parse(raw); } catch { result = {}; }

        const updated = await prisma.beliefManifesto.update({
          where: { id },
          data: { beliefsJson: JSON.stringify(beliefs), manifestoText: result.manifesto || existing.manifestoText, status: 'finalized' },
        });
        return NextResponse.json(updated);
      }
    } catch (e: any) {
      console.error('LLM error on PUT:', e);
    }
  }

  const updated = await prisma.beliefManifesto.update({
    where: { id },
    data: { beliefsJson: beliefs ? JSON.stringify(beliefs) : undefined },
  });
  return NextResponse.json(updated);
}
