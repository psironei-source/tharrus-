// Banco de perguntas das 8 Travas Neuropsicológicas — Seção 13 (v7)
// IDs oficiais: CA1-CA8, EA1-EA8, DI1-DI8, EE1-EE8, MF1-MF8, FC1-FC8, AD1-AD8, EQ1-EQ8
// Controles: AT1-AT4

export interface Question {
  id: string;
  travaKey: string;
  text: string;
  reverse?: boolean;
}

export const TRAVA_META: Record<string, { name: string; shortName: string; definition: string; icon: string }> = {
  crencas: {
    name: 'Crenças Autolimitantes',
    shortName: 'Crenças',
    definition: 'Crenças distorcidas sobre si, o outro, a vida, o trabalho e o dinheiro que limitam suas possibilidades.',
    icon: 'brain',
  },
  autoprotecao: {
    name: 'Estratégias de Autoproteção',
    shortName: 'Autoproteção',
    definition: 'Comportamentos defensivos inconscientes como perfeccionismo, controle excessivo e evitação de conflitos.',
    icon: 'shield',
  },
  dialogo: {
    name: 'Diálogo Interno Disfuncional',
    shortName: 'Diálogo Interno',
    definition: 'Padrões de fala interna limitante que reforçam incapacidade e impotência.',
    icon: 'message-circle',
  },
  emocional: {
    name: 'Estados Emocionais Não Regulados',
    shortName: 'Estados Emocionais',
    definition: 'Emoções intensas (raiva, medo, culpa, vergonha) que dominam o comportamento de forma recorrente.',
    icon: 'heart',
  },
  mentalidade: {
    name: 'Mentalidade Fixa',
    shortName: 'Mentalidade Fixa',
    definition: 'Rigidez de crenças e percepções memorizadas que impedem mudança e crescimento.',
    icon: 'lock',
  },
  clareza: {
    name: 'Falta de Clareza Mental',
    shortName: 'Clareza Mental',
    definition: 'Dificuldade de estar no momento presente, ruído mental e falta de direção.',
    icon: 'cloud',
  },
  autoimagem: {
    name: 'Autoimagem Desfavorável',
    shortName: 'Autoimagem',
    definition: 'Sentimento de inferioridade, baixa autoestima e busca constante por validação externa.',
    icon: 'user',
  },
  estrategia: {
    name: 'Estratégia Equivocada',
    shortName: 'Estratégia',
    definition: 'Uso de mecanismos de enfrentamento inadequados e ausência de método estruturado para alcançar metas.',
    icon: 'compass',
  },
};

export const TRAVA_KEYS = Object.keys(TRAVA_META);

// Mapeamento de IDs antigos → novos (compatibilidade com avaliações anteriores)
export const OLD_TO_NEW_ID: Record<string, string> = {
  cr1: 'CA1', cr2: 'CA2', cr3: 'CA3', cr4: 'CA4', cr5: 'CA5', cr6: 'CA6', cr7: 'CA7', cr8: 'CA8',
  ap1: 'EA1', ap2: 'EA2', ap3: 'EA3', ap4: 'EA4', ap5: 'EA5', ap6: 'EA6', ap7: 'EA7', ap8: 'EA8',
  di1: 'DI1', di2: 'DI2', di3: 'DI3', di4: 'DI4', di5: 'DI5', di6: 'DI6', di7: 'DI7', di8: 'DI8',
  em1: 'EE1', em2: 'EE2', em3: 'EE3', em4: 'EE4', em5: 'EE5', em6: 'EE6', em7: 'EE7', em8: 'EE8', em9: 'EE8',
  mf1: 'MF1', mf2: 'MF2', mf3: 'MF3', mf4: 'MF4', mf5: 'MF5', mf6: 'MF6', mf7: 'MF7', mf8: 'MF8',
  cl1: 'FC1', cl2: 'FC2', cl3: 'FC3', cl4: 'FC4', cl5: 'FC5', cl6: 'FC6', cl7: 'FC7', cl8: 'FC8',
  ai1: 'AD1', ai2: 'AD2', ai3: 'AD3', ai4: 'AD4', ai5: 'AD5', ai6: 'AD6', ai7: 'AD7', ai8: 'AD8',
  eq1: 'EQ1', eq2: 'EQ2', eq3: 'EQ3', eq4: 'EQ4', eq5: 'EQ5', eq6: 'EQ6', eq7: 'EQ7', eq8: 'EQ8',
  ctrl1: 'AT1', ctrl2: 'AT2', ctrl3: 'AT3', ctrl4: 'AT4', ctrl5: 'AT4',
};

