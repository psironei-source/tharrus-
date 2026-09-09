/**
 * Motor de análise avançada — Seção 10
 * Correlações entre travas, detecção de platô, tendência, risco de churn
 */

export interface TravaCorrelation {
  from: string;
  to: string;
  strength: number; // -1 a 1
}

export interface TravaTrend {
  travaKey: string;
  trend: 'improving' | 'stagnant' | 'worsening' | 'oscillating';
  avgChange: number; // variação média entre avaliações
  plateauCount: number; // quantas avaliações sem mudança significativa
  lastValue: number;
  values: number[];
  dates: string[];
}

export interface ChurnSignal {
  clientId: string;
  clientName: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number; // 0-100
  signals: string[];
}

// Calcula correlação de Pearson entre dois arrays
function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 3) return 0;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : Math.round((num / den) * 100) / 100;
}

/**
 * Calcula correlações cruzadas entre travas a partir do histórico de scores.
 * Cada score = { assessmentId, travaKey, normalized }
 * Agrupa por assessment e calcula Pearson entre pares de travas.
 */
export function calculateTravaCorrelations(
  scores: { assessmentId: string; travaKey: string; normalized: number }[]
): TravaCorrelation[] {
  // Agrupar por assessment
  const byAssessment = new Map<string, Map<string, number>>();
  for (const s of scores) {
    if (!byAssessment.has(s.assessmentId)) byAssessment.set(s.assessmentId, new Map());
    byAssessment.get(s.assessmentId)!.set(s.travaKey, s.normalized);
  }

  const travas = [...new Set(scores.map(s => s.travaKey))];
  const correlations: TravaCorrelation[] = [];

  for (let i = 0; i < travas.length; i++) {
    for (let j = i + 1; j < travas.length; j++) {
      const xVals: number[] = [];
      const yVals: number[] = [];
      for (const [, scoreMap] of byAssessment) {
        const x = scoreMap.get(travas[i]);
        const y = scoreMap.get(travas[j]);
        if (x !== undefined && y !== undefined) {
          xVals.push(x);
          yVals.push(y);
        }
      }
      const strength = pearsonCorrelation(xVals, yVals);
      if (Math.abs(strength) >= 0.3) {
        correlations.push({ from: travas[i], to: travas[j], strength });
      }
    }
  }

  return correlations.sort((a, b) => Math.abs(b.strength) - Math.abs(a.strength));
}

/**
 * Analisa tendência de cada trava ao longo de múltiplas avaliações.
 * Recebe scores ordenados por data (mais antigo primeiro).
 */
export function analyzeTravasTrends(
  assessments: { id: string; completedAt: string; scores: { travaKey: string; normalized: number }[] }[],
  plateauThreshold: number = 5 // variação menor que este % é platô
): TravaTrend[] {
  if (assessments.length < 2) return [];

  const travaTimeline = new Map<string, { values: number[]; dates: string[] }>();

  for (const a of assessments) {
    for (const s of a.scores) {
      if (!travaTimeline.has(s.travaKey)) travaTimeline.set(s.travaKey, { values: [], dates: [] });
      const t = travaTimeline.get(s.travaKey)!;
      t.values.push(s.normalized);
      t.dates.push(a.completedAt);
    }
  }

  const trends: TravaTrend[] = [];

  for (const [travaKey, timeline] of travaTimeline) {
    const { values, dates } = timeline;
    if (values.length < 2) continue;

    // Calcular mudanças consecutivas
    const changes: number[] = [];
    let plateauCount = 0;
    for (let i = 1; i < values.length; i++) {
      const change = values[i] - values[i - 1];
      changes.push(change);
      if (Math.abs(change) <= plateauThreshold) plateauCount++;
    }

    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    const lastValue = values[values.length - 1];

    let trend: TravaTrend['trend'];
    if (plateauCount >= Math.ceil(changes.length * 0.6)) {
      trend = 'stagnant';
    } else if (avgChange < -plateauThreshold) {
      trend = 'improving';
    } else if (avgChange > plateauThreshold) {
      trend = 'worsening';
    } else {
      // Checar se oscila (sobe e desce alternadamente)
      const ups = changes.filter(c => c > 0).length;
      const downs = changes.filter(c => c < 0).length;
      if (ups > 0 && downs > 0 && Math.abs(ups - downs) <= 1) {
        trend = 'oscillating';
      } else if (avgChange <= 0) {
        trend = 'improving';
      } else {
        trend = 'worsening';
      }
    }

    trends.push({ travaKey, trend, avgChange: Math.round(avgChange * 10) / 10, plateauCount, lastValue, values, dates });
  }

  return trends;
}

/**
 * Detecta se deve sugerir "recalcular rota" para uma trava.
 * Retorna true se a trava está em platô por N+ ciclos.
 */
export function shouldSuggestRouteChange(
  trend: TravaTrend,
  minPlateauCycles: number = 3
): boolean {
  return trend.trend === 'stagnant' && trend.plateauCount >= minPlateauCycles;
}

/**
 * Calcula risco de churn de um cliente.
 */
export function calculateChurnRisk(params: {
  daysSinceLastSession?: number;
  homeworkCompletionRate?: number; // 0-1
  diaryEntriesLast30Days?: number;
  avgSatisfactionRating?: number; // 0-10
  missedSessions?: number;
}): { riskLevel: 'low' | 'medium' | 'high'; riskScore: number; signals: string[] } {
  const { daysSinceLastSession = 0, homeworkCompletionRate = 1, diaryEntriesLast30Days = 5, avgSatisfactionRating = 8, missedSessions = 0 } = params;
  let score = 0;
  const signals: string[] = [];

  // Tempo sem sessão
  if (daysSinceLastSession > 30) { score += 25; signals.push('Mais de 30 dias sem sessão'); }
  else if (daysSinceLastSession > 14) { score += 10; signals.push('Mais de 14 dias sem sessão'); }

  // Adesão às tarefas
  if (homeworkCompletionRate < 0.3) { score += 25; signals.push('Baixa adesão às tarefas de casa (<30%)'); }
  else if (homeworkCompletionRate < 0.6) { score += 10; signals.push('Adesão moderada às tarefas (30-60%)'); }

  // Diário
  if (diaryEntriesLast30Days === 0) { score += 15; signals.push('Nenhuma entrada no diário nos últimos 30 dias'); }
  else if (diaryEntriesLast30Days < 3) { score += 5; signals.push('Poucas entradas no diário'); }

  // Satisfação
  if (avgSatisfactionRating < 5) { score += 20; signals.push('Satisfação média abaixo de 5'); }
  else if (avgSatisfactionRating < 7) { score += 10; signals.push('Satisfação média moderada (5-7)'); }

  // Faltas
  if (missedSessions >= 3) { score += 15; signals.push(`${missedSessions} sessões não atendidas`); }
  else if (missedSessions >= 1) { score += 5; signals.push(`${missedSessions} sessão(ões) não atendida(s)`); }

  const riskLevel = score >= 50 ? 'high' : score >= 25 ? 'medium' : 'low';
  return { riskLevel, riskScore: Math.min(score, 100), signals };
}

/**
 * Calcula correlação entre adesão (tarefas cumpridas) e melhora (queda de score).
 * Retorna um valor de -1 a 1 (negativo = mais tarefas → menor score = melhor).
 */
export function calculateAdherenceCorrelation(
  dataPoints: { adherenceRate: number; scoreChange: number }[]
): number {
  if (dataPoints.length < 3) return 0;
  return pearsonCorrelation(
    dataPoints.map(d => d.adherenceRate),
    dataPoints.map(d => d.scoreChange)
  );
}
