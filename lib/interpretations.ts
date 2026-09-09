// Motor determinístico de interpretações personalizadas
// Textos por trava × faixa, sem chamada de LLM

import { ALL_QUESTIONS, TRAVA_META, type Question } from './questions';
import type { TravaScoreResult } from './scoring';

interface Interpretation {
  text: string;
  reflection: string;
  exercise: string;
}

const INTERPRETATIONS: Record<string, Record<string, Interpretation>> = {
  crencas: {
    baixa: {
      text: 'Suas crenças sobre si, os outros e a vida estão bastante equilibradas. Você demonstra uma boa base de confiança interna e uma visão realista do mundo ao seu redor.',
      reflection: 'Que tal usar essa clareza para ajudar alguém próximo que talvez esteja preso em crenças limitantes?',
      exercise: 'Escreva 3 crenças fortalecedoras que guiam suas decisões hoje e compartilhe com alguém de confiança.',
    },
    moderada: {
      text: 'Algumas crenças podem estar limitando seu potencial em certas áreas. É natural ter dúvidas sobre si mesmo(a), mas quando essas dúvidas viram verdades absolutas, elas travam seu avanço.',
      reflection: 'Observe durante a próxima semana quais pensamentos automáticos aparecem quando você enfrenta um desafio. Anote-os sem julgamento.',
      exercise: 'Identifique uma crença limitante que apareceu com frequência e escreva ao lado uma nova perspectiva, mais realista e acolhedora.',
    },
    alta: {
      text: 'Crenças profundamente enraizadas podem estar dominando a forma como você enxerga a si mesmo(a), suas relações e suas possibilidades. Isso não é culpa sua — essas crenças geralmente se formam em experiências passadas.',
      reflection: 'Quando surgir a próxima crença de "não sou capaz", pause e pergunte: essa é uma verdade absoluta ou é uma história que aprendi a contar para mim?',
      exercise: 'Faça o exercício do "Manifesto de Substituição": para cada crença limitante, escreva a crença oposta e leia em voz alta pela manhã durante 7 dias.',
    },
  },
  autoprotecao: {
    baixa: {
      text: 'Você parece lidar de forma saudável com situações de vulnerabilidade, sem recorrer excessivamente a mecanismos de defesa. Isso indica maturidade emocional.',
      reflection: 'Continue cultivando essa abertura — ela é uma força, não uma fraqueza.',
      exercise: 'Pratique delegar uma tarefa que normalmente faria sozinho(a) e observe como se sente.',
    },
    moderada: {
      text: 'Em certas situações, comportamentos de autoproteção podem estar se ativando sem que você perceba — como o perfeccionismo, o controle excessivo ou a evitação de conflitos.',
      reflection: 'Em qual área da sua vida você sente mais necessidade de "estar no controle"? O que aconteceria se você soltasse um pouco?',
      exercise: 'Escolha uma situação esta semana para se posicionar de forma diferente: delegue, aceite o imperfeito ou enfrente um pequeno conflito com empatia.',
    },
    alta: {
      text: 'Seus mecanismos de autoproteção estão bastante ativos. Comportamentos como evitação, perfeccionismo ou necessidade de controle podem estar consumindo muita energia e impedindo conexões genuínas.',
      reflection: 'Pergunte-se: o que eu estou protegendo com esses comportamentos? Qual é o medo por trás deles?',
      exercise: 'Escolha um comportamento protetor (perfeccionismo, evitação, controle) e pratique fazer o oposto por um dia. Anote o que sentiu.',
    },
  },
  dialogo: {
    baixa: {
      text: 'Seu diálogo interno parece ser predominantemente construtivo. Você consegue manter uma conversa interna que apoia, em vez de sabotar.',
      reflection: 'Aproveite essa qualidade para construir afirmações diárias que fortaleçam ainda mais essa voz interna positiva.',
      exercise: 'Crie um "mantra pessoal" de 1 frase que represente quem você quer ser e repita-o toda manhã.',
    },
    moderada: {
      text: 'Em determinados momentos, sua voz interior assume um tom crítico e limitante. Frases como "não consigo" ou "não sou suficiente" podem aparecer com alguma frequência.',
      reflection: 'Quando ouvir essa voz crítica, pergunte: eu falaria assim com alguém que amo?',
      exercise: 'Durante 3 dias, anote toda vez que perceber um pensamento autocrítico. Depois, reescreva cada um de forma mais gentil e realista.',
    },
    alta: {
      text: 'Seu diálogo interno está fortemente marcado por autocrítica e desqualificação. Essa voz não é "a verdade" — é um padrão aprendido que pode ser transformado com consciência e prática.',
      reflection: 'Imagine que essa voz crítica é de um personagem externo. Que nome você daria a ele(a)? Quando ele(a) falar, responda conscientemente.',
      exercise: 'Pratique o "Ciclo de Pensar e Sentir": 1) Anote o pensamento automático; 2) Identifique a emoção que ele gera; 3) Questione a veracidade; 4) Substitua por um pensamento mais equilibrado.',
    },
  },
  emocional: {
    baixa: {
      text: 'Você demonstra uma boa regulação emocional. Suas emoções parecem fluir sem dominá-lo(a), o que é sinal de inteligência emocional em ação.',
      reflection: 'Continue nutrindo essa consciência emocional — ela é uma das bases da saúde mental.',
      exercise: 'Reserve 5 minutos ao final do dia para identificar e nomear 3 emoções que sentiu. Esse hábito fortalece ainda mais sua regulação.',
    },
    moderada: {
      text: 'Algumas emoções podem estar se acumulando ou se manifestando de forma mais intensa do que o ideal. Raiva, medo, culpa ou tristeza podem estar influenciando suas decisões sem que você perceba.',
      reflection: 'Qual emoção aparece com mais frequência no seu dia? Em que momentos ela surge?',
      exercise: 'Experimente a técnica RAIN: Reconheça a emoção → Aceite-a → Investigue de onde vem → Não se identifique com ela.',
    },
    alta: {
      text: 'Emoções intensas e recorrentes podem estar dominando seu comportamento e dificultando sua tomada de decisão. Isso não é fraqueza — é sinal de que algo precisa de atenção.',
      reflection: 'Reconheça que sentir profundamente é uma qualidade, mas que regular essas emoções é um direito seu.',
      exercise: 'Pratique a pausa emocional: quando uma emoção forte surgir, conte até 10, respire profundamente 3 vezes e só então decida como agir.',
    },
  },
  mentalidade: {
    baixa: {
      text: 'Você demonstra uma mentalidade voltada para o crescimento. Está aberto(a) a aprender, mudar de ideia e encarar desafios como oportunidades.',
      reflection: 'Celebre sua capacidade de se reinventar — ela é um superpoder silencioso.',
      exercise: 'Escolha uma habilidade nova para aprender esta semana, mesmo que simples. O processo importa mais que o resultado.',
    },
    moderada: {
      text: 'Em algumas áreas, uma rigidez de pensamento pode estar limitando sua capacidade de adaptação. A mentalidade fixa nos faz acreditar que somos "assim e pronto".',
      reflection: 'Em qual área da sua vida você mais resiste a mudanças? O que teria a ganhar se flexibilizasse?',
      exercise: 'Troque "eu não consigo" por "eu ainda não aprendi". Pratique essa substituição durante uma semana inteira.',
    },
    alta: {
      text: 'Uma mentalidade fixa está fortemente presente, fazendo com que desafios sejam vistos como ameaças, e erros como provas de incapacidade. A boa notícia: a mentalidade é algo que se treina.',
      reflection: 'Lembre-se de algo que você não sabia fazer há 5 anos e hoje faz com facilidade. Isso prova que você pode aprender qualquer coisa.',
      exercise: 'Adote o "diário do ainda não": anote 1 coisa que ainda não sabe fazer e 1 passo pequeno para começar a aprender.',
    },
  },
  clareza: {
    baixa: {
      text: 'Você parece ter uma boa clareza sobre seus objetivos e consegue manter o foco no que é importante. O momento presente é seu aliado.',
      reflection: 'Continue cultivando práticas de presença — elas multiplicam resultados em todas as áreas.',
      exercise: 'Experimente 5 minutos de atenção plena (mindfulness) ao acordar: observe 3 coisas que vê, ouve e sente.',
    },
    moderada: {
      text: 'Um certo ruído mental pode estar dificultando sua capacidade de priorizar e tomar decisões com clareza. Excesso de informação e pensamentos acelerados são comuns nos dias de hoje.',
      reflection: 'O que mais consome sua energia mental durante o dia? É algo que você pode controlar?',
      exercise: 'Faça o exercício de "Ganho de Clareza": dedique 10 minutos para escrever, sem filtro, tudo que está na sua mente. Depois, circule os 3 itens mais importantes.',
    },
    alta: {
      text: 'A falta de clareza mental está significativamente presente. Dificuldade em focar, priorizar e agir com direção podem estar gerando um ciclo de frustração e sobrecarga.',
      reflection: 'Você não precisa de mais informação — precisa de mais silêncio interior para ouvir o que já sabe.',
      exercise: 'Comece cada manhã com uma única pergunta: "Qual é a ÚNICA coisa mais importante que preciso fazer hoje?" E faça-a primeiro.',
    },
  },
  autoimagem: {
    baixa: {
      text: 'Sua relação consigo mesmo(a) parece saudável. Você reconhece seu valor sem depender excessivamente da opinião dos outros.',
      reflection: 'Continue fortalecendo essa autoconfiança — ela irradia para todos ao seu redor.',
      exercise: 'Escreva uma "carta de reconhecimento" para si mesmo(a) listando 5 qualidades que admira em você.',
    },
    moderada: {
      text: 'Em certas situações, pode existir uma tendência a se desvalorizar ou buscar validação externa. A autoimagem é como um espelho — às vezes, ele está distorcido.',
      reflection: 'Qual conquista recente você minimizou ou atribuiu à sorte? O que isso diz sobre como se vê?',
      exercise: 'Toda noite, anote 1 coisa que fez bem durante o dia — não importa quão pequena. Faça isso por 21 dias.',
    },
    alta: {
      text: 'Uma autoimagem desfavorável pode estar afetando profundamente como você se relaciona consigo e com o mundo. Sentimentos de inferioridade e necessidade de validação são sinais de que há um trabalho importante a ser feito — e isso é possível.',
      reflection: 'Você merece se ver com os mesmos olhos gentis com que olha para quem ama.',
      exercise: 'Comece o "Espelho de Reconhecimento": olhe-se no espelho por 2 minutos e diga 3 coisas boas sobre quem você é — sem desviar o olhar.',
    },
  },
  estrategia: {
    baixa: {
      text: 'Você parece ter estratégias funcionais para lidar com desafios e um bom senso de método para alcançar seus objetivos.',
      reflection: 'Aproveite essa capacidade para refinar ainda mais seus métodos e ajudar outros no caminho.',
      exercise: 'Revise sua principal meta atual e identifique 1 melhoria no processo que pode implementar esta semana.',
    },
    moderada: {
      text: 'Pode haver momentos em que suas estratégias de enfrentamento não estão sendo as mais eficazes, ou em que falta um método claro para traduzir suas metas em ação.',
      reflection: 'Quando enfrenta um desafio, qual é sua primeira reação? Ela te aproxima ou te afasta da solução?',
      exercise: 'Escolha uma meta e crie um plano com 3 passos concretos, com prazos e responsáveis. Use a Bússola de Ação para organizar.',
    },
    alta: {
      text: 'Seus mecanismos de enfrentamento podem não estar sendo os mais adequados, e a ausência de um método estruturado pode estar gerando frustração. Reconhecer isso já é um passo corajoso.',
      reflection: 'Você está buscando alívio imediato ou soluções duradouras? Ambos são humanos, mas um deles constrói o futuro que você deseja.',
      exercise: 'Identifique um padrão de comportamento de fuga e substitua-o por uma ação construtiva de 5 minutos. Comece pequeno.',
    },
  },
};

