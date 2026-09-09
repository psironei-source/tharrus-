// Motor de recomendação de trilha de sessões
// Baseado no perfil de travas do cliente

import { SESSION_PHASES, TOOLS_BY_PHASE, SUGGESTED_QUESTIONS } from './pro-questions';
import { TRAVA_META } from './questions';

export interface TrailStep {
  sessionNumber: number;
  phase: string;
  phaseName: string;
  title: string;
  objective: string;
  toolSuggested: string;
  suggestedQuestions: string[];
}

export function generateTrail(
  scores: { travaKey: string; normalized: number; band: string }[]
): TrailStep[] {
  const sorted = [...scores].sort((a, b) => b.normalized - a.normalized);
  const topTravas = sorted.slice(0, 3); // 3 travas mais críticas
  const steps: TrailStep[] = [];
  let num = 1;

  // Fase 1: Sinergia (sessões 1-2)
  steps.push({
    sessionNumber: num++,
    phase: 'sinergia',
    phaseName: 'Construção de Sinergia',
    title: 'Acolhimento e alinhamento',
    objective: 'Estabelecer vínculo de confiança, entender expectativas do cliente e apresentar a metodologia.',
    toolSuggested: 'Escala SDR',
    suggestedQuestions: [
      'O que te trouxe até aqui hoje?',
      'O que você espera conquistar com esse processo?',
      'Como você se sente em relação a olhar para dentro de si?',
    ],
  });
  steps.push({
    sessionNumber: num++,
    phase: 'sinergia',
    phaseName: 'Construção de Sinergia',
    title: 'Diagnóstico das 8 Travas',
    objective: 'Aplicar e revisar o questionário das 8 travas neuropsicológicas com o cliente.',
    toolSuggested: 'Diagnóstico das 8 Travas',
    suggestedQuestions: [
      'O que mais chamou sua atenção no resultado?',
      'Algum resultado te surpreendeu?',
      'Você se reconhece nesse perfil?',
    ],
  });

  // Fase 2: Plano (sessões 3-4)
  steps.push({
    sessionNumber: num++,
    phase: 'plano',
    phaseName: 'Plano de Trabalho',
    title: 'Inventário Pessoal e Objetivos',
    objective: 'Definir objetivos claros e criar o plano de ação com o Sistema 10-4-1.',
    toolSuggested: 'Sistema 10-4-1',
    suggestedQuestions: [
      'Se pudesse resolver uma única coisa na sua vida agora, o que seria?',
      'O que te impede de começar?',
      'Qual o menor passo que você pode dar essa semana?',
    ],
  });
  steps.push({
    sessionNumber: num++,
    phase: 'plano',
    phaseName: 'Plano de Trabalho',
    title: 'Bússola de Ação',
    objective: 'Estruturar o plano de ação com prazos, responsáveis e passos concretos.',
    toolSuggested: 'Bússola de Ação',
    suggestedQuestions: [
      'O que precisa acontecer primeiro para você avançar?',
      'Quem pode te apoiar nesse processo?',
      'Qual será seu critério de sucesso?',
    ],
  });

  // Fase 3: Desenvolvimento (uma sessão por trava crítica)
  for (const trava of topTravas) {
    const meta = TRAVA_META[trava.travaKey];
    if (!meta) continue;
    const questions = SUGGESTED_QUESTIONS[trava.travaKey] ?? [];
    const tools = TOOLS_BY_PHASE['desenvolvimento'] ?? [];

    steps.push({
      sessionNumber: num++,
      phase: 'desenvolvimento',
      phaseName: 'Desenvolvimento e Ações',
      title: `Trabalhando: ${meta.name}`,
      objective: `Aprofundar na trava "${meta.name}" (pontuação: ${trava.normalized}%). ${meta.definition}`,
      toolSuggested: tools[0] ?? 'Diálogo Interior',
      suggestedQuestions: questions.slice(0, 3),
    });
  }

  // Fase 4: Conclusão
  steps.push({
    sessionNumber: num++,
    phase: 'conclusao',
    phaseName: 'Conclusão',
    title: 'Reavaliação e Fechamento',
    objective: 'Reaplicar o diagnóstico, comparar evolução (antes/depois) e definir próximos passos.',
    toolSuggested: 'Reavaliação das 8 Travas',
    suggestedQuestions: [
      'O que mudou em você desde o início do processo?',
      'Qual foi a descoberta mais importante?',
      'O que você leva daqui para frente?',
    ],
  });

  return steps;
}
