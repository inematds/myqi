import type { BatteryItem } from '../battery';

interface VerbalRaw {
  pair: [string, string];
  target: string;
  options: string[];
  correctIndex: number;
  relation: string;
  difficulty: number;
}

// Pool em PT-BR, relações variadas (sinônimo, antônimo, parte-todo, função, categoria)
const POOL: VerbalRaw[] = [
  { pair: ['quente', 'frio'], target: 'alto', options: ['baixo', 'grande', 'longe', 'rápido'], correctIndex: 0, relation: 'antônimo', difficulty: -1.5 },
  { pair: ['cão', 'late'], target: 'gato', options: ['mia', 'corre', 'come', 'dorme'], correctIndex: 0, relation: 'função', difficulty: -1.5 },
  { pair: ['pétala', 'flor'], target: 'folha', options: ['árvore', 'verde', 'caule', 'fruto'], correctIndex: 0, relation: 'parte-todo', difficulty: -1 },
  { pair: ['médico', 'hospital'], target: 'professor', options: ['escola', 'livro', 'aluno', 'caneta'], correctIndex: 0, relation: 'lugar', difficulty: -1 },
  { pair: ['feliz', 'alegre'], target: 'triste', options: ['melancólico', 'bravo', 'cansado', 'doente'], correctIndex: 0, relation: 'sinônimo', difficulty: -0.5 },
  { pair: ['caneta', 'escrever'], target: 'tesoura', options: ['cortar', 'segurar', 'desenhar', 'colar'], correctIndex: 0, relation: 'função', difficulty: -0.5 },
  { pair: ['polegar', 'mão'], target: 'dedo do pé', options: ['pé', 'perna', 'corpo', 'sapato'], correctIndex: 0, relation: 'parte-todo', difficulty: 0 },
  { pair: ['rosa', 'flor'], target: 'pardal', options: ['ave', 'voo', 'ninho', 'penas'], correctIndex: 0, relation: 'categoria', difficulty: 0 },
  { pair: ['fome', 'comer'], target: 'sede', options: ['beber', 'água', 'copo', 'seco'], correctIndex: 0, relation: 'causa-ação', difficulty: 0 },
  { pair: ['barco', 'água'], target: 'avião', options: ['ar', 'céu', 'asa', 'voar'], correctIndex: 0, relation: 'meio', difficulty: 0 },
  { pair: ['céu', 'nublado'], target: 'pessoa', options: ['triste', 'alegre', 'alta', 'magra'], correctIndex: 0, relation: 'estado', difficulty: 0.5 },
  { pair: ['livro', 'capítulo'], target: 'filme', options: ['cena', 'tela', 'ator', 'roteiro'], correctIndex: 0, relation: 'parte-todo', difficulty: 0.5 },
  { pair: ['arquiteto', 'projeto'], target: 'compositor', options: ['música', 'piano', 'orquestra', 'palco'], correctIndex: 0, relation: 'produto', difficulty: 0.5 },
  { pair: ['relógio', 'tempo'], target: 'termômetro', options: ['temperatura', 'calor', 'vidro', 'mercúrio'], correctIndex: 0, relation: 'medida', difficulty: 1 },
  { pair: ['silêncio', 'barulho'], target: 'escuridão', options: ['luz', 'sombra', 'noite', 'cor'], correctIndex: 0, relation: 'antônimo', difficulty: 1 },
  { pair: ['oásis', 'deserto'], target: 'ilha', options: ['oceano', 'praia', 'navio', 'palmeira'], correctIndex: 0, relation: 'contexto', difficulty: 1.5 },
  { pair: ['enxame', 'abelha'], target: 'matilha', options: ['lobo', 'caça', 'floresta', 'uivo'], correctIndex: 0, relation: 'coletivo', difficulty: 1.5 },
  { pair: ['frívolo', 'sério'], target: 'efêmero', options: ['duradouro', 'breve', 'fugaz', 'rápido'], correctIndex: 0, relation: 'antônimo', difficulty: 2 },
  { pair: ['epílogo', 'livro'], target: 'desfecho', options: ['história', 'enredo', 'capítulo', 'autor'], correctIndex: 0, relation: 'parte-final', difficulty: 2 },
  { pair: ['lacônico', 'palavras'], target: 'parco', options: ['recursos', 'tempo', 'gestos', 'ideias'], correctIndex: 0, relation: 'escassez', difficulty: 2.5 },
];

function shuffle<T>(arr: T[], r: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function genVerbal(seed: number, count: number): BatteryItem[] {
  const r = rng(seed);
  const pool = shuffle(POOL, r).slice(0, count);
  return pool.map((v, idx) => {
    // shuffle options keeping track of correct
    const correctText = v.options[v.correctIndex];
    const shuffled = shuffle(v.options, r);
    const newCorrect = shuffled.indexOf(correctText);
    return {
      id: `verb-${seed}-${idx}`,
      kind: 'verbal',
      difficulty: v.difficulty,
      data: { pair: v.pair, target: v.target, options: shuffled, relation: v.relation },
      correctAnswer: newCorrect,
    };
  });
}