// Versão do banco — incrementar quando mudar perguntas para invalidar estado salvo
export const QUESTIONS_VERSION = 7;

export const ALL_QUESTIONS: Question[] = [
  // ===== CRENÇAS AUTOLIMITANTES — CA1-CA8 =====
  { id: 'CA1', travaKey: 'crencas', text: 'Sinto que meu esforço nunca é reconhecido como deveria.' },
  { id: 'CA2', travaKey: 'crencas', text: 'Acredito que as pessoas não são confiáveis no fundo.' },
  { id: 'CA3', travaKey: 'crencas', text: 'Penso que preciso da aprovação dos outros para saber se estou no caminho certo.' },
  { id: 'CA4', travaKey: 'crencas', text: 'Tenho a sensação de que a vida é uma luta constante para conseguir as coisas.' },
  { id: 'CA5', travaKey: 'crencas', text: 'Acredito que ter muito sucesso ou dinheiro vem com um custo emocional alto demais.' },
  { id: 'CA6', travaKey: 'crencas', text: 'Sinto que não tenho todas as condições necessárias para começar algo novo agora.' },
  { id: 'CA7', travaKey: 'crencas', text: 'Tenho receio de que, se eu prosperar muito, posso afastar pessoas importantes da minha vida.' },
  { id: 'CA8', travaKey: 'crencas', text: 'Tenho dificuldade em acreditar que mereço coisas boas sem muito sacrifício.' },

  // ===== ESTRATÉGIAS DE AUTOPROTEÇÃO — EA1-EA8 =====
  { id: 'EA1', travaKey: 'autoprotecao', text: 'Quando alguém se aproxima emocionalmente, sinto vontade de me afastar.' },
  { id: 'EA2', travaKey: 'autoprotecao', text: 'Eu costumo sentir que preciso fazer tudo perfeito, senão não vale a pena.' },
  { id: 'EA3', travaKey: 'autoprotecao', text: 'Evito conflitos a todo custo, mesmo quando preciso me posicionar.' },
  { id: 'EA4', travaKey: 'autoprotecao', text: 'Prefiro fazer tudo sozinho(a) a depender de alguém e me decepcionar.' },
  { id: 'EA5', travaKey: 'autoprotecao', text: 'Tenho dificuldade em pedir ajuda mesmo quando estou sobrecarregado(a).' },
  { id: 'EA6', travaKey: 'autoprotecao', text: 'Costumo priorizar os outros a ponto de esquecer minhas próprias necessidades.' },
  { id: 'EA7', travaKey: 'autoprotecao', text: 'Sinto necessidade de controlar os detalhes para me sentir seguro(a).' },
  { id: 'EA8', travaKey: 'autoprotecao', text: 'Evito me expor emocionalmente por medo de ser julgado(a) ou rejeitado(a).' },

  // ===== DIÁLOGO INTERNO DISFUNCIONAL — DI1-DI8 =====
  { id: 'DI1', travaKey: 'dialogo', text: 'Frequentemente me pego pensando "eu não consigo" antes de tentar algo novo.' },
  { id: 'DI2', travaKey: 'dialogo', text: 'Costumo pensar "e se eu tivesse feito diferente" sobre decisões passadas.' },
  { id: 'DI3', travaKey: 'dialogo', text: 'Quando cometo um erro, me critico duramente por dias.' },
  { id: 'DI4', travaKey: 'dialogo', text: 'Digo para mim mesmo(a) que não vou dar conta antes mesmo de começar algo.' },
  { id: 'DI5', travaKey: 'dialogo', text: 'Tenho um diálogo interno mais duro comigo do que teria com um amigo na mesma situação.' },
  { id: 'DI6', travaKey: 'dialogo', text: 'Costumo antecipar mentalmente cenários de fracasso antes de agir.' },
  { id: 'DI7', travaKey: 'dialogo', text: 'Minha voz interna costuma apontar mais o que está errado do que o que está certo em mim.' },
  { id: 'DI8', travaKey: 'dialogo', text: 'Sinto que minha autocrítica me paralisa mais do que me ajuda a melhorar.' },

  // ===== ESTADOS EMOCIONAIS NÃO REGULADOS — EE1-EE8 =====
  { id: 'EE1', travaKey: 'emocional', text: 'A vergonha me impede de me expor ou mostrar quem realmente sou.' },
  { id: 'EE2', travaKey: 'emocional', text: 'Carrego mágoas e ressentimentos de situações que aconteceram há muito tempo.' },
  { id: 'EE3', travaKey: 'emocional', text: 'O medo me paralisa e me impede de agir, mesmo quando sei o que preciso fazer.' },
  { id: 'EE4', travaKey: 'emocional', text: 'Tenho dificuldade em controlar minha raiva quando me sinto injustiçado(a).' },
  { id: 'EE5', travaKey: 'emocional', text: 'A culpa aparece com frequência mesmo em situações em que não fiz nada de errado.' },
  { id: 'EE6', travaKey: 'emocional', text: 'Emoções intensas às vezes tomam conta de mim antes que eu perceba.' },
  { id: 'EE7', travaKey: 'emocional', text: 'Costumo reprimir o que sinto até explodir ou desabar de uma vez.' },
  { id: 'EE8', travaKey: 'emocional', text: 'Sinto que minhas emoções mudam de intensidade rapidamente e são difíceis de administrar.' },

  // ===== MENTALIDADE FIXA — MF1-MF8 =====
  { id: 'MF1', travaKey: 'mentalidade', text: 'Quando recebo uma crítica, sinto que estão atacando quem eu sou.' },
  { id: 'MF2', travaKey: 'mentalidade', text: 'Evito desafios novos porque tenho medo de falhar e mostrar incompetência.' },
  { id: 'MF3', travaKey: 'mentalidade', text: 'Penso que as pessoas de sucesso têm um dom natural que eu não tenho.' },
  { id: 'MF4', travaKey: 'mentalidade', text: 'Acredito que minhas capacidades são praticamente fixas, difíceis de mudar de verdade.' },
  { id: 'MF5', travaKey: 'mentalidade', text: 'Prefiro continuar fazendo do jeito que já sei a arriscar um método novo.' },
  { id: 'MF6', travaKey: 'mentalidade', text: 'Costumo desistir rápido quando algo exige muito esforço ou repetição.' },
  { id: 'MF7', travaKey: 'mentalidade', text: 'Vejo o erro como prova de incapacidade, não como parte natural do aprendizado.' },
  { id: 'MF8', travaKey: 'mentalidade', text: 'Tenho dificuldade em mudar de ideia mesmo diante de novas evidências ou argumentos.' },

  // ===== FALTA DE CLAREZA MENTAL — FC1-FC8 =====
  { id: 'FC1', travaKey: 'clareza', text: 'Minha mente está constantemente ocupada com pensamentos que dificultam minha concentração.' },
  { id: 'FC2', travaKey: 'clareza', text: 'Tenho dificuldade em definir o que realmente quero para minha vida.' },
  { id: 'FC3', travaKey: 'clareza', text: 'Costumo agir antes de ter clareza sobre a melhor direção a seguir.' },
  { id: 'FC4', travaKey: 'clareza', text: 'Sinto que vivo mais no piloto automático do que no momento presente.' },
  { id: 'FC5', travaKey: 'clareza', text: 'Tenho dificuldade de parar e simplesmente descansar a mente, mesmo por poucos minutos.' },
  { id: 'FC6', travaKey: 'clareza', text: 'Frequentemente começo várias coisas ao mesmo tempo sem aprofundar nenhuma delas.' },
  { id: 'FC7', travaKey: 'clareza', text: 'Sinto um ruído mental constante que dificulta minhas decisões do dia a dia.' },
  { id: 'FC8', travaKey: 'clareza', text: 'Raramente reservo um tempo do meu dia só para mim, sem estímulos externos.' },

  // ===== AUTOIMAGEM DESFAVORÁVEL — AD1-AD8 =====
  { id: 'AD1', travaKey: 'autoimagem', text: 'Sinto que sou inferior às pessoas ao meu redor na maioria das situações.' },
  { id: 'AD2', travaKey: 'autoimagem', text: 'Quando recebo um elogio, penso que a pessoa está sendo educada, não sincera.' },
  { id: 'AD3', travaKey: 'autoimagem', text: 'Tenho dificuldade em dizer não, mesmo quando sei que deveria.' },
  { id: 'AD4', travaKey: 'autoimagem', text: 'Busco constantemente a validação de outras pessoas sobre o que faço.' },
  { id: 'AD5', travaKey: 'autoimagem', text: 'Costumo me diminuir para não incomodar ou desagradar os outros.' },
  { id: 'AD6', travaKey: 'autoimagem', text: 'Tenho vergonha de expor minhas conquistas ou capacidades para os outros.' },
  { id: 'AD7', travaKey: 'autoimagem', text: 'Sinto que preciso me esforçar mais que os outros para ser aceito(a) ou valorizado(a).' },
  { id: 'AD8', travaKey: 'autoimagem', text: 'Priorizo o interesse das outras pessoas acima do meu, mesmo quando isso me prejudica.' },

  // ===== ESTRATÉGIA EQUIVOCADA — EQ1-EQ8 (somente padrão comportamental) =====
  { id: 'EQ1', travaKey: 'estrategia', text: 'Quando sinto uma dor emocional forte, recorro a algum comportamento só para me distrair ou aliviar, mesmo sabendo que não resolve o problema.' },
  { id: 'EQ2', travaKey: 'estrategia', text: 'Já percebi que uso algum hábito ou comportamento repetitivo como forma de fugir de sentimentos difíceis.' },
  { id: 'EQ3', travaKey: 'estrategia', text: 'Tenho metas claras, mas não tenho um método ou plano estruturado para alcançá-las.' },
  { id: 'EQ4', travaKey: 'estrategia', text: 'Costumo adiar ou abandonar meus objetivos por falta de um passo a passo definido.' },
  { id: 'EQ5', travaKey: 'estrategia', text: 'Sinto que minhas estratégias para lidar com o estresse às vezes criam mais problemas do que resolvem.' },
  { id: 'EQ6', travaKey: 'estrategia', text: 'Prefiro aliviar a tensão do momento a lidar com a causa real do meu desconforto.' },
  { id: 'EQ7', travaKey: 'estrategia', text: 'Já defini uma meta importante e não consegui sustentar um plano de ação por mais de algumas semanas.' },
  { id: 'EQ8', travaKey: 'estrategia', text: 'Quando fico sobrecarregado(a), recorro a comportamentos que sei que não me fazem bem no longo prazo, só para aliviar a pressão do momento.' },

  // ===== CONTROLES DE ATENÇÃO — AT1-AT4 =====
  { id: 'AT1', travaKey: 'controle', text: 'Para confirmar que você está lendo com atenção, selecione "Concordo" nesta pergunta.' },
  { id: 'AT2', travaKey: 'controle', text: 'Esta é uma pergunta de controle — selecione "Neutro" para continuar.' },
  { id: 'AT3', travaKey: 'controle', text: 'Confirme que está atento(a) selecionando "Discordo" nesta afirmação.' },
  { id: 'AT4', travaKey: 'controle', text: 'Pergunta de verificação: selecione "Concordo totalmente" para prosseguir.' },
];

