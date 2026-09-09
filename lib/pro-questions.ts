// Banco de perguntas poderosas sugeridas por trava
// Usadas no Copiloto de Sessão para o profissional

export const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  crencas: [
    'Quando você ouve essa crença na sua cabeça, de quem é a voz original?',
    'Se essa crença não existisse, o que você faria de diferente amanhã?',
    'Qual evidência concreta você tem de que essa crença é verdade?',
    'Que crença você gostaria de colocar no lugar?',
    'Como seria sua vida daqui a 5 anos se essa crença perdesse força?',
  ],
  autoprotecao: [
    'O que você está protegendo quando age dessa forma?',
    'Se você deixasse o controle de lado nessa situação, o que de pior poderia acontecer?',
    'Em que momento da sua vida esse comportamento começou a fazer sentido?',
    'Qual seria uma forma mais leve de se proteger nessa situação?',
    'O que você ganharia se abrisse mão desse padrão?',
  ],
  dialogo: [
    'Quando esse diálogo aparece, como ele afeta suas decisões?',
    'Se um amigo dissesse essas mesmas coisas para você, como reagiria?',
    'Qual seria uma resposta mais gentil que você poderia dar a si mesmo(a)?',
    'Em que momentos do dia esse diálogo fica mais forte?',
    'O que você diria a alguém que ama que estivesse pensando isso de si?',
  ],
  emocional: [
    'Quando essa emoção aparece com força, o que ela está tentando comunicar?',
    'Se essa emoção pudesse falar, o que ela diria que precisa?',
    'Em que parte do seu corpo você sente essa emoção com mais intensidade?',
    'Qual é o gatilho mais comum dessa emoção no seu dia a dia?',
    'O que você já tentou e funcionou para regular essa emoção?',
  ],
  mentalidade: [
    'Em que áreas da sua vida você sente que as coisas "sempre foram assim"?',
    'Se existisse uma possibilidade que você nunca considerou, qual seria?',
    'O que precisaria mudar para você acreditar que pode ser diferente?',
    'Qual foi a última vez que você mudou de opinião sobre algo importante?',
    'O que as pessoas ao seu redor diriam que você se recusa a ver?',
  ],
  clareza: [
    'Se tivesse total clareza neste momento, qual seria seu próximo passo?',
    'O que está ocupando espaço na sua mente que não depende de você?',
    'Se pudesse simplificar tudo em uma única prioridade agora, qual seria?',
    'O que está impedindo você de enxergar com nitidez?',
    'De 0 a 10, quão presente você está neste momento?',
  ],
  autoimagem: [
    'Quando você se olha no espelho interno, o que vê?',
    'O que você faz de bom que quase nunca reconhece?',
    'Se um elogio genuíno viesse agora, você conseguiria recebê-lo?',
    'De quem você busca aprovação com mais frequência?',
    'O que mudaria se você se tratasse como trata alguém que ama?',
  ],
  estrategia: [
    'Quando a dor aparece, qual é o primeiro impulso que surge?',
    'O que você faz para lidar com a dor — e como se sente depois?',
    'Se tivesse um método claro para alcançar seu objetivo, o que seria diferente?',
    'O que está faltando entre saber o que fazer e realmente fazer?',
    'Qual seria um primeiro passo mínimo que você poderia dar hoje?',
  ],
};

export const SESSION_PHASES = [
  { key: 'sinergia', name: 'Construção de Sinergia', sessions: '1-2', description: 'Estabelecer vínculo, confiança e alinhamento de expectativas.' },
  { key: 'plano', name: 'Plano de Trabalho', sessions: '3-4', description: 'Inventário Pessoal, Sistema 10-4-1, formulção de objetivos.' },
  { key: 'desenvolvimento', name: 'Desenvolvimento e Ações', sessions: '5+', description: 'Bússola, Diálogo Interior, Mapeamento Cruzado — priorizando as travas mais críticas.' },
  { key: 'conclusao', name: 'Conclusão', sessions: 'Última', description: 'Avaliação mensal, reaplicação do diagnóstico, medição de evolução.' },
];

export const TOOLS_BY_PHASE: Record<string, string[]> = {
  sinergia: ['Escala SDR', 'Valores Essenciais', 'Diagnóstico das 8 Travas'],
  plano: ['Sistema 10-4-1', 'Bússola de Ação', 'Inventário Pessoal'],
  desenvolvimento: ['Diálogo Interior', 'Mapeamento Cruzado de Crenças', 'Ciclo de Pensar e Sentir', 'Bússola de Ação'],
  conclusao: ['Reavaliação das 8 Travas', 'Radar Comparativo', 'Plano de Continuidade'],
};
