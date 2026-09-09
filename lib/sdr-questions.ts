// Escala SDR (Sociabilidade / Dominância / Receptividade)
// Baseada nas 39 frases do modelo Chip R. Bell
// Cada frase: resposta de reação imediata, Likert 1-5

export interface SDRQuestion {
  id: string;
  text: string;
  dimension: 'sociabilidade' | 'dominancia' | 'receptividade';
}

export const SDR_QUESTIONS: SDRQuestion[] = [
  // SOCIABILIDADE (13)
  { id: 's1', dimension: 'sociabilidade', text: 'Gosto de estar rodeado(a) de pessoas em eventos sociais.' },
  { id: 's2', dimension: 'sociabilidade', text: 'Iniciar conversas com desconhecidos é algo natural para mim.' },
  { id: 's3', dimension: 'sociabilidade', text: 'Prefiro trabalhar em equipe do que sozinho(a).' },
  { id: 's4', dimension: 'sociabilidade', text: 'Faço amizades com facilidade em ambientes novos.' },
  { id: 's5', dimension: 'sociabilidade', text: 'Me sinto energizado(a) quando estou em grupo.' },
  { id: 's6', dimension: 'sociabilidade', text: 'Gosto de compartilhar histórias e experiências com os outros.' },
  { id: 's7', dimension: 'sociabilidade', text: 'Sou geralmente a pessoa que anima o ambiente.' },
  { id: 's8', dimension: 'sociabilidade', text: 'Evito situações de isolamento prolongado.' },
  { id: 's9', dimension: 'sociabilidade', text: 'Tenho facilidade em me adaptar a diferentes grupos sociais.' },
  { id: 's10', dimension: 'sociabilidade', text: 'Expressar minhas emoções publicamente é confortável para mim.' },
  { id: 's11', dimension: 'sociabilidade', text: 'Costumo ser procurado(a) para conversas e desabafos.' },
  { id: 's12', dimension: 'sociabilidade', text: 'Sinto necessidade de manter contato frequente com amigos.' },
  { id: 's13', dimension: 'sociabilidade', text: 'Me incomodo quando passo muito tempo sem interagir com pessoas.' },

  // DOMINÂNCIA (13)
  { id: 'd1', dimension: 'dominancia', text: 'Gosto de liderar e tomar a frente em projetos.' },
  { id: 'd2', dimension: 'dominancia', text: 'Tomo decisões com rapidez e confiança.' },
  { id: 'd3', dimension: 'dominancia', text: 'Não tenho medo de discordar de alguém, mesmo se for uma autoridade.' },
  { id: 'd4', dimension: 'dominancia', text: 'Costumo direcionar o rumo das conversas e reuniões.' },
  { id: 'd5', dimension: 'dominancia', text: 'Sinto-me confortável em posições de poder e responsabilidade.' },
  { id: 'd6', dimension: 'dominancia', text: 'Quando vejo algo errado, sou o(a) primeiro(a) a falar.' },
  { id: 'd7', dimension: 'dominancia', text: 'Prefiro dar ordens a recebê-las.' },
  { id: 'd8', dimension: 'dominancia', text: 'Tenho facilidade em influenciar a opinião dos outros.' },
  { id: 'd9', dimension: 'dominancia', text: 'Sou competitivo(a) e gosto de vencer desafios.' },
  { id: 'd10', dimension: 'dominancia', text: 'Assumo a responsabilidade quando ninguém mais o faz.' },
  { id: 'd11', dimension: 'dominancia', text: 'Minha opinião geralmente prevalece em discussões de grupo.' },
  { id: 'd12', dimension: 'dominancia', text: 'Não me intimidam com confrontos ou negociações difíceis.' },
  { id: 'd13', dimension: 'dominancia', text: 'Estabeleço metas ambiciosas e pressiono para alcançá-las.' },

  // RECEPTIVIDADE (13)
  { id: 'r1', dimension: 'receptividade', text: 'Sei ouvir com atenção, mesmo quando discordo.' },
  { id: 'r2', dimension: 'receptividade', text: 'Considero a opinião dos outros antes de tomar decisões.' },
  { id: 'r3', dimension: 'receptividade', text: 'Tenho facilidade em me colocar no lugar do outro.' },
  { id: 'r4', dimension: 'receptividade', text: 'Prefiro o consenso ao conflito.' },
  { id: 'r5', dimension: 'receptividade', text: 'Aceito feedback sem me sentir atacado(a).' },
  { id: 'r6', dimension: 'receptividade', text: 'Costumo adaptar meu comportamento para acomodar os outros.' },
  { id: 'r7', dimension: 'receptividade', text: 'Valorizo harmonia nas relações mais do que ter razão.' },
  { id: 'r8', dimension: 'receptividade', text: 'Sou paciente com pessoas que pensam diferente de mim.' },
  { id: 'r9', dimension: 'receptividade', text: 'Demonstro interesse genuíno pelas histórias dos outros.' },
  { id: 'r10', dimension: 'receptividade', text: 'Tenho facilidade em perdoar e seguir em frente.' },
  { id: 'r11', dimension: 'receptividade', text: 'Sou flexível quando os planos mudam inesperadamente.' },
  { id: 'r12', dimension: 'receptividade', text: 'Priorizo o bem-estar do grupo acima dos meus interesses.' },
  { id: 'r13', dimension: 'receptividade', text: 'Acolho diferentes pontos de vista como oportunidade de aprendizado.' },
];
