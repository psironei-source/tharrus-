// Tabela curada de nomes de padrão dominante
// Combinações das 2-3 travas com maior pontuação → nome de arquétipo

export interface PatternCombo {
  keys: string[]; // travas (ordem não importa)
  name: string;
  description: string; // frase curta para contextualizar
}

// Combinações mais estatisticamente prováveis, nomeadas com curadoria
export const CURATED_PATTERNS: PatternCombo[] = [
  // Duplas
  { keys: ['autoimagem', 'dialogo'], name: 'Perfeccionista Invisível', description: 'A autocrítica constante impede você de se ver com justiça' },
  { keys: ['autoimagem', 'autoprotecao'], name: 'Guardião(ã) Solitário(a)', description: 'Você protege os outros, mas se esquece de proteger a si' },
  { keys: ['crencas', 'mentalidade'], name: 'Prisioneiro(a) do Roteiro Antigo', description: 'Crenças e rigidez mental limitam a visão de novas possibilidades' },
  { keys: ['crencas', 'dialogo'], name: 'Narrador(a) do Impossível', description: 'A voz interior repete as crenças limitantes como verdades absolutas' },
  { keys: ['emocional', 'autoprotecao'], name: 'Vulcão Contido', description: 'Emoções intensas são guardadas a todo custo, até transbordar' },
  { keys: ['emocional', 'dialogo'], name: 'Tempestade Interior', description: 'Emoções intensas alimentam um diálogo interno destrutivo' },
  { keys: ['clareza', 'estrategia'], name: 'Navegante sem Bússola', description: 'Falta direção clara e o método para chegar onde quer' },
  { keys: ['clareza', 'mentalidade'], name: 'Pensador(a) em Círculos', description: 'A mente gira sem conseguir parar e definir um caminho' },
  { keys: ['estrategia', 'emocional'], name: 'Piloto Automático', description: 'Comportamentos de fuga são acionados automaticamente pela dor emocional' },
  { keys: ['autoprotecao', 'dialogo'], name: 'Blindado(a) Gentil', description: 'Você cuida de tudo e de todos, enquanto uma voz interior diz que não é suficiente' },
  { keys: ['crencas', 'autoimagem'], name: 'Espelho Distorcido', description: 'Crenças profundas deformam a imagem que você tem de si' },
  { keys: ['mentalidade', 'autoprotecao'], name: 'Controlador(a) Cauteloso(a)', description: 'A rigidez mental reforça a necessidade de manter tudo sob controle' },
  { keys: ['emocional', 'autoimagem'], name: 'Montanha-Russa Invisível', description: 'A autoestima oscila junto com as emoções, num ciclo exaustivo' },
  { keys: ['estrategia', 'autoprotecao'], name: 'Fugitivo(a) Estratégico(a)', description: 'Você sabe para onde quer ir, mas recorre a atalhos que não levam a lugar nenhum' },
  { keys: ['clareza', 'crencas'], name: 'Neblina das Certezas', description: 'Crenças limitantes turvam a capacidade de enxergar com clareza' },
  // Triplas mais comuns
  { keys: ['autoimagem', 'dialogo', 'autoprotecao'], name: 'Herói(na) Exausto(a)', description: 'Você cuida de todos, se cobra demais e esconde que também precisa de ajuda' },
  { keys: ['crencas', 'dialogo', 'mentalidade'], name: 'Arquiteto(a) de Muros', description: 'Crenças, voz interior e rigidez constroem barreiras que parecem invisíveis' },
  { keys: ['emocional', 'dialogo', 'autoimagem'], name: 'Maré Interna', description: 'Emoções, autocrítica e autoimagem se retroalimentam num ciclo intenso' },
  { keys: ['estrategia', 'clareza', 'mentalidade'], name: 'Motor Desalinhado', description: 'Tem energia e vontade, mas falta direção e método' },
  { keys: ['emocional', 'autoprotecao', 'autoimagem'], name: 'Âncora Emocional', description: 'Emoções pesadas, defesas ativas e baixa autoestima seguram você no lugar' },
  { keys: ['crencas', 'autoimagem', 'autoprotecao'], name: 'Sombra do Merecimento', description: 'Uma voz profunda diz que você não merece, e seus comportamentos confirmam' },
];

/**
 * Encontra o nome do padrão dominante com base nas travas de maior pontuação.
 * Tenta match com 3 travas, depois com 2. Retorna null se nenhum match.
 */
export function findPatternName(topTravaKeys: string[]): PatternCombo | null {
  if (topTravaKeys.length < 2) return null;
  
  // Tentar match com 3 travas
  if (topTravaKeys.length >= 3) {
    const top3 = topTravaKeys.slice(0, 3);
    for (const p of CURATED_PATTERNS) {
      if (p.keys.length === 3 && p.keys.every(k => top3.includes(k))) {
        return p;
      }
    }
  }
  
  // Tentar match com as 2 primeiras
  const top2 = topTravaKeys.slice(0, 2);
  for (const p of CURATED_PATTERNS) {
    if (p.keys.length === 2 && p.keys.every(k => top2.includes(k))) {
      return p;
    }
  }
  
  // Tentar match parcial (top 2 presentes em alguma tripla)
  for (const p of CURATED_PATTERNS) {
    if (p.keys.length === 3 && top2.every(k => p.keys.includes(k))) {
      return p;
    }
  }
  
  return null;
}
