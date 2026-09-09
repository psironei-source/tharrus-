export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { ALL_QUESTIONS, TRAVA_META, normalizeAnswers } from '@/lib/questions';
import { calculateScores, type TravaScoreResult } from '@/lib/scoring';
import { findPatternName } from '@/lib/pattern-names';
import { calculateTravaCorrelations } from '@/lib/analytics-engine';
import { getInterventionsByTrava } from '@/lib/interventions-native';

// Mapeamento trava → ferramenta recomendada (Seção 11, Bloco 4, Parte 5)
function getRecommendedTools(travaKey: string): string[] {
  const interventions = getInterventionsByTrava(travaKey);
  return interventions.slice(0, 2).map(i => i.name);
}

// Gera o relatório aprimorado (Seção 11) usando LLM
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

    const scores = calculateScores(answersMap, ALL_QUESTIONS);
    const sorted = [...scores].sort((a, b) => b.normalized - a.normalized);

    // Top questions per trava (as que mais pesaram)
    const topQuestionsPerTrava: Record<string, { text: string; value: number }[]> = {};
    for (const s of scores) {
      topQuestionsPerTrava[s.travaKey] = (s.topQuestionIds ?? []).map(qid => {
        const q = ALL_QUESTIONS.find(qq => qq.id === qid);
        return { text: q?.text ?? '', value: answersMap[qid] ?? 0 };
      }).filter(r => r.text);
    }

    // Padrão dominante (tabela curada)
    const topKeys = sorted.filter(s => s.band !== 'baixa').map(s => s.travaKey);
    const curatedPattern = findPatternName(topKeys.length >= 2 ? topKeys : sorted.slice(0, 3).map(s => s.travaKey));

    // Correlações entre travas (para bloco 6)
    let correlationNarrative = '';
    try {
      // Buscar histórico de avaliações do usuário
      const allScores = await prisma.travaScore.findMany({
        where: { assessment: { userId: session.user.id, completedAt: { not: undefined } } },
        select: { assessmentId: true, travaKey: true, normalized: true },
      });
      if (allScores.length > 0) {
        const corr = calculateTravaCorrelations(allScores);
        const topCorr = corr.sort((a, b) => Math.abs(b.strength) - Math.abs(a.strength)).slice(0, 3);
        if (topCorr.length > 0) {
          correlationNarrative = topCorr.map(c => {
            const n1 = (TRAVA_META as any)[c.from]?.shortName ?? c.from;
            const n2 = (TRAVA_META as any)[c.to]?.shortName ?? c.to;
            return `${n1} e ${n2} (correlação ${c.strength > 0 ? 'positiva' : 'negativa'}: ${Math.abs(c.strength).toFixed(2)})`;
          }).join('; ');
        }
      }
    } catch {
      // silently ignore
    }

    // Recursos internos (travas de baixa pontuação)
    const lowTravas = sorted.filter(s => s.band === 'baixa').slice(0, 2);

    // Calcular total de itens respondidos (para Bloco 0)
    const totalAnswered = assessment.answers?.length ?? 0;

    // Low reliability flag
    const lowReliability = assessment.lowReliability ?? false;

    // Montar prompt para o LLM (inclui Bloco 9)
    const prompt = buildLLMPrompt(sorted, topQuestionsPerTrava, curatedPattern, correlationNarrative, lowTravas);

    // Chamar LLM API
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
          { role: 'user', content: prompt },
        ],
        max_tokens: 4000,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!llmResponse.ok) {
      const err = await llmResponse.text();
      console.error('LLM API error:', err);
      return NextResponse.json({ error: 'Erro ao gerar relatório aprimorado.' }, { status: 500 });
    }

    const llmData = await llmResponse.json();
    const rawContent = llmData?.choices?.[0]?.message?.content ?? '{}';
    let enhanced: any;
    try {
      enhanced = JSON.parse(rawContent);
    } catch {
      console.error('Failed to parse LLM JSON:', rawContent.slice(0, 500));
      return NextResponse.json({ error: 'Erro ao processar relatório.' }, { status: 500 });
    }

    // ── Validação de completude: Bloco 8 (Fechamento com Convite) e
    //    Bloco 9 (Narrativa Integrada em texto corrido). Nenhum relatório
    //    pode sair sem esses dois blocos (checklist de pré-lançamento, §2).
    const missing = missingBlocks(enhanced);
    if (missing.length > 0) {
      const repaired = await repairBlocks(missing, prompt);
      for (const key of missing) {
        if (repaired[key] && isValidBlock(key, repaired[key])) {
          enhanced[key] = repaired[key];
        }
      }
    }
    // Fallback determinístico: se ainda faltar, preenchemos com texto próprio
    // em vez de entregar um relatório incompleto ao usuário.
    for (const key of missingBlocks(enhanced)) {
      enhanced[key] = key === 'closing_invite'
        ? fallbackClosingInvite(sorted)
        : fallbackNarrativa(sorted);
    }

    // Montar resposta completa
    return NextResponse.json({
      id: assessment.id,
      completedAt: assessment.completedAt?.toISOString?.() ?? '',
      totalAnswered,
      scores: sorted.map(s => ({
        travaKey: s.travaKey,
        name: (TRAVA_META as any)[s.travaKey]?.shortName ?? s.travaKey,
        normalized: s.normalized,
        band: s.band,
        consistency: s.consistency,
        variance: s.variance,
      })),
      // Blocos gerados
      momentoEspelho: enhanced.momento_espelho ?? '',
      patternName: curatedPattern?.name ?? enhanced.pattern_name ?? null,
      patternDescription: curatedPattern?.description ?? enhanced.pattern_description ?? null,
      patternFoundation: enhanced.pattern_foundation ?? null,
      travaCards: sorted.map(s => {
        const key = s.travaKey;
        const cardData = enhanced.trava_cards?.[key] ?? {};
        const meta = (TRAVA_META as any)[key];
        return {
          travaKey: key,
          name: meta?.name ?? key,
          shortName: meta?.shortName ?? key,
          definition: meta?.definition ?? '',
          icon: meta?.icon ?? 'brain',
          normalized: s.normalized,
          band: s.band,
          consistency: s.consistency,
          consistencyText: s.consistency === 'alta'
            ? 'Suas respostas nessa trava foram consistentes entre si, o que indica um padrão que se repete, não algo pontual.'
            : 'Suas respostas variaram bastante, o que sugere que esse padrão aparece com mais força em contextos específicos, não no dia a dia geral.',
          comoAparece: cardData.como_aparece ?? '',
          mecanismoProvavel: cardData.mecanismo_provavel ?? cardData.de_onde_vem ?? '',
          oqueCusta: cardData.oque_custa ?? '',
          oqueNaoSignifica: cardData.oque_nao_significa ?? '',
          ferramentaRecomendada: getRecommendedTools(key),
          topResponses: (topQuestionsPerTrava[key] ?? []).slice(0, 3),
          professionalReferral: ['estrategia', 'emocional', 'autoimagem'].includes(key) && s.band === 'alta'
            ? getReferralText(key) : null,
        };
      }),
      narrativaIntegrada: enhanced.narrativa_integrada ?? '',
      connectionMap: enhanced.connection_map ?? '',
      internalResources: enhanced.internal_resources ?? '',
      closingInvite: enhanced.closing_invite ?? '',
      lowReliability,
    });
  } catch (error: any) {
    console.error('Enhanced report error:', error);
    return NextResponse.json({ error: 'Erro ao gerar relatório.' }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// Validação de completude dos Blocos 8 e 9
// ─────────────────────────────────────────────────────────────
const BULLET_START = /^\s*(?:[-*•–—]|\d+[.)])\s+/;

function looksLikeBulletList(text: string): boolean {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return true;
  if (BULLET_START.test(lines[0])) return true;
  const bulletLines = lines.filter(l => BULLET_START.test(l)).length;
  return bulletLines >= 2;
}

function isValidBlock(key: string, value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const text = value.trim();
  if (key === 'closing_invite') {
    return text.length >= 120;
  }
  // narrativa_integrada: texto corrido, nunca lista
  return text.length >= 500 && !looksLikeBulletList(text);
}

function missingBlocks(enhanced: any): string[] {
  return (['narrativa_integrada', 'closing_invite'] as const).filter(
    key => !isValidBlock(key, enhanced?.[key])
  );
}

async function repairBlocks(missing: string[], originalPrompt: string): Promise<Record<string, string>> {
  const specs = missing
    .map(key =>
      key === 'closing_invite'
        ? '- "closing_invite": Bloco 8 — fechamento com convite. 2 a 4 parágrafos curtos, tom acolhedor, 2ª pessoa, terminando com um convite concreto de próximo passo. Mínimo 150 caracteres.'
        : '- "narrativa_integrada": Bloco 9 — narrativa integrada de 300 a 500 palavras, EXCLUSIVAMENTE em texto corrido (parágrafos). Proibido usar listas, marcadores, hífens no início de linha ou numeração. Conecte as 2-3 travas dominantes em uma única história coerente.'
    )
    .join('\n');

  try {
    const res = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.4-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: originalPrompt },
          {
            role: 'user',
            content: `Os blocos abaixo ficaram ausentes ou fora do formato exigido. Gere APENAS eles, em um objeto JSON com exatamente estas chaves:\n${specs}`,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) return {};
    const data = await res.json();
    return JSON.parse(data?.choices?.[0]?.message?.content ?? '{}');
  } catch {
    return {};
  }
}

