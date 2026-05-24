import type { BatteryItem } from '../battery';

interface VerbalRaw {
  pair: [string, string];
  target: string;
  options: string[];
  correctIndex: number;
  relation: string;
  difficulty: number;
}

// Pool de ~70 analogias em PT-BR, balanceadas por relação e dificuldade.
// Por convenção: correctIndex = 0 (a primeira opção é a correta); embaralhamos depois.
const POOL: VerbalRaw[] = [
  // === FÁCIL (-1.5 a -1.0): antônimos básicos, funções diretas, partes óbvias ===
  { pair: ['quente', 'frio'], target: 'alto', options: ['baixo', 'grande', 'longe', 'rápido'], correctIndex: 0, relation: 'antônimo', difficulty: -1.5 },
  { pair: ['cão', 'late'], target: 'gato', options: ['mia', 'corre', 'come', 'dorme'], correctIndex: 0, relation: 'som-animal', difficulty: -1.5 },
  { pair: ['dia', 'noite'], target: 'claro', options: ['escuro', 'cinza', 'tarde', 'sol'], correctIndex: 0, relation: 'antônimo', difficulty: -1.5 },
  { pair: ['rápido', 'lento'], target: 'forte', options: ['fraco', 'pesado', 'magro', 'duro'], correctIndex: 0, relation: 'antônimo', difficulty: -1.5 },
  { pair: ['cheio', 'vazio'], target: 'aberto', options: ['fechado', 'amplo', 'largo', 'limpo'], correctIndex: 0, relation: 'antônimo', difficulty: -1.5 },
  { pair: ['sol', 'dia'], target: 'lua', options: ['noite', 'estrela', 'céu', 'mar'], correctIndex: 0, relation: 'associação', difficulty: -1.5 },
  { pair: ['vaca', 'leite'], target: 'galinha', options: ['ovo', 'asa', 'penas', 'ninho'], correctIndex: 0, relation: 'produto', difficulty: -1.5 },
  { pair: ['lápis', 'escrever'], target: 'pincel', options: ['pintar', 'colorir', 'desenhar', 'apagar'], correctIndex: 0, relation: 'função', difficulty: -1.5 },
  { pair: ['martelo', 'prego'], target: 'chave de fenda', options: ['parafuso', 'porca', 'madeira', 'caixa'], correctIndex: 0, relation: 'ferramenta-alvo', difficulty: -1 },
  { pair: ['pétala', 'flor'], target: 'folha', options: ['árvore', 'verde', 'caule', 'fruto'], correctIndex: 0, relation: 'parte-todo', difficulty: -1 },
  { pair: ['médico', 'hospital'], target: 'professor', options: ['escola', 'livro', 'aluno', 'caneta'], correctIndex: 0, relation: 'profissional-lugar', difficulty: -1 },
  { pair: ['piloto', 'avião'], target: 'motorista', options: ['carro', 'estrada', 'volante', 'gasolina'], correctIndex: 0, relation: 'profissional-veículo', difficulty: -1 },
  { pair: ['pão', 'padaria'], target: 'remédio', options: ['farmácia', 'doença', 'médico', 'receita'], correctIndex: 0, relation: 'produto-lugar', difficulty: -1 },
  { pair: ['leão', 'felino'], target: 'tubarão', options: ['peixe', 'água', 'oceano', 'dente'], correctIndex: 0, relation: 'categoria', difficulty: -1 },

  // === MÉDIO-FÁCIL (-0.5 a 0): sinônimos, partes, causas ===
  { pair: ['feliz', 'alegre'], target: 'triste', options: ['melancólico', 'bravo', 'cansado', 'doente'], correctIndex: 0, relation: 'sinônimo', difficulty: -0.5 },
  { pair: ['caneta', 'escrever'], target: 'tesoura', options: ['cortar', 'segurar', 'desenhar', 'colar'], correctIndex: 0, relation: 'função', difficulty: -0.5 },
  { pair: ['começar', 'iniciar'], target: 'terminar', options: ['finalizar', 'parar', 'sair', 'cancelar'], correctIndex: 0, relation: 'sinônimo', difficulty: -0.5 },
  { pair: ['enorme', 'grande'], target: 'minúsculo', options: ['pequeno', 'curto', 'fino', 'leve'], correctIndex: 0, relation: 'sinônimo-intensidade', difficulty: -0.5 },
  { pair: ['fogo', 'queimar'], target: 'gelo', options: ['derreter', 'congelar', 'esfriar', 'quebrar'], correctIndex: 0, relation: 'estado-ação', difficulty: -0.5 },
  { pair: ['inverno', 'frio'], target: 'verão', options: ['calor', 'praia', 'férias', 'sol'], correctIndex: 0, relation: 'estação-clima', difficulty: -0.5 },
  { pair: ['polegar', 'mão'], target: 'dedo do pé', options: ['pé', 'perna', 'corpo', 'sapato'], correctIndex: 0, relation: 'parte-todo', difficulty: 0 },
  { pair: ['rosa', 'flor'], target: 'pardal', options: ['ave', 'voo', 'ninho', 'penas'], correctIndex: 0, relation: 'categoria', difficulty: 0 },
  { pair: ['fome', 'comer'], target: 'sede', options: ['beber', 'água', 'copo', 'seco'], correctIndex: 0, relation: 'causa-ação', difficulty: 0 },
  { pair: ['barco', 'água'], target: 'avião', options: ['ar', 'céu', 'asa', 'voar'], correctIndex: 0, relation: 'meio', difficulty: 0 },
  { pair: ['chuva', 'guarda-chuva'], target: 'sol', options: ['óculos escuros', 'praia', 'calor', 'sombra'], correctIndex: 0, relation: 'problema-solução', difficulty: 0 },
  { pair: ['fumaça', 'fogo'], target: 'cinza', options: ['lenha', 'churrasco', 'preto', 'morto'], correctIndex: 0, relation: 'resultado-causa', difficulty: 0 },
  { pair: ['página', 'livro'], target: 'tecla', options: ['teclado', 'computador', 'letra', 'dedo'], correctIndex: 0, relation: 'parte-todo', difficulty: 0 },
  { pair: ['carpinteiro', 'madeira'], target: 'pedreiro', options: ['tijolo', 'casa', 'cimento', 'construção'], correctIndex: 0, relation: 'profissional-material', difficulty: 0 },

  // === MÉDIO (0.5 a 1.0): relações abstratas, medidas, antônimos sofisticados ===
  { pair: ['céu', 'nublado'], target: 'pessoa', options: ['preocupada', 'alegre', 'alta', 'magra'], correctIndex: 0, relation: 'estado-paralelo', difficulty: 0.5 },
  { pair: ['livro', 'capítulo'], target: 'filme', options: ['cena', 'tela', 'ator', 'roteiro'], correctIndex: 0, relation: 'parte-todo', difficulty: 0.5 },
  { pair: ['arquiteto', 'projeto'], target: 'compositor', options: ['música', 'piano', 'orquestra', 'palco'], correctIndex: 0, relation: 'produtor-produto', difficulty: 0.5 },
  { pair: ['retangular', 'forma'], target: 'azul', options: ['cor', 'tinta', 'céu', 'mar'], correctIndex: 0, relation: 'instância-categoria', difficulty: 0.5 },
  { pair: ['vacina', 'doença'], target: 'corretivo', options: ['erro', 'papel', 'caneta', 'cor'], correctIndex: 0, relation: 'prevenção/correção', difficulty: 0.5 },
  { pair: ['curto', 'breve'], target: 'longo', options: ['demorado', 'comprido', 'esticado', 'amplo'], correctIndex: 0, relation: 'sinônimo-tempo', difficulty: 0.5 },
  { pair: ['relógio', 'tempo'], target: 'termômetro', options: ['temperatura', 'calor', 'vidro', 'mercúrio'], correctIndex: 0, relation: 'instrumento-medida', difficulty: 1 },
  { pair: ['silêncio', 'barulho'], target: 'escuridão', options: ['luz', 'sombra', 'noite', 'cor'], correctIndex: 0, relation: 'antônimo-sensorial', difficulty: 1 },
  { pair: ['hipótese', 'teoria'], target: 'esboço', options: ['obra finalizada', 'tinta', 'tela', 'arte'], correctIndex: 0, relation: 'rascunho-versão final', difficulty: 1 },
  { pair: ['violino', 'corda'], target: 'flauta', options: ['sopro', 'metal', 'música', 'banda'], correctIndex: 0, relation: 'instrumento-mecanismo', difficulty: 1 },
  { pair: ['gota', 'oceano'], target: 'grão', options: ['deserto', 'praia', 'areia', 'pedra'], correctIndex: 0, relation: 'unidade-conjunto', difficulty: 1 },
  { pair: ['julgar', 'juiz'], target: 'curar', options: ['médico', 'paciente', 'remédio', 'doença'], correctIndex: 0, relation: 'ação-profissional', difficulty: 1 },
  { pair: ['vento', 'mover'], target: 'gravidade', options: ['atrair', 'pesar', 'cair', 'subir'], correctIndex: 0, relation: 'força-efeito', difficulty: 1 },
  { pair: ['veneno', 'antídoto'], target: 'problema', options: ['solução', 'erro', 'dúvida', 'pergunta'], correctIndex: 0, relation: 'mal-remédio', difficulty: 1 },

  // === MÉDIO-DIFÍCIL (1.5): coletivos, contexto, vocabulário moderado ===
  { pair: ['oásis', 'deserto'], target: 'ilha', options: ['oceano', 'praia', 'navio', 'palmeira'], correctIndex: 0, relation: 'exceção-contexto', difficulty: 1.5 },
  { pair: ['enxame', 'abelha'], target: 'matilha', options: ['lobo', 'caça', 'floresta', 'uivo'], correctIndex: 0, relation: 'coletivo', difficulty: 1.5 },
  { pair: ['cardume', 'peixe'], target: 'rebanho', options: ['ovelha', 'pasto', 'lã', 'fazenda'], correctIndex: 0, relation: 'coletivo', difficulty: 1.5 },
  { pair: ['relâmpago', 'trovão'], target: 'causa', options: ['efeito', 'razão', 'origem', 'motivo'], correctIndex: 0, relation: 'precede-segue', difficulty: 1.5 },
  { pair: ['ouro', 'metal'], target: 'mogno', options: ['madeira', 'árvore', 'móvel', 'marrom'], correctIndex: 0, relation: 'instância-material', difficulty: 1.5 },
  { pair: ['arquivar', 'documento'], target: 'arquivar (cancelar)', options: ['plano', 'pasta', 'gaveta', 'fila'], correctIndex: 0, relation: 'polissemia', difficulty: 1.5 },
  { pair: ['poupar', 'gastar'], target: 'construir', options: ['demolir', 'reformar', 'pintar', 'projetar'], correctIndex: 0, relation: 'antônimo-ação', difficulty: 1.5 },
  { pair: ['ânsia', 'desejo'], target: 'pavor', options: ['medo', 'fobia', 'noite', 'monstro'], correctIndex: 0, relation: 'intensidade-emoção', difficulty: 1.5 },

  // === DIFÍCIL (2.0+): vocabulário avançado, abstrações sutis ===
  { pair: ['frívolo', 'sério'], target: 'efêmero', options: ['duradouro', 'breve', 'fugaz', 'rápido'], correctIndex: 0, relation: 'antônimo-abstrato', difficulty: 2 },
  { pair: ['epílogo', 'livro'], target: 'desfecho', options: ['história', 'enredo', 'capítulo', 'autor'], correctIndex: 0, relation: 'parte-final', difficulty: 2 },
  { pair: ['preâmbulo', 'discurso'], target: 'prólogo', options: ['romance', 'epílogo', 'capítulo', 'autor'], correctIndex: 0, relation: 'introdução-obra', difficulty: 2 },
  { pair: ['anômalo', 'norma'], target: 'herético', options: ['dogma', 'crença', 'igreja', 'livro'], correctIndex: 0, relation: 'desvio-padrão', difficulty: 2 },
  { pair: ['mitigar', 'agravar'], target: 'aliviar', options: ['piorar', 'doer', 'curar', 'tratar'], correctIndex: 0, relation: 'antônimo-ação', difficulty: 2 },
  { pair: ['avesso', 'direito'], target: 'inverso', options: ['oposto', 'igual', 'paralelo', 'reverso'], correctIndex: 0, relation: 'sinônimo-direção', difficulty: 2 },
  { pair: ['placebo', 'efeito'], target: 'mirage', options: ['ilusão', 'deserto', 'sede', 'visão'], correctIndex: 0, relation: 'aparência-falsa', difficulty: 2 },
  { pair: ['lacônico', 'palavras'], target: 'parco', options: ['recursos', 'tempo', 'gestos', 'ideias'], correctIndex: 0, relation: 'escassez', difficulty: 2.5 },
  { pair: ['perspicaz', 'observação'], target: 'sagaz', options: ['percepção', 'sentido', 'visão', 'ouvido'], correctIndex: 0, relation: 'sinônimo-cognição', difficulty: 2.5 },
  { pair: ['exíguo', 'amplo'], target: 'parco', options: ['abundante', 'cheio', 'farto', 'sortido'], correctIndex: 0, relation: 'antônimo-quantidade', difficulty: 2.5 },
  { pair: ['catalisar', 'reação'], target: 'fomentar', options: ['desenvolvimento', 'origem', 'fim', 'pausa'], correctIndex: 0, relation: 'acelerar', difficulty: 2.5 },
  { pair: ['efêmero', 'perene'], target: 'transitório', options: ['permanente', 'frágil', 'breve', 'leve'], correctIndex: 0, relation: 'antônimo-duração', difficulty: 2.5 },
  { pair: ['cisma', 'unidade'], target: 'discórdia', options: ['harmonia', 'briga', 'paz', 'silêncio'], correctIndex: 0, relation: 'antônimo-social', difficulty: 3 },
  { pair: ['inexorável', 'evitável'], target: 'inevitável', options: ['evitável', 'fácil', 'optativo', 'opcional'], correctIndex: 0, relation: 'antônimo-modal', difficulty: 3 },
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