export const LIKERT_LABELS = [
  'Discordo totalmente',
  'Discordo',
  'Neutro',
  'Concordo',
  'Concordo totalmente',
];

// Retorna a lista de perguntas com IDs normalizados (converte IDs antigos para novos)
export function normalizeAnswers(answers: Record<string, number>): Record<string, number> {
  const normalized: Record<string, number> = {};
  for (const [key, value] of Object.entries(answers)) {
    const newKey = OLD_TO_NEW_ID[key] ?? key;
    // Se já existe com o novo ID, não sobrescrever
    if (!(newKey in normalized)) {
      normalized[newKey] = value;
    }
  }
  return normalized;
}

// Embaralha perguntas de forma determinística por seed
export function shuffleQuestions(seed: number): Question[] {
  const travas = ALL_QUESTIONS.filter((q: Question) => q.travaKey !== 'controle');
  const controls = ALL_QUESTIONS.filter((q: Question) => q.travaKey === 'controle');

  // Simple seeded shuffle (Fisher-Yates com seed)
  const shuffled = [...travas];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Inserir controles a cada ~16 perguntas (64 itens / 4 controles)
  const result: Question[] = [];
  let ctrlIdx = 0;
  for (let i = 0; i < shuffled.length; i++) {
    result.push(shuffled[i]);
    if ((i + 1) % 16 === 0 && ctrlIdx < controls.length) {
      result.push(controls[ctrlIdx]);
      ctrlIdx++;
    }
  }
  // Adicionar controles restantes no final se houver
  while (ctrlIdx < controls.length) {
    result.push(controls[ctrlIdx]);
    ctrlIdx++;
  }

  return result;
}