function travaNames(sorted: TravaScoreResult[], count: number): string[] {
  return sorted.slice(0, count).map(s => (TRAVA_META as any)[s.travaKey]?.shortName ?? s.travaKey);
}

function fallbackNarrativa(sorted: TravaScoreResult[]): string {
  const [a, b, c] = travaNames(sorted, 3);
  const low = sorted[sorted.length - 1];
  const lowName = (TRAVA_META as any)[low?.travaKey]?.shortName ?? 'outras áreas';
  return `O que aparece com mais força na sua leitura é ${a}. Não como um defeito de caráter, mas como uma estratégia que em algum momento fez sentido e foi ficando automática. Ela costuma se ativar justamente nas situações que mais importam para você, e é por isso que dá a impressão de que você trava sempre no mesmo ponto.\n\nLogo atrás vem ${b}, e as duas se alimentam. Quando ${a} entra em cena, ${b} ganha espaço para confirmar a leitura que você já faz de si mesmo; e quando ${b} aperta, ${a} volta como forma de reduzir o desconforto no curto prazo. Esse ciclo é curto, rápido e quase invisível enquanto está acontecendo — só percebemos o resultado depois. ${c ? `${c} aparece na sequência e costuma agir como pano de fundo, dando o tom emocional em que esse ciclo acontece.` : ''}\n\nO ponto importante é que nada disso descreve quem você é. Descreve o que você faz sob pressão, e isso é modificável. A própria leitura mostra que ${lowName} está entre as suas áreas mais livres: existe terreno firme aí, e é dele que costuma sair a energia para começar a mexer no resto.\n\nSe houvesse um único lugar para começar, seria observar o instante em que ${a} se ativa — antes da reação, não depois. Não para se controlar, mas para ganhar meio segundo de escolha onde hoje existe piloto automático. É nesse meio segundo que a mudança real acontece.`;
}

