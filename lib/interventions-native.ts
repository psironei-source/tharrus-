/**
 * Biblioteca nativa de intervenções por trava.
 * Baseada nas ferramentas da apostila de Neuromentoring.
 */

export interface NativeIntervention {
  name: string;
  description: string;
  travaKey: string;
  toolKey: string;
  instructions: string;
}

export const NATIVE_INTERVENTIONS: NativeIntervention[] = [
  // Crenças Autolimitantes
  {
    name: 'Mapeamento Cruzado de Crenças',
    description: 'Identifica a origem, reforço e custo de uma crença limitante e gera o manifesto de substituição.',
    travaKey: 'crencas',
    toolKey: 'mapeamento_crencas',
    instructions: 'Guie o cliente para identificar uma crença limitante central. Explore: de onde veio (origem), o que mantém essa crença viva (reforço), e qual o preço que está pagando por acreditar nela (custo). Depois, co-construa um "manifesto" — nova crença que será cultivada intencionalmente.',
  },
  {
    name: 'Inventário de Crenças por Área',
    description: 'Levantamento de crenças sobre EU, OUTRO, VIDA, TRABALHO e DINHEIRO.',
    travaKey: 'crencas',
    toolKey: 'inventario_crencas',
    instructions: 'Peça ao cliente que liste pelo menos 3 crenças fortes sobre cada área (eu, outro, vida, trabalho, dinheiro). Depois classifique como "me serve" ou "me limita".',
  },
  // Estratégias de Autoproteção
  {
    name: 'Identificação de Estratégias Defensivas',
    description: 'Mapeia os mecanismos defensivos mais usados e seus gatilhos.',
    travaKey: 'autoprotecao',
    toolKey: 'estrategias_defensivas',
    instructions: 'Explore com o cliente os padrões de defesa: perfeccionismo, evitação, controle excessivo, dependência emocional. Para cada um identificado, mapeie: gatilho, comportamento, consequência.',
  },
  {
    name: 'Exercício de Exposição Gradual',
    description: 'Planejamento de pequenas ações que desafiam o padrão protetor.',
    travaKey: 'autoprotecao',
    toolKey: 'exposicao_gradual',
    instructions: 'A partir da estratégia defensiva principal, defina 3 pequenas ações (nível 1-3 de desconforto) que desafiem o padrão, com prazo de 1 semana cada.',
  },
  // Diálogo Interno Disfuncional
  {
    name: 'Tabela do Diálogo Interior',
    description: 'Palavra → Significado → Sentimento → Comportamento → Resultado.',
    travaKey: 'dialogo',
    toolKey: 'dialogo_interior',
    instructions: 'Para cada frase interna limitante, preencha: Qual palavra/frase repete? O que significa para você? Que sentimento gera? Que comportamento provoca? Que resultado produz na sua vida?',
  },
  {
    name: 'Reestruturação de Diálogo',
    description: 'Substituir falas internas limitantes por versões funcionais.',
    travaKey: 'dialogo',
    toolKey: 'reestruturacao_dialogo',
    instructions: 'Para cada frase interna limitante identificada, co-construa: versão funcional alternativa, evidências que sustentam a nova versão, um compromisso de ação.',
  },
  // Estados Emocionais
  {
    name: 'Mapa de Estados Emocionais',
    description: 'Identificar as emoções dominantes e seus padrões de ativação.',
    travaKey: 'emocional',
    toolKey: 'mapa_emocional',
    instructions: 'Liste as 5 emoções mais frequentes do cliente na semana. Para cada uma: gatilho, intensidade (1-10), duração, impacto no dia.',
  },
  {
    name: 'Ciclo de Pensar e Sentir',
    description: 'Reflexão guiada sobre pensamentos automáticos e emoções associadas.',
    travaKey: 'emocional',
    toolKey: 'ciclo_pensar_sentir',
    instructions: 'Peça ao cliente que descreva uma situação recente que gerou emoção forte. Mapeie: situação → pensamento automático → emoção → reação → resultado.',
  },
  // Mentalidade Fixa
  {
    name: 'Exercício de Flexibilidade Mental',
    description: 'Desafiando rigidezes de pensamento com perspectivas alternativas.',
    travaKey: 'mentalidade',
    toolKey: 'flexibilidade_mental',
    instructions: 'Identifique 3 crenças rígidas. Para cada uma, explore: "E se o oposto fosse verdade?", "Quem pensa diferente de mim sobre isso?", "Em que contexto essa crença não vale?".',
  },
  {
    name: 'Prática de Mentalidade de Crescimento',
    description: 'Reframing de fracasso como aprendizado.',
    travaKey: 'mentalidade',
    toolKey: 'mentalidade_crescimento',
    instructions: 'Liste 3 "fracassos" recentes. Para cada um: o que aprendeu? O que faria diferente? Qual habilidade desenvolveu no processo?',
  },
  // Falta de Clareza Mental
  {
    name: 'Exercício de Ganho de Clareza',
    description: 'Técnica de foco para definir direção antes de agir.',
    travaKey: 'clareza',
    toolKey: 'ganho_clareza',
    instructions: 'Responda: O que realmente quero? O que é importante nisso? Qual o primeiro passo concreto? O que está me impedindo? O que posso fazer AGORA?',
  },
  {
    name: 'Ritual de Ativação e Crescimento',
    description: 'Checklist diário com as 4 perguntas cruciais.',
    travaKey: 'clareza',
    toolKey: 'ritual_ativacao',
    instructions: 'Estabeleça o ritual diário: manhã (O que vou criar hoje? O que vou aprender?) e noite (O que conquistei? O que agradeço?). Tracked semanalmente.',
  },
  // Autoimagem Desfavorável
  {
    name: 'Inventário de Forças e Conquistas',
    description: 'Reconhecimento de qualidades, habilidades e vitórias pessoais.',
    travaKey: 'autoimagem',
    toolKey: 'inventario_forcas',
    instructions: 'Liste: 10 qualidades, 10 conquistas (de qualquer tamanho), 5 elogios recebidos que desqualificou. Reflita sobre o padrão de desvalorização.',
  },
  {
    name: 'Exercício de Autovalidação',
    description: 'Substituir busca por validação externa por reconhecimento interno.',
    travaKey: 'autoimagem',
    toolKey: 'autovalidacao',
    instructions: 'Diariamente, registre 3 coisas que fez bem HOJE, sem precisar de aprovação de ninguém. Revise semanalmente para notar padrões.',
  },
  // Estratégia Equivocada
  {
    name: 'Sistema de Realização Progressiva 10-4-1',
    description: 'Funil de objetivos para criar método estruturado.',
    travaKey: 'estrategia',
    toolKey: 'sistema_10_4_1',
    instructions: 'Liste 10 coisas que quer conquistar. Escolha 4 prioritárias. Escolha A 1 mais importante. Para ela, crie um plano com passos concretos e prazos.',
  },
  {
    name: 'Bússola de Ação',
    description: 'Plano de ação estruturado com 8 colunas estratégicas.',
    travaKey: 'estrategia',
    toolKey: 'bussola',
    instructions: 'Para a meta definida, preencha: Ação, Data, Território, Responsável, Motivo, Como, Custo, Status. Acompanhe semanalmente.',
  },
];

/**
 * Retorna intervenções nativas filtradas por trava.
 */
export function getInterventionsByTrava(travaKey: string): NativeIntervention[] {
  return NATIVE_INTERVENTIONS.filter(i => i.travaKey === travaKey);
}

/**
 * Retorna todas as travas que têm intervenções disponíveis.
 */
export function getTravasWithInterventions(): string[] {
  return [...new Set(NATIVE_INTERVENTIONS.map(i => i.travaKey))];
}