// Gera o bloco de encaminhamento profissional (estrategia, emocional, autoimagem em alta)
const PROFESSIONAL_REFERRAL_BLOCKS: Record<string, string> = {
  estrategia: '💙 Se você percebe que alguns padrões de comportamento estão difíceis de mudar sozinho(a), saiba que buscar apoio especializado é um ato de coragem e autocuidado. Um(a) psicólogo(a), psiquiatra ou grupo de apoio pode oferecer ferramentas poderosas para essa jornada. Você não precisa caminhar sozinho(a).',
  emocional: '💙 Emoções intensas e frequentes merecem atenção especial. Considere conversar com um(a) profissional de saúde mental — psicólogo(a) ou psiquiatra — que pode ajudá-lo(a) a desenvolver estratégias de regulação emocional. Cuidar das suas emoções é cuidar de todo o seu ser.',
  autoimagem: '💙 Quando a forma como nos vemos causa sofrimento constante, é importante buscar apoio especializado. Um(a) psicólogo(a) pode ajudá-lo(a) a reconstruir uma relação mais saudável e amorosa consigo mesmo(a). Pedir ajuda é um sinal de força, não de fraqueza.',
};

export function getInterpretation(
  score: TravaScoreResult,
  allAnswers: Record<string, number>,
  questions: Question[]
): {
  mainText: string;
  reflection: string;
  exercise: string;
  topResponses: { questionText: string; value: number }[];
  professionalReferral: string | null;
} {
  const interp = INTERPRETATIONS?.[score.travaKey]?.[score.band];
  const mainText = interp?.text ?? 'Análise não disponível para esta combinação.';
  const reflection = interp?.reflection ?? '';
  const exercise = interp?.exercise ?? '';

  // Busca as perguntas que mais pesaram
  const topResponses = (score.topQuestionIds ?? []).map((qid: string) => {
    const q = questions.find((question: Question) => question.id === qid);
    return {
      questionText: q?.text ?? '',
      value: allAnswers?.[qid] ?? 0,
    };
  }).filter((r: { questionText: string; value: number }) => r.questionText !== '');

  // Verifica encaminhamento profissional
  let professionalReferral: string | null = null;
  if (score.band === 'alta' && PROFESSIONAL_REFERRAL_BLOCKS[score.travaKey]) {
    professionalReferral = PROFESSIONAL_REFERRAL_BLOCKS[score.travaKey];
  }

  return { mainText, reflection, exercise, topResponses, professionalReferral };
}