function fallbackClosingInvite(sorted: TravaScoreResult[]): string {
  const [a] = travaNames(sorted, 1);
  return `Este relatório não é um veredito sobre você. É uma fotografia de como você funciona hoje, feita a partir das suas próprias respostas — e fotografias podem ser refeitas.\n\nO convite é simples: escolha uma única frente para os próximos trinta dias, de preferência ${a}. Observe quando ela aparece, o que a dispara e o que você faz logo depois. Anote sem julgamento. Em trinta ou sessenta dias, refaça a avaliação e compare.\n\nMudança não vem de entender tudo de uma vez. Vem de olhar para uma coisa de perto, com honestidade, o tempo suficiente para que ela pare de agir no escuro.`;
}

function getReferralText(key: string): string {
  const map: Record<string, string> = {
    estrategia: '💙 Se você percebe que alguns padrões de comportamento estão difíceis de mudar sozinho(a), saiba que buscar apoio especializado é um ato de coragem. Um(a) psicólogo(a), psiquiatra ou grupo de apoio pode oferecer ferramentas poderosas para essa jornada.',
    emocional: '💙 Emoções intensas e frequentes merecem atenção especial. Considere conversar com um(a) profissional de saúde mental que pode ajudá-lo(a) a desenvolver estratégias de regulação emocional.',
    autoimagem: '💙 Quando a forma como nos vemos causa sofrimento constante, é importante buscar apoio especializado. Um(a) psicólogo(a) pode ajudá-lo(a) a reconstruir uma relação mais saudável consigo mesmo(a).',
  };
  return map[key] ?? '';
}

