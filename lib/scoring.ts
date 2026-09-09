// Motor de pontuação determinístico para as 8 Travas

import { TRAVA_KEYS, type Question } from './questions';

export interface TravaScoreResult {
  travaKey: string;
  rawAverage: number;
  normalized: number; // 0-100
  band: 'baixa' | 'moderada' | 'alta';
  topQuestionIds: string[]; // IDs das perguntas que mais pesaram
  consistency: 'alta' | 'baixa'; // Seção 11 - consistência interna
  variance: number; // variância das respostas
  answeredCount: number; // total de itens respondidos
}

export interface ControlValidation {
  valid: boolean;
  failedControls: string[];
  lowReliability: boolean; // Seção 13.9: 2+ controles errados
}

export function calculateScores(
  answers: Record<string, number>, // questionId → value (1-5)
  questions: Question[]
): TravaScoreResult[] {
  const scores: TravaScoreResult[] = [];

  for (const key of TRAVA_KEYS) {
    const travaQuestions = questions.filter((q: Question) => q.travaKey === key);
    if (travaQuestions.length === 0) continue;

    const values: { id: string; value: number }[] = [];
    for (const q of travaQuestions) {
      const raw = answers?.[q.id];
      if (raw === undefined || raw === null) continue;
      const val = q.reverse ? (6 - raw) : raw;
      values.push({ id: q.id, value: val });
    }

    if (values.length === 0) {
      scores.push({ travaKey: key, rawAverage: 0, normalized: 0, band: 'baixa', topQuestionIds: [], consistency: 'alta', variance: 0, answeredCount: 0 });
      continue;
    }

    const sum = values.reduce((acc: number, v: { id: string; value: number }) => acc + v.value, 0);
    const rawAverage = sum / values.length;
    // Normalizar de 1-5 para 0-100
    const normalized = Math.round(((rawAverage - 1) / 4) * 100);

    let band: 'baixa' | 'moderada' | 'alta' = 'baixa';
    if (normalized >= 67) band = 'alta';
    else if (normalized >= 34) band = 'moderada';

    // Cálculo de consistência interna (variância entre respostas)
    const variance = values.length > 1
      ? values.reduce((acc, v) => acc + Math.pow(v.value - rawAverage, 2), 0) / values.length
      : 0;
    // Threshold: variância > 1.5 (em escala 1-5) = baixa consistência
    const consistency: 'alta' | 'baixa' = variance > 1.5 ? 'baixa' : 'alta';

    // Top 3 perguntas que mais pesaram (maiores valores)
    const sorted = [...values].sort((a: { id: string; value: number }, b: { id: string; value: number }) => b.value - a.value);
    const topQuestionIds = sorted.slice(0, 3).map((v: { id: string; value: number }) => v.id);

    scores.push({
      travaKey: key,
      rawAverage: Math.round(rawAverage * 100) / 100,
      normalized,
      band,
      topQuestionIds,
      consistency,
      variance: Math.round(variance * 100) / 100,
      answeredCount: values.length,
    });
  }

  // Ordenar por normalized desc (ranking)
  scores.sort((a: TravaScoreResult, b: TravaScoreResult) => b.normalized - a.normalized);

  return scores;
}

// Valida itens de controle de atenção (AT1-AT4)
// AT1: resposta correta = "Concordo" (valor 4)
// AT2: resposta correta = "Neutro" (valor 3)
// AT3: resposta correta = "Discordo" (valor 2)
// AT4: resposta correta = "Concordo totalmente" (valor 5)
export function validateControlQuestions(
  answers: Record<string, number>,
  questions: Question[]
): ControlValidation {
  const controls = questions.filter((q: Question) => q.travaKey === 'controle');
  const failedControls: string[] = [];

  for (const ctrl of controls) {
    const answer = answers?.[ctrl.id];
    if (answer === undefined || answer === null) continue;

    switch (ctrl.id) {
      case 'AT1': // "Concordo" = 4
        if (answer !== 4) failedControls.push(ctrl.id);
        break;
      case 'AT2': // "Neutro" = 3
        if (answer !== 3) failedControls.push(ctrl.id);
        break;
      case 'AT3': // "Discordo" = 2
        if (answer !== 2) failedControls.push(ctrl.id);
        break;
      case 'AT4': // "Concordo totalmente" = 5
        if (answer !== 5) failedControls.push(ctrl.id);
        break;
      // Compatibilidade com IDs antigos
      case 'ctrl1': // Era "Concordo" (4 ou 5)
        if (answer < 4) failedControls.push(ctrl.id);
        break;
      case 'ctrl2': // Era "Concordo" (4 ou 5)
        if (answer < 4) failedControls.push(ctrl.id);
        break;
      case 'ctrl3': // Era "Discordo totalmente" (1)
        if (answer > 2) failedControls.push(ctrl.id);
        break;
      case 'ctrl4': // Era "Concordo" (4 ou 5)
        if (answer < 4) failedControls.push(ctrl.id);
        break;
      case 'ctrl5': // Era "Discordo totalmente" (1)
        if (answer > 2) failedControls.push(ctrl.id);
        break;
    }
  }

  const lowReliability = failedControls.length >= 2;

  return {
    valid: failedControls.length <= 1,
    failedControls,
    lowReliability,
  };
}