export function generateExecutiveSummary(scores: TravaScoreResult[]): string {
  const sorted = [...(scores ?? [])].sort((a: TravaScoreResult, b: TravaScoreResult) => b.normalized - a.normalized);
  const top = sorted?.[0];
  const second = sorted?.[1];
  const highCount = sorted.filter((s: TravaScoreResult) => s.band === 'alta').length;
  const lowCount = sorted.filter((s: TravaScoreResult) => s.band === 'baixa').length;

  if (!top) return 'Não foi possível gerar o resumo.';

  const topName = TRAVA_META?.[top.travaKey]?.name ?? top.travaKey;
  const secondName = second ? (TRAVA_META?.[second.travaKey]?.name ?? second.travaKey) : '';

  let summary = '';

  if (highCount === 0) {
    summary = `Parabéns! Seu mapeamento mostra que nenhuma trava está em nível crítico no momento. `;
    summary += `A trava com maior presença é "${topName}" (${top.normalized} pontos), mas está dentro de uma faixa administrável. `;
    summary += `Continue investindo no seu autoconhecimento — cada passo conta.`;
  } else if (highCount === 1) {
    summary = `Seu mapeamento revelou que a trava "${topName}" é a que mais influencia sua vida neste momento, com ${top.normalized} pontos. `;
    summary += second ? `Em seguida, "${secondName}" também merece atenção. ` : '';
    summary += `Focar nessa área pode trazer transformações significativas. Lembre-se: consciência já é o primeiro passo da mudança.`;
  } else {
    summary = `Seu mapeamento revelou ${highCount} travas em nível alto de influência. As mais significativas são "${topName}" (${top.normalized} pontos) e "${secondName}" (${second?.normalized ?? 0} pontos). `;
    summary += `É importante abordar essas áreas com gentileza e, se possível, com apoio profissional. `;
    summary += `Você já deu o passo mais importante: olhar para si com honestidade.`;
  }

  if (lowCount >= 5) {
    summary += ` Você também demonstra muita força em ${lowCount} áreas — reconheça e celebre isso!`;
  }

  return summary;
}