const SYSTEM_PROMPT = `Você é o motor de geração de relatórios do Tharrus, uma plataforma de autoconhecimento baseada em Neuromentoring.

Regras ABSOLUTAS:
- Tom: acolhedor, direto, 2ª pessoa, sem jargão clínico
- NUNCA usar linguagem determinista/patologizante ("você é...", "você sofre de...")
- Preferir linguagem de padrão atual: "você tende a...", "esse padrão aparece quando..."
- Cada frase deve estar ancorada nas respostas específicas do usuário (fornecidas como contexto)
- Na trava "Estratégia Equivocada": NUNCA mencionar substâncias, quantidades ou frequência de uso. Falar apenas de padrões comportamentais.
- Variar as frases para cada trava/faixa (nunca textos idênticos entre relatórios)
- Idioma: pt-BR

Responda APENAS com JSON válido, sem markdown, sem comentários.`;

function buildLLMPrompt(
  sorted: TravaScoreResult[],
  topQuestions: Record<string, { text: string; value: number }[]>,
  pattern: { name: string; description: string } | null,
  correlationNarrative: string,
  lowTravas: TravaScoreResult[]
): string {
  const travasSummary = sorted.map(s => {
    const meta = (TRAVA_META as any)[s.travaKey];
    const qs = (topQuestions[s.travaKey] ?? []).map(q => `"${q.text}" (nota ${q.value}/5)`).join('; ');
    return `- ${meta?.name} (${s.travaKey}): ${s.normalized}/100, faixa ${s.band}. Respostas que mais pesaram: ${qs || 'N/A'}`;
  }).join('\n');

  const lowNames = lowTravas.map(s => (TRAVA_META as any)[s.travaKey]?.name ?? s.travaKey);
  const topTrava = sorted[0];
  const topMeta = (TRAVA_META as any)[topTrava?.travaKey];

  return `Gere o relatório personalizado para este usuário.

Dados do mapeamento:
${travasSummary}

Padrão dominante curado: ${pattern ? `"${pattern.name}" — ${pattern.description}` : 'Não mapeado (gere um nome de arquétipo combinando as 2-3 travas mais altas)'}

Correlações entre travas: ${correlationNarrative || 'Dados insuficientes para correlação'}

Travas de baixa pontuação (recursos internos): ${lowNames.join(', ') || 'Nenhuma'}

Trava #1 do ranking: ${topMeta?.name} (${topTrava?.travaKey})

Gere o JSON com esta estrutura EXATA:
{
  "momento_espelho": "2-3 frases de abertura descrevendo o padrão mais forte em linguagem de cena/comportamento concreto, usando os itens do questionário que mais pesaram",
  "pattern_name": "Nome do arquétipo (use o curado se fornecido, ou gere um)",
  "pattern_description": "Frase curta do padrão",
  "pattern_foundation": "Frase de fundamentação quantitativa — ex: 'Essa combinação concentra a maior parte da energia do seu perfil atual: as duas travas aparecem em X dos Y itens de maior peso.'",
  "trava_cards": {
    "TRAVA_KEY": {
      "como_aparece": "Como isso aparece em você — reformular os itens específicos do questionário como observação de comportamento real",
      "mecanismo_provavel": "Mecanismo psicológico geral por trás do padrão (ex: regulação emocional evitativa, esquema de desvalor). Usar um termo técnico explicado em linguagem simples. SEMPRE fechar com: 'Isso é uma hipótese com base no seu padrão de respostas, não uma conclusão clínica.'",
      "oque_custa": "O que isso custa hoje — impacto concreto no dia a dia (relacionamentos, trabalho, energia, saúde emocional)",
      "oque_nao_significa": "O que isso NÃO significa sobre você — descolamento entre comportamento e identidade, reforçando que é padrão atual, não permanente"
    }
    // para CADA uma das 8 travas
  },
  "narrativa_integrada": "Texto corrido de 300-500 palavras (NUNCA em tópicos ou bullet points) respondendo 'por que eu ajo assim'. Integra as 2-3 travas dominantes em UMA ÚNICA narrativa causal de vida, não uma lista. Conecta pelo menos 2 comportamentos cotidianos diferentes mostrando que nascem da mesma raiz. Formato: 'Isso explica por que você [comportamento A] e, ao mesmo tempo, [comportamento B] — os dois nascem da mesma raiz: [mecanismo comum].' Fechar com 2-3 frases sobre o 'potencial represado' que se abre quando esse padrão é trabalhado. Tom mais literário e envolvente que os cards. Linguagem de possibilidade, nunca promessa.",
  "connection_map": "2-3 frases narrativas como cadeia causal: [Trava A] abre espaço para [comportamento]; [Trava B] entra como [função]. O resultado é [padrão observável].",
  "internal_resources": "Destaque de 1-2 travas com pontuação baixa como pontos fortes/recursos disponíveis para apoiar a mudança",
  "closing_invite": "Um único próximo passo pequeno e concreto, ligado à trava #1, em linguagem de convite ('experimente', 'que tal'). OBRIGATÓRIO — nunca omitir."
}

IMPORTANTE:
- Para "momento_espelho": use linguagem de CENA ("Você entrega mais do que o combinado, evita dizer não..."), NUNCA de traço abstrato ("Você tem tendência a se autoproteger")
- Para "oque_nao_significa": OBRIGATÓRIO em travas de faixa moderada e alta, reforçando que o padrão é atual, não identidade permanente
- Para padrão dominante sem curadoria: gere um nome memorável, nunca pejorativo, sempre com dignidade
- Todas as 8 chaves de trava devem estar em trava_cards: crencas, autoprotecao, dialogo, emocional, mentalidade, clareza, autoimagem, estrategia
- Na trava "estrategia": ZERO menção a substâncias
- OBRIGATÓRIO: "mecanismo_provavel" deve variar a estrutura sintática entre travas (nunca repetir a mesma frase-molde)
- OBRIGATÓRIO: "pattern_foundation" deve conter frase com dados quantitativos reais (não genérica)
- OBRIGATÓRIO: "closing_invite" não pode estar vazio — é o bloco mais importante para percepção de valor
- OBRIGATÓRIO: "narrativa_integrada" deve ser TEXTO CORRIDO (300-500 palavras), NUNCA lista de tópicos/bullets. É a página de maior impacto emocional do relatório. Tom literário, envolvente, conectando comportamentos variados a uma raiz comum.`;
}
